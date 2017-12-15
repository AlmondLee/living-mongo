angular.module('ued').directive('app', function ($rootScope, $cookies, Request, config) {
    return {
        replace: true,
        templateUrl: 'component/app/app.html',
        link: function (scope, element, attrs) {

            scope.$on("$routeChangeStart", onRouteChangeStart);

            function onRouteChangeStart(event, next, current) {

                if (next.$$route) {
                    scope.controllerName = next.$$route.controllerAs;
                }
                //路由改变增加loading
                // Site.loading(true)
                NProgress.start();
            }

        }
    }
})



