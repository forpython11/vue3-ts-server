/*
 * @Date: 2024-08-14 11:16:31
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-19 15:20:40
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
        console.log(role, 'role')
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

// 分页获取角色列表
exports.getList = (req, res, next) => {
    const { value, error } = get_role_list_schema.validate(req.query)
    if (error) {
        return next(error)
    }
    // 接收前端参数
    let { pageSize, currentPage } = req.query;
    limit = pageSize ? Number(pageSize) : 10;
    offset = currentPage ? Number(currentPage) : 1;
    offset = (offset - 1) * pageSize;
    const { role_name, status } = value
    let where = {};
    // Op.like  包含role_name
    if (role_name)
        where.role_name = { [Op.like]: `%${role_name}%` }
    if (status) where.status = { [Op.eq]: status }

    RoleModel.findAndCountAll({
        offset: offset,
        limit: limit,
        where: where
    }).then(function (roles) {
        return res.send({
            code: 0,
            message: '获取成功',
            data: roles
        })
    })
}

// 编辑角色根据ID
exports.editRole = (req, res, next) => {
    const { value, error } = edit_role_schema.validate(req.body)
    if (error) return next(error)
    value.update_time = new Date()
    RoleModel.update(value, {
        where: {
            role_id: value.role_id
        }
    }).then(function (role) {
        if (!role) {
            return res.send({
                code: 1,
                message: '修改失败',
                data: null
            })
        }
        return res.send({
            code: 0,
            message: '修改成功',
            data: role
        })
    })
}

// 分配角色资源
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 菜单数组menu_ids和按钮数组permIds
 */
exports.updateResource = (req, res) => {
    const role_id = req.query.role_id;
    const data = req.body;
    const all_ids = data.menu_ids.concat(data.permIds);
    RoleModel.updateResource(role_id, all_ids).then(function (resource) {
        if (resource !== true) {
            return res.send({
                code: 1,
                message: '修改失败',
                data: null
            });
        }
        return res.send({
            code: 0,
            message: '修改成功',
            data: resource
        });
    });
}

// 获取角色
exports.getRoleResource = (req, res) => {
    const role_id = req.query.role_id;
    RoleModel.getResource(role_id).then((resource) => {
        if (!resource) {
            return res.send({
                code: 1,
                message: '获取失败',
                data: null
            })
        }
        return res.send({
            code: 0,
            message: '获取成功',
            data: resource
        })
    })
}