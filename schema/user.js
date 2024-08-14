/*
 * @Date: 2024-04-22 11:03:03
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-13 18:40:32
 * @FilePath: \vue3-ts-server\schema\user.js
 * @Description: cxx
 */
let joi = require('joi');
// 允许未设置规则的未知键
joi = joi.defaults((schema) =>
    schema.options({
        allowUnknown: true
    })
);
/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为 undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 * email 邮箱校验
 */
// 用户名的校验规则
const username = joi.string().alphanum().min(1).max(10).required();
// 密码的验证规则
const password = joi
    .string()
    .pattern(/^[\S]{6,12}$/)
    .required();
const checkCode = joi.string().alphanum().min(4).max(4).required();
const uuid = joi.number().required();
const nickname = joi.string().alphanum().min(1).max(10).required();
const pageSize = joi.number().required()
const currentPage = joi.number().required()
const status = joi.number().valid(0, 1)
const email = joi.string().email()
// 数组中的项必须是数字
const role_ids = joi.array().items(joi.number()).required();
// 登录表单的验证规则对象
exports.user_login_schema = joi.object().keys({
    username,
    password,
    checkCode,
    uuid
});
// 校验添加用户入参
exports.add_user_schema = joi.object().keys({
    username,
    password,
    nickname,
    role_ids
});

// 校验分页参数
exports.get_list = joi.object().keys({
    pageSize,
    currentPage,
    status
})

// 更新用户信息
exports.update_user_schema = joi.object().keys({
    username,
    status,
    nickname,
    email,
    role_ids     // 角色id数组
})