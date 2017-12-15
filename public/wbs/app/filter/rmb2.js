angular.module('ued').filter('rmb2', function () {
    /**
     * 人民币千位分割
     * @param value 单位:元
     * @param 保留几位小数 默认2
     */
    return function (value, n) {
        value = parseFloat(value)
        return isNaN(value) ? '--' : value.toFixed(n != null ? n : 2)
            .replace(/./g, function (c, i, a) {
                return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c
            })
    }
})