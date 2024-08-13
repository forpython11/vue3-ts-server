/*
 * @Date: 2024-04-19 14:03:26
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-13 17:52:23
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

// 用户是属于多个角色的，通过用户角色模型来联结。所以我们用belongsToMany方法 
// https://www.sequelize.cn/core-concepts/assocs#%E4%B8%80%E5%AF%B9%E5%A4%9A%E5%85%B3%E7%B3%BB
UsersModel.belongsToMany(RolesModel, {
    through: {
        model: UserRolesModel
    },
    foreignKey: 'user_id',
    otherKey: 'role_id'
})

// 导出用户映射模型
module.exports = UsersModel;
