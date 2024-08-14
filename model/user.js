/*
 * @Date: 2024-04-19 14:03:26
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 10:33:08
 * @FilePath: \vue3-ts-server\model\user.js
 * @Description: cxx
 */
const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('./init');

// 导入角色模型
const RolesModel = require('./roles')
// 导入用户角色模型
const UserRolesModel = require('./user_roles');

// 定义表的模型 define方法第一个参数为表名，第二个参数为表字段对象  
const UsersModel = sequelize.define('users', {
    user_id: {
        // 数据类型
        type: Sequelize.INTEGER,
        // 主键
        primaryKey: true,
        // 自增
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING(255)
    },
    nickname: {
        type: Sequelize.STRING(255)
    },
    password: {
        type: Sequelize.CHAR(32)
    },
    user_pic: {
        type: Sequelize.TEXT
    },
    status: {
        type: Sequelize.TINYINT(4),
        defaultValue: 0
    },
    update_time: {
        type: Sequelize.DATE,
        // 格式化日期时间戳
        get() {
            return this.getDataValue('update_time')
                ? moment(this.getDataValue('update_time')).format('YYYY-MM-DD HH:mm:ss')
                : null;
        }
    },
    create_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
            return moment(this.getDataValue('create_time')).format('YYYY-MM-DD HH:mm:ss');
        }
    }
});
/**
 * 添加用户角色方法应当有两个操作： 1.添加用户的信息，2.在用户角色表添加用户的角色信息。
 * 但这里有一个问题，万一我们添加用户信息成功了，但添加用户的角色没有成功，添加用户信息是否是错误的、不应该的？
 * 所以下面的代码我用到了sequelize的事务的概念。
 * 这里要是有一个操作没有成功就会回滚（即所有操作都不做），要所有操作都成功才提交。 
 * */
// 添加用户的方法
UsersModel.addUser = async function (data) {
    // 首先，开启一个事务并将其保存到变量中
    const t = await sequelize.transaction();
    try {
        // 调用事务用作参数传递
        // 添加用户
        const user = await UsersModel.create(data);
        // 遍历前端传递来的用户角色id并添加到用户角色表
        const user_roles = data.role_ids.map(function (role_id) {
            return {
                user_id: user.user_id,
                role_id: role_id
            };
        });
        // bulkCreate 创建多条记录
        await UserRolesModel.bulkCreate(user_roles);
        // 如果执行到此行,且没有引发任何错误.
        // 提交事务
        t.commit();
        return true
    } catch {
        // 如果执行到达此行,则抛出错误.
        // 回滚事务.
        await t.rollback();
    }
}

// 用户是属于多个角色的，通过用户角色模型来联结。所以我们用belongsToMany方法 
// https://www.sequelize.cn/core-concepts/assocs#%E4%B8%80%E5%AF%B9%E5%A4%9A%E5%85%B3%E7%B3%BB
UsersModel.belongsToMany(RolesModel, {
    through: {
        model: UserRolesModel
    },
    foreignKey: 'user_id',
    otherKey: 'role_id'
})

UsersModel.delUser = async function (user_ids) {
    const t = await sequelize.transaction();
    try {
        await UsersModel.destroy({
            where: { user_id: user_ids }
        });
        await UserRolesModel.destroy({
            where: { user_id: user_ids }
        });
        t.commit();
        return true;
    } catch (e) {
        t.rollback();
        return false;
    }
};

// 导出用户映射模型
module.exports = UsersModel;
