angular.module('ued').controller('index', function ($scope, WebApi, Info, config) {
    NProgress.done();
    $scope.$on('collectionChanged', function (event) {
        $scope.collection_remark = '';
        $scope.collection_remark = Info.collection_remark;
    });
    $scope.header = 'header-demo'
})