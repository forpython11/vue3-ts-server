/*
 * @Date: 2024-08-14 18:22:56
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-20 18:27:58
 * @FilePath: \vue3-ts-server\router_handler\menu.js
 * @Description: cxx
 */

const MenusModel = require('../model/menus');
const Sequlize = require('sequelize');
const Op = Sequlize.Op;

// 导入需要验证规则的对象
const { add_menu_schema, edit_menu_schema, delete_menu_schema, get_menu_schema } = require('../schema/menus');
exports.addMenu = (req, res) => {
    // 校验入参
    const { value, error } = add_menu_schema.validate(req.body);
    if (error) throw error;
    // 创建数据库条目
    MenusModel.create(value).then(function (menu) {
        // 返回信息
        if (!menu) {
            return res.send({
                code: 1,
                message: '创建失败',
                data: null
            });
        }
        return res.send({
            code: 0,
            message: '创建成功',
            data: menu.menu_id
        });
    })
}

// 获取菜单列表
exports.getMenuList = (req, res) => {
    MenusModel.getListTree(req.query).then(function (menuTree) {
        return res.send({
            code: 0,
            message: '获取成功',
            data: menuTree || []
        });
    });
};

// 将菜单格式化为{value,label}格式，递归
function filterRouters(routers) {
    const res = [];
    routers.forEach((item) => {
        // 目录菜单是否有子菜单
        if (item.children) {
            // 检查子菜单是否包含按钮类型
            if (item.children.some((item) => item.type === 'B')) {
                const perms = [];
                const children = [];
                // 按钮perms存储 菜单children存储
                item.children.forEach((_item) => {
                    if (item.type === 'B') {
                        perms.push({
                            value: _item.menu_id,
                            label: _item.title,
                            permission: _item.permission
                        });
                    } else {
                        children.push(_item);
                    }
                });
                const menuItem = {
                    value: item.menu_id,
                    label: item.title,
                    children: children || undefined,
                    perms: perms || undefined
                };
                // 继续递归判断菜单下是否还有孩子
                if (menuItem.children && menuItem.children.length) {
                    menuItem.children = filterRouters(menuItem.children)
                };
                res.push(menuItem);
            }
            // 子菜单不存在按钮
            else {
                const menuItem = {
                    value: item.menu_id,
                    label: item.title,
                    children: item.children || undefined
                };
                // 继续递归判断菜单下是否有孩子
                if (menuItem.children && menuItem.children.length) {
                    menuItem.children = filterRouters(menuItem.children);
                };
                res.push(menuItem)
            }
        }
        // 不存在子菜单
        else {
            const menuItem = {
                value: item.menu_id,
                label: item.title
            };
            res.push(menuItem);
        }
    });
    return res;
}

// 获取菜单项
exports.getMenuOptions = (req, res) => {
    MenusModel.getListTree(req.query).then(function (menuTree) {
        const filterTree = filterRouters(menuTree);
        return res.send({
            code: 0,
            message: '获取成功',
            data: filterTree || []
        })
    })
}