/*
 * @Date: 2024-08-13 18:18:08
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-15 17:04:59
 * @FilePath: \vue3-ts-server\utils\tools.js
 * @Description: cxx
 */
/**
 * 获取两个数组差集
 * @param arr1
 * @param arr2
 * @returns {*[]}
 */
const minustArr = function (arr1 = [], arr2 = []) {
    return arr1.filter(function (v) {
        return arr2.indexOf(v) === -1;
    });
};
/**
 * 获取树形结构数据 迭代
 * {
  title,
  path,
  component,
  children:[
    {
       title
       ...
    },{...}
  ]
  ...
},
{
  title,
  ...
  children
}
 * type字段为'C'目录、'M'菜单、为'B'按钮
 * @param data 数据
 * @param level 父id层级  0代表没有父级
 * @param idField 字段名
 * @param pidField 上一级字段名
 * @returns {null|[]}
 */
const getTreeData = function (data, level = null, idField = 'menu_id', pidField = 'parent_id') {
    const tree = [];
    const _level = [];
    // 第一次进来获取所有父id
    if (level === null) {
        data.forEach(function (item) {
            _level.push(item[pidField]);
        });
        level = Math.min(..._level);
    }
    data.forEach(function (item) {
        if (item[pidField] === level) {
            tree.push(item);
        }
    });
    if (tree.length === 0) {
        return null;
    }

    // 对于父id为0的进行循环，然后查出父节点为上面结果id的节点内容
    tree.forEach(function (item) {
        if (item.type !== 'B') {
            const childData = getTreeData(data, item[idField], idField, pidField);
            if (childData != null) {
                item['children'] = childData;
            }
        }
    });
    return tree;
};

// 导出工具方法
module.exports = {
    minustArr,
    getTreeData
};
