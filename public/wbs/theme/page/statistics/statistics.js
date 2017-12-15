angular.module('ued').controller('statistics', function ($scope, $cookies,$location,WebApi, Info, config,uLocation) {
    NProgress.done();
    WebApi.statistics()
        .then(function (res) {
            if(res.success){
                // console.log(res)
                $scope.data = res.result[0];
            }
        })
})