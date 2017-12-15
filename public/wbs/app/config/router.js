var routes = [
    'index', // 首页
    'login', // 登陆
    'test', // test
    'statistics',
    'profile',
    'auth',
]

angular.module('ued')
.config(function ($routeProvider) {
    routes.forEach(function (name) {
        $routeProvider.when('/' + name, {
            controller: name,
            controllerAs: name,
            templateUrl: 'page/' + name + '/' + name + '.html'
        })
    })

    $routeProvider.otherwise({
        redirectTo: '/login'
    })
})