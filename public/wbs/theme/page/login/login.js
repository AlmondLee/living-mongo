angular.module('ued').controller('login', function ($scope, $cookies,WebApi, Info, config,uLocation) {
    NProgress.done();
    $scope.kupposhadowUserinfo = $cookies.getObject('kupposhadowUserinfo')
    $scope.signIn = function () {
        WebApi.login($scope.user_name, $scope.password)
            .then(function (res) {
                if(res.success){
                    uLocation.href("#/index");
                }
            })
    }

})