angular.module('ued').service('StringUtil', function () {
    var StringUtil = {}

    StringUtil.getByteLength = function (value) {
        return value.replace(/[^\x00-\xff]/g, "**").length
    }

    return StringUtil
})