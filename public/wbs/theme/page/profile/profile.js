angular.module('ued').controller('profile', function ($scope, $cookies, $location, WebApi, Info, config, uLocation) {
    NProgress.done();

    $scope.params = {
        page: 1,
        num: 20,
        total: 0,
        total_page: 0,
        pre_page: false,
        next_page: true,
    };


    $scope.currentPage = function () {
        WebApi.profile($scope.params)
            .then(function (res) {
                $scope.data = res.result.datas
                $scope.params.total = res.result.total
                $scope.params.total_page = Math.ceil($scope.params.total / $scope.params.num)
                if ($scope.params.page >= $scope.params.total_page) {
                    $scope.params.next_page = false;
                } else {
                    $scope.params.next_page = true;
                }
                if ($scope.params.page == 1) {
                    $scope.params.pre_page = false;
                } else {
                    $scope.params.pre_page = true;
                }
            })
    }

    $scope.currentPage()

    $scope.prePage = function () {
        if (!$scope.params.pre_page) {
            return
        }
        $scope.params.page--;
        $scope.currentPage();
    }

    $scope.nextPage = function () {
        if (!$scope.params.next_page) {
            return
        }
        $scope.params.page++;
        $scope.currentPage();
    }

    $scope.firstPage = function () {
        if (!$scope.params.pre_page) {
            return
        }
        $scope.params = {
            page: 1,
            num: 20,
            total: 0,
            total_page: 0,
            pre_page: false,
            next_page: true,
        };
        $scope.currentPage();
    }
    $scope.endPage = function () {
        if (!$scope.params.next_page) {
            return
        }
        $scope.params = {
            page: $scope.params.total_page,
            num: 20,
            total: 0,
            total_page: 0,
            pre_page: true,
            next_page: false,
        };
        $scope.currentPage();
    }
})