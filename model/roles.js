/*
 * @Date: 2024-08-13 16:13:43
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-19 16:46:22
 * @FilePath: \vue3-ts-server\model\roles.js
 * @Description: cxx
 */

const Sequelize = require('sequelize')
const moment = require('moment')
const sequelize = require('./init')
const UserRolesModel = require('./user_roles');
const RolesMenusModel = require('./roles_menus');
const MenusModel = require('./menus');

const tools = require('../utils/tools')
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

// 获取角色
RolesModel.getResource = async function (role_id) {
    const t = await sequelize.transaction();
    try {
        // 所有按钮id
        let permIds = [];
        // 获取就角色菜单表中此角色id所有记录
        const roleResource = await RolesMenusModel.findAll({
            where: {
                role_id: role_id
            }
        });
        // 获得此角色id拥有的权限id
        const all_menu_ids = roleResource.map((resource) => {
            return resource.menu_id;
        })
        // 从菜单表获取此角色拥有的权限
        const all_menus = await MenusModel.findAll({
            where: {
                menu_id: all_menu_ids
            },
            attributes: ['menu_id', 'parent_id', 'type', 'permission']
        });
        // 获取目录及菜单id
        const menu_arr = all_menus.filter((menu) => menu.type === 'M' || menu.type === 'C')
        const menu_ids = menu_arr.map((menu) => menu.menu_id)
        // 将获取的按钮数组转化为对应的格式
        const btn_arr = all_menus.filter((menu) => menu.type === 'B');
        btn_arr.forEach((button) => {
            permIds.push(button.menu_id)
        });
        t.commit()
        return {
            menu_ids,
            btn_arr,
            permIds
        };
    } catch (error) {
        t.rollback();
        return false;
    }
}

// 更新角色
RolesModel.updateResource = async function (role_id, menu_ids) {
    const t = await sequelize.transaction();
    try {
        // 先找到所有菜单表对应角色id拥有的权限
        const roles_menus = await RolesMenusModel.findAll({
            where: {
                role_id: role_id
            }
        });
        // 将id转成数组
        const old_menu_ids = roles_menus.map(function (item) {
            return item.menu_id
        });
        // 新加的权限加入菜单
        const add_menu_ids = tools.minustArr(menu_ids, old_menu_ids);
        const add_roles_menu = add_menu_ids.map((menu_id) => {
            return { role_id, menu_id }
        });
        // 批量添加
        await RolesMenusModel.bulkCreate(add_roles_menu);
        // 删除的也同步删除角色菜单里的数据
        const del_menu_ids = tools.minustArr(old_menu_ids, menu_ids);
        if (del_menu_ids && del_menu_ids.length) {
            await RolesMenusModel.destroy({
                where: {
                    role_id: role_id,
                    menu_id: del_menu_ids
                }
            })
        };
        t.commit();
        return true;
    } catch (error) {
        t.rollback()
        return error.message;
    }
}

// 建立关联
RolesModel.belongsToMany(MenusModel, {
    through: {
        model: RolesMenusModel
    },
    foreignKey: 'role_id',
    otherKey: 'menu_id'
});

module.exports = RolesModel;