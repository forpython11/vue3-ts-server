/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */
// 引入用户模型
const UsersModel = require('../model/user');

// 1. 导入需要的验证规则对象
const {
    user_login_schema,
    add_user_schema,
} = require('../schema/user');
// 导入bcryptjs加密模块（添加用户时为密码加密）
const bcrypt = require('bcryptjs');

// 引入生成图形验证码库
const svgCaptcha = require('svg-captcha')
// 引入封装好的redis
const redis = require('../utils/redis.js');
// 引入封装好的token模块和配置信息
const { addToken, decodedToken, verifyToken } = require('../utils/token');
const key = require('../config/index');

// 登录路由的处理函数
exports.login = async (req, res) => {
    const { error, value } = user_login_schema.validate(req.body);
    if (error) {
        throw error;
    }
    const { username, password, checkCode, uuid } = value
    const captcha = await redis.getKey(uuid);

    if (!captcha) {
        return res.send({
            code: 1,
            message: '图形验证码已过期，请点击图片刷新'
        });
    }
    if (checkCode.toLowerCase() !== captcha.toLowerCase()) {
        return res.send({
            code: 1,
            message: '图形验证码不正确，请重新输入'
        });
    }


    // 查询数据库用户信息是否存在密码是否正确
    UsersModel.findOne({
        where: {
            username: username
        }
    }).then((result) => {
        console.log(result, 'result')
        if (!result) {
            /*
             * 返回体格式
             * code：0为成功、1为失败
             * message：接口返回信息描述
             * data：接口数据
             */
            return res.send({
                code: 1,
                message: '用户不存在',
                data: null
            });
        } else {
            // 通过bcrypt库的compareSync进行解密比较
            const compareResult = bcrypt.compareSync(password, result.password);
            if (compareResult) {
                // 用浏览器可识别的固定格式生成token
                const token =
                    'Bearer ' + addToken({ id: result.user_id, username: result.username }, key.jwtSecretKey, key.secretKeyExpire);
                // 生成长时refreshToken
                const refreshToken = addToken(
                    { id: result.user_id, username: result.username },
                    key.jwtRefrechSecretKey,
                    key.refreshSerectKeyExpire
                );
                return res.send({
                    code: 0,
                    message: '登录成功',
                    data: {
                        token,
                        refreshToken
                    }
                });
            } else {
                return res.send({
                    code: 1,
                    message: '密码错误',
                    data: ''
                });
            }
        }
    });
};

// 添加用户的处理函数 用户名判断是否重复否则对密码进行加密加入数据库
exports.addUser = (req, res) => {
    // 验证入参，错误时抛出以捕获
    const { error, value } = add_user_schema.validate(req.body);
    if (error) {
        throw error;
    }
    // 查询是否存在相同用户名
    UsersModel.findAll({
        where: {
            username: value.username
        }
    }).then((result) => {
        if (result && result.length)
            return res.send({
                code: 1,
                message: '用户名被占用，请更换后重试！',
                data: null
            });
        else {
            const password = value.password;
            // 加密
            value.password = bcrypt.hashSync(password, 10);
            const result = UsersModel.create(value);
            result.then(function (ret) {
                if (ret) {
                    return res.send({
                        code: 0,
                        message: '新增成功',
                        data: ret
                    });
                } else {
                    return res.send({
                        code: 1,
                        message: ret,
                        data: null
                    });
                }
            });
        }
    });
};

/**
 * 获取图形验证码
 */
exports.getCheckCode = (req, res) => {
    console.log(req, res, '000')
    // 生成验证码，获取catcha，有{data,text}两个属性，data为svg格式图片、text为验证码
    const captcha = svgCaptcha.create({
        size: 4,
        ignoreChars: '0o1l',
        color: true,
        noise: 6,
        background: '#cc9966',
        height: 32,
        width: 100
    });
    // 测试
    console.log(captcha)
    // 验证码键和缓存时间
    const uuid = req.query.uuid;
    const effectTime = 10 * 60;
    // 存入redis
    redis
        .setKey(uuid, captcha.text.toLowerCase(), effectTime)
        .then((result) => {
            if (result) {
                res.setHeader('Content-Type', 'image/svg+xml;charset=utf-8');
                res.send({
                    code: 0,
                    message: '获取验证码成功',
                    data: captcha.data
                });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.send({
                code: 1,
                message: '验证码获取失败',
                data: null
            });
        });
};

/**
 * 刷新token
 * @param {*} req 
 * @param {*} res 
 */
exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;
    // 验证 refreshToken 1:通过
    let _res = verifyToken(refreshToken);
    if (_res === 1) {
        // 对refreshToken进行解码获得id、username
        let { id, username } = decodedToken(refreshToken);
        // 生成新的token
        const token = 'Bearer ' + addToken({ id, username }, key.jwtSecretKey, key.secretKeyExpire);
        res.send({
            code: 0,
            message: '获取成功',
            data: {
                token,
                refreshToken
            }
        });
    } else {
        res.send({
            code: 500,
            message: _res.message
        });
    }
};


