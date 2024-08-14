/*
 * @Date: 2024-08-14 11:11:02
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 15:42:05
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

// 分页获取角色列表
router.get('/listRole', roleHandler.getList)

// 编辑角色
router.post('/editRole',roleHandler.editRole)

module.exports = router