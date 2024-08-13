// 导入 express 模块
const express = require("express")
// 创建 express 的服务器实例
const app = express()

// write your code here...
// 导入 cors 中间件
const cors = require('cors')
// 将 cors 注册为全局中间件
app.use(cors())

const bodyParser = require('body-parser');
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

// 导入注册用户路由参数
const userRouter = require('./router/user')
app.use('/user', userRouter)

// 此段代码要放置在路由之后才可捕获到错误
// 导入验证规则中间件
const joi = require('joi');
// 定义错误级别的中间件
app.use((err, req, res, next) => {
    // 数据验证失败
    if (err instanceof joi.ValidationError) return res.send({ code: 1, message: err.message });
    // token解析失败
    if (err.name == 'UnauthorizedError') return res.send({ code: 401, message: '身份认证失败' })
    // 未知错误
    return res.send({ code: 500, message: err });
});

// 导入配置文件
const config = require('./config/index')
// 解析token的中间件
const expressJWT = require('express-jwt')
// 使用.unless({path:[/^/api//]})指定哪些接口不需要token验证
app.use(
    expressJWT({ secret: config.jwtSecretKey }).unless({ path: ['/user/login', '/user/checkCode', '/user/refreshToken'] })
)

// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(8888, function () {
    console.log('api server running at http://127.0.0.1:8888')
})

