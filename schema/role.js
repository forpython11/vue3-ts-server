/*
 * @Date: 2024-08-14 11:00:44
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 15:58:03
 * @FilePath: \vue3-ts-server\schema\role.js
 * @Description: cxx
 */
const joi = require('joi')
/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为 undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 */
// 角色名校验规则
const role_name = joi.string().min(1).max(10).required();
// id nickname email的校验规则
const role_id = joi.number().integer().min(0).required();
const remark = joi.string();
const status = joi.number().valid(0, 1);
// 角色id数组
const role_ids = joi.array().items(joi.number()).required();
// 分页参数
const pageSize = joi.number().required();
const currentPage = joi.number().required();

// 添加角色的验证规则对象
exports.add_role_schema = joi.object().keys({
    // 对res.body验证
    role_name,
    remark,
    status
})

// 获取角色的验证对象
exports.get_role_list_schema = joi.object().keys({
    role_name: joi.string().min(1).max(10),
    pageSize,
    currentPage
})

// 修改角色的验证规则对象
exports.edit_role_schema = joi.object().keys({
    role_name,
    remark,
    status,
    role_id
})

// 删除角色的验证规则对象
exports.delete_role_schema = joi.object().keys({
    role_ids
});

// 获取单角色的验证规则对象
exports.get_role_schema = joi.object().keys({
    // 对query参数进行验证
    role_id
});