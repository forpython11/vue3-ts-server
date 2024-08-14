/*
 * @Date: 2024-08-14 11:16:31
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-14 14:28:40
 * @FilePath: \vue3-ts-server\router_handler\role.js
 * @Description: cxx
 */

const RoleModel = require('../model/roles')
// 导入需要的验证规则对象
const {
    get_role_list_schema,
    add_role_schema,
    edit_role_schema,
    delete_role_schema,
    get_role_schema
} = require('../schema/role')

// 添加角色接口
exports.addRole = (req, res) => {
    const { value, error } = add_role_schema.validate(req.body);
    if (error) throw error;
    RoleModel.create(value).then(function (role) {
        if (!role) {
            return res.send({
                code: 1,
                message: '创建失败',
                data: null
            })
        }
        return res.send({
            code: 0,
            message: '创建成功',
            data: role
        })
    })
}

// 删除路由角色
exports.deleteRole = (req, res) => {
    const { value, error } = delete_role_schema.validate(req.body);
    if (error) throw error
    const role_ids = value.role_ids;
    if ((role_ids.length && role_ids.includes(1)) || role_ids === 1)
        return res.send({
            code: 1,
            message: '超级管理员角色不可删除',
            data: null
        })
    RoleModel.delRole(role_ids || []).then(function (role) {
        console.log(role,'role')
        if (role !== true) {
            return res.send({
                code: 1,
                message: '删除失败',
                data: null
            })
        }
        return res.send({
            code: 0,
            message: '删除成功',
            data: role
        })
    })

}