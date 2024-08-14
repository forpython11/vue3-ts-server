/*
 * @Date: 2024-08-13 17:17:33
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 14:32:53
 * @FilePath: \vue3-ts-server\model\user_roles.js
 * @Description: cxx
 */

const Sequelize = require('sequelize')
const moment = require('moment')
const sequelize = require('./init')

// 定义表的模型
const UsreRolesModel = sequelize.define('users_roles', {
    user_role_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    role_id: {
        type: Sequelize.INTEGER
    },
    user_id: {
        type: Sequelize.INTEGER
    },
    create_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
            return moment(this.getDataValue('create_time')).format('YYYY-MM-DD HH:mm:ss')
        }
    }
})

module.exports = UsreRolesModel
