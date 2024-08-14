/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */
// 引入用户模型
const UsersModel = require('../model/user');
const UserRolesModel = require('../model/user_roles')
const RolesModel = require('../model/roles');
// 1. 导入需要的验证规则对象
const {
    user_login_schema,
    add_user_schema,
    get_list,
    update_user_schema,
    delete_user_schema
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
// sequelize的Op模块 https://www.sequelize.cn/core-concepts/model-querying-basics
// 它可以用来执行一些sql操作，例如[Op.and]相当于数据库连接语句的and，[Op.or]相当于or等
const { Op } = require('sequelize');


const tools = require('../utils/tools');
const sequelize = require('../model/init.js');
const UsresRolesModel = require('../model/user_roles.js');
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
exports.addUser = (req, res, next) => {
    // 验证入参，错误时抛出以捕获
    const { error, value } = add_user_schema.validate(req.body);
    if (error) {
        return next(error)
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
            // 将添加的用户设置为可用
            value.status = 1;
            const result = UsersModel.addUser(value);
            result.then(function (ret) {
                if (ret) {
                    return res.send({
                        code: 0,
                        message: '新增成功',
                        data: ret
                    });
                }
                return res.send({
                    code: 1,
                    message: ret,
                    data: null
                });
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

// 获取用户列表分页参数和接口字段
// next函数主要是用来确保所有注册的中间件被一个接一个的执行
exports.getList = (req, res, next) => {
    const { value, error } = get_list.validate(req.query)
    if (error) {
        return next(error)
    }
    // 接收前端参数
    let { pageSize, currentPage } = req.query;
    limit = pageSize ? Number(pageSize) : 10;
    offset = currentPage ? Number(currentPage) : 1;
    offset = (offset - 1) * pageSize;
    const { username, nickname, email, status } = value
    let where = {};
    if (username)
        where.username = { [Op.like]: `%${username}%` }
    if (nickname) where.nickname = nickname
    if (email) where.email = email
    if (status === '0' || status === '1')
        where.status = { [Op.eq]: status }
    UsersModel.findAndCountAll({
        // 预先加载是一次查询多个模型(一个"主"模型和一个或多个关联模型)的数据的行为. 在 SQL 级别上,这是具有一个或多个 join 的查询
        // 在 Sequelize 中,主要通过在模型查找器查询中使用 include 参数(例如,findOne, findAll 等)来完成预先加载
        // https://www.sequelize.cn/advanced-association-concepts/eager-loading
        attributes: { exclude: ['password'] },
        include: [{ model: RolesModel }],
        distinct: true,
        offset: offset,
        limit: limit,
        where: where
    }).then(function (users) {
        return res.send({
            code: 0,
            message: '获取成功',
            data: users
        })
    })
}

// 编辑用户信息
exports.editUser = (req, res) => {
    const user_id = req.params.id;
    const { value, error } = update_user_schema.validate(req.body);
    if (error) throw error;
    UsersModel.findAll({
        where: {
            // [Op.and]相当于数据库连接语句的and，[Op.or]相当于or等
            [Op.and]: {
                user_id: {
                    // [Op.ne]: 20,  != 20
                    [Op.ne]: user_id
                },
                username: {
                    // [Op.eq]: 3, = 3
                    [Op.eq]: value.username
                }
            },
        }
    }).then((result) => {
        if (result && result.length)
            return res.send({
                code: 1,
                message: '用户名被占用，请更换后重试',
                data: null
            })
        else {
            const result = UsersModel.update(value, {
                where: {
                    user_id: user_id
                }
            });
            result.then(function (ret) {
                if (ret) {
                    return res.send({
                        code: 0,
                        message: '更改成功',
                        data: ret
                    })
                } else {
                    return res.send({
                        code: 1,
                        message: ret,
                        data: null
                    });
                }
            })
        }
    })
}

// 修改用户的方法
exports.updateUser = async function (user_id, data) {
    // 开启事务
    const t = await sequelize.transaction();
    try {
        // 获得修改时间
        data.update_time = new Date();
        // 先更新用户
        await UsersModel.update(data, {
            where: {
                user_id: user_id
            }
        });
        // 再得到用户角色表表中此用户的角色id
        const user_roles = await UserRolesModel.findAll({
            where: { user_id: user_id }
        })
        // 将表中获得的角色id转换为数组
        const role_ids = user_roles.map((item) => {
            return item.role_id
        })
        // 新加的角色加到用户角色表中
        const add_role_ids = tools.minustArr(data.role_ids, role_ids)
        const add_users_roles = add_role_ids.map((role_id) => {
            return {
                user_id: user_id, role_id: role_id
            }
        })
        // 批量加入
        await UserRolesModel.bulkCreate(add_users_roles)
        // 删除角色从用户角色表删除
        const del_role_ids = tools.minustArr(role_ids, data.role_ids);
        if (del_role_ids && del_role_ids.length > 0) {
            await UserRolesModel.destroy({
                where: {
                    user_id: user_id,
                    role_id: del_role_ids
                }
            });
            t.commit();
            return true;
        }
    } catch (error) {
        t.rollback();
        return e.message;
    }
}

// 删除用户接口
exports.deleteUser = (req, res, next) => {
    const { value, error } = delete_user_schema.validate(req.body)
    if (error) {
        return next(error)
    }
    const user_ids = value.user_ids
    if ((user_ids.length && user_ids.includes(1)) || user_ids === 1)
        return res.send({
            code: 1,
            message: '超级管理员测试账号不可删除',
            data: null
        })
    UsersModel.delUser(user_ids || []).then(function (user) {
        if (user !== true) {
            return res.send({
                code: 1,
                message: '删除失败',
                data: null
            })
        }
        return res.send({
            code: 0,
            message: '删除成功',
            data: user
        })
    })
}

// 根据用户id获取用户信息
exports.getUserinfoById = (req, res) => {
    UsersModel.findOne({
        attributes: { exclude: ['password'] },
        include: [{ model: RolesModel }], // 预先加载角色模型
        where: {
            user_id: user_id
        }
    }).then((user) => {
        if (!user) {
            res.send({
                code: 1,
                message: '用户不存在',
                data: null
            })
        } else {
            res.send({
                code: 0,
                message: '获取成功',
                data: user
            })
        }
    })
}
