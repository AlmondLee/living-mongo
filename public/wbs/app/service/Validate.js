angular.module('ued').service('Validate', function () {
    var Validate = {}

    /**
     * 是否为空
     * @param value
     * @returns {boolean}
     */
    Validate.isEmpty = function (value) {
        return value == null || !String(value).trim()
    }

    /**
     * 是否为手机号码
     * @param value
     * @returns {boolean}
     */
    Validate.isMobile = function (value) {
        return /^\d{11}$/.test(value)
    }

    /**
     * 是否为数字
     * @param value
     * @returns {boolean}
     */
    Validate.isNumber = function (value) {
        return !Validate.isEmpty(value) && !isNaN(value)
    }

    return Validate
})