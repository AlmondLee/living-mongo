angular.module('ued').filter('rmb3', function () {
    return function (value) {
        return (value < 0 ? '' : '+') + value
    }
})