/*
 * @Date: 2024-08-14 18:21:22
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 18:34:02
 * @FilePath: \vue3-ts-server\router\menu.js
 * @Description: cxx
 */

const express = require('express');
// 创建路由对象
const router = express.Router();
const handler = require('../router_handler/menu')

// 获取菜单列表
router.get('/listMenu', handler.getMenuList);

// 添加菜单
router.post('/addMenu', handler.addMenu)

module.exports = router