angular.module('ued').filter('encode', function () {
    return function (url) {
        return encodeURIComponent(url)
    }
})