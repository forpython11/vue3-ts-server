/*
 * @Date: 2024-08-14 16:08:01
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 18:02:59
 * @FilePath: \vue3-ts-server\model\menus.js
 * @Description: cxx
 */
const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('./init');
const { Op } = Sequelize;

const tools = require('../utils/tools')
// 定义表的模型
const MenusModel = sequelize.define('menus', {
    menu_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,//主键
        autoIncrement: true//自增
    },
    parent_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    title: {
        type: Sequelize.STRING(255),
        defaultValue: ''
    },
    sort: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    type: {
        type: Sequelize.CHAR(1),
        defaultValue: 'C'
    },
    icon: {
        type: Sequelize.STRING(255)
    },
    name: {
        type: Sequelize.STRING(255)
    },
    component: {
        type: Sequelize.STRING(255)
    },
    path: {
        type: Sequelize.STRING(255)
    },
    permission: {
        type: Sequelize.STRING(255)
    },
    redirect: {
        type: Sequelize.STRING(255)
    },
    hidden: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
    },
    update_time: {
        type: Sequelize.DATE,
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

// 获得权限的树状数据结构
MenusModel.getListTree = async function (where = {}) {
    let menus = [];
    // 查询数据库获取原数据
    // 有标题入参时
    if (where.title) {
        menus = await MenusModel.findAll({
            where: {
                title: {
                    [Op.like]: `%${where.title}%`
                }
            },
            order: [['sort']]//sort升序排列
        })
    } else {
        menus = await MenusModel.findAll({
            order: [['sort']]
        })
    }
    // 将原数据转成单纯的数据集
    const menusArr = menus.map((item) => {
        // 如果plain为true,则sequelize将仅返回结果集的第一条记录. 如果是false,它将返回所有记录.
        return item.get({ plain: true })
    })
    // 将数据集转换成树状结构
    return tools.getTreeData(menusArr, null, 'menu_id')
}
// 导出菜单模型
module.exports = MenusModel;
