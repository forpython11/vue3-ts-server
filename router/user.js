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

module.exports = router
