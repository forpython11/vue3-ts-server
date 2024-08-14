/*
 * @Date: 2024-08-14 11:11:02
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 13:24:31
 * @FilePath: \vue3-ts-server\router\role.js
 * @Description: cxx
 */

const express = require('express');
// 创建路由对象
const router = express.Router();
const roleHandler = require('../router_handler/role');

// 添加角色
router.post('/addRole', roleHandler.addRole);

// 删除角色路由
router.post('/delRole', roleHandler.deleteRole);

module.exports = router