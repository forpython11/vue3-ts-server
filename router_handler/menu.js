/*
 * @Date: 2024-08-14 18:22:56
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 18:40:18
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