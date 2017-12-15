angular.module('ued').filter('trust', function ($sce) {
    return function (source) {
        return $sce.trustAsHtml(source)
    }
})