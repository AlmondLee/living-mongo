angular.module('ued', [
    'ngRoute',
    'ngCookies',
    'ngTouch',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.pagination',
    'ui.grid.edit',
    'ngFileUpload',
    'ui.grid.resizeColumns'
])



angular.element(document).ready(function () {
    angular.bootstrap(document, ['ued'])
})

