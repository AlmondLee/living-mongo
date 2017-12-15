angular.module('ued').filter('rmb', function () {
    /**
     * 人民币以分为单位 / 100 得到元，再保留两位小数，千位不分割
     * 如要千位分割 可以  {{ value | rmb | rmb2 }}
     * @param text 单位:分
     */
    return function (text) {
        text = parseInt(text); // 为啥不是parseFloat呢。因为分已经是最小单位了，如果有小数点 直接舍去
        return isNaN(text) ? '--' : (text / 100).toFixed(2);
    }
})