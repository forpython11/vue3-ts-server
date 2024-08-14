/*
 * @Date: 2024-08-13 18:18:08
 * @LastEditors: cproud1212 2411807384@qq.com
 * @LastEditTime: 2024-08-13 18:18:18
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
// 导出工具方法
module.exports = {
    minustArr
};
