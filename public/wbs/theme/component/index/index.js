angular.module('ued').directive('index', function ($rootScope, $interval,WebApi, Info, config, indexModal) {
    return {
        replace: false,
        templateUrl: 'component/index/index.html',
        scope: {},
        link: function ($scope, element, attrs) {

            var myModal = new indexModal();
            $rootScope.gridOptions_index = {
                exporterMenuCsv: false,
                enableGridMenu: true,
                enableColumnMenus : false,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                modifierKeysToMultiSelect : false,
                noUnselect:  true,
                columnDefs: [
                    { name: 'name', displayName: '索引名'},
                    { name: 'key', displayName: '索引'},
                ],
                gridMenuCustomItems: [
                    {
                        title: '新增',
                        action: function ($event) {
                            $scope.create_index = {}
                            $('#create_index').modal('show')
                        },
                        order: 210
                    },
                    {
                        title: '删除',
                        action: function ($event) {
                            if(!confirm("确定删除该信息吗?")) {
                                return;
                            }
                            WebApi.deleteindex(Info.collection_id,$scope.gridApi.selection.getSelectedRows()[0]['name']);
                            alert('删除成功');
                            $scope.allindex()
                        },
                        order: 210
                    },
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;

                    // call resize every 500 ms for 5 s after modal finishes opening - usually only necessary on a bootstrap modal
                    $interval( function() {
                        $scope.gridApi.core.handleWindowResize();
                    }, 500, 10);
                }
            };

            $scope.allindex = function () {
                WebApi.allindex(Info.collection_id)
                    .then(function (res) {
                        $rootScope.gridOptions_index.data = res.result
                    })
            }

            $scope.createindex = function () {
                WebApi.createindex(Info.collection_id, $scope.create_index.keys)
                    .then(function (res) {
                        alert('创建成功');
                        $scope.allindex()
                        $('#create_index').modal('hide')
                    })
            }

            $scope.$on('showEditIndex', function(event) {
                $scope.allindex()
                myModal.open();
            });

        }
    }
})


