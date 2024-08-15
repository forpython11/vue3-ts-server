let joi = require('joi');
joi = joi.defaults((schema) =>
    schema.options({
        allowUnknown: true
    })
)
/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为 undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 */
// 菜单的校验规则
const title = joi.string().required();
const name = joi.string().alphanum().required();
// 正则匹配相对路径，在顶级菜单的时候允许为字符串Layout
const component = joi.string().allow('Layout')
const path = joi.string();
const sort = joi.number().min(0).required();
const redirect = joi.string().pattern(/^\/[^\s]*$/);
const permission = joi.string().alphanum();
const menu_id = joi.number().integer().min(0).required();
const parent_id = joi.number().integer().min(0).required();
const hidden = joi.number().valid(0, 1);
const type = joi.string().valid('M', 'B', 'C');

// 菜单的验证规则对象
exports.add_menu_schema = joi.object().keys({
    parent_id,
    title,
    sort,
    type,
    name,
    component,
    path,
    redirect,
    permission,
    hidden
});

exports.edit_menu_schema = joi.object().keys({
    parent_id,
    title,
    sort,
    type,
    name,
    component,
    path,
    redirect,
    permission,
    hidden
});

exports.delete_menu_schema = joi.object().keys({
    menu_id
});

exports.get_menu_schema = joi.object().keys({
    menu_id
});
