angular.module('ued').controller('auth', function ($scope, $cookies,$location,WebApi, Info, config,uLocation) {
    NProgress.done();

    $scope.kupposhadowUserinfo = $cookies.getObject('kupposhadowUserinfo')

    WebApi.allUser()
        .then(function (res) {
            $scope.list = res.result.datas;
        })

    $scope.editAuth = function (user_id) {
        $scope.user_id = user_id;
        WebApi.userAuth(user_id)
            .then(function (res) {
                // console.log(res)
                $scope.data = res.result;
            })
        $('#edit_auth').modal('show')
    }

    $scope.saveAuth = function () {
        $scope.data.user_id = $scope.user_id
        WebApi.saveAuth($scope.data)
            .then(function (res) {
                alert('更改成功');
                $('#edit_auth').modal('hide')
            })
    }
})