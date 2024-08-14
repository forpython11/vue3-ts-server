/*
 * @Date: 2024-04-16 17:24:56
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 15:25:02
 * @FilePath: \vue3-ts-server\router\user.js
 * @Description: cxx
 */
const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const userHandler = require('../router_handler/user')

// 登录
router.post('/login', userHandler.login)

// 添加用户接口
router.post('/addUser', userHandler.addUser);

// 获取登录验证码
router.get('/checkCode', userHandler.getCheckCode);

// 刷新token
router.post('/refreshToken', userHandler.refreshToken);

// 获取用户列表
router.get('/list', userHandler.getList)

// 修改用户信息
router.post('/editUser/:id', userHandler.editUser)

// 删除用户
router.post('/delUser', userHandler.deleteUser);

module.exports = router
