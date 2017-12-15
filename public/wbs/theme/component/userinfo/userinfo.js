angular.module('ued').directive('userinfo', function ($rootScope,$cookies, WebApi, uLocation,config) {
    return {
        replace: false,
        templateUrl: 'component/userinfo/userinfo.html',
        scope: {},
        link: function ($scope, element, attrs) {
            $scope.kupposhadowUserinfo = $cookies.getObject('kupposhadowUserinfo')
            // console.log($scope.kupposhadowUserinfo)

            $scope.clickNewProject = function () {
                $rootScope.$broadcast('showCreateProject');
            }
            $scope.clickProjectManger = function () {
                $rootScope.$broadcast('showProjectList');
            }

            $scope.signOut = function () {
                WebApi.logout()
                    .then(function (res) {
                        uLocation.href("#/login");
                    })
            }
        }
    }
})