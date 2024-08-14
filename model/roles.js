/*
 * @Date: 2024-08-13 16:13:43
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 14:33:15
 * @FilePath: \vue3-ts-server\model\roles.js
 * @Description: cxx
 */

const Sequelize = require('sequelize')
const moment = require('moment')
const sequelize = require('./init')
const UserRolesModel = require('./user_roles');
// 定义表的模型
const RolesModel = sequelize.define('roles', {
    role_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    role_name: {
        type: Sequelize.STRING(255)
    },
    remark: {
        type: Sequelize.STRING(255)
    },
    status: {
        type: Sequelize.TINYINT,
        defaultValue: 0
    },
    update_time: {
        type: Sequelize.DATE,
        get() {
            return this.getDataValue('update_time') ? moment(this.getDataValue('update_time')).format('YYYY-MM-DD HH:mm:ss')
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
})

// 删除角色的方法
RolesModel.delRole = async function (role_ids) {
    const t = await sequelize.transaction();
    try {
        // 删除角色中 角色id数组的角色
        await RolesModel.destroy({
            where: {
                role_id: role_ids
            }
        })
        // 删除用户角色表中角色id数组的角色记录
        await UserRolesModel.destroy({
            where: {
                role_id: role_ids
            }
        })
        t.commit()
        return true
    } catch (error) {
        t.rollback()
        return false
    }
}
module.exports = RolesModel;