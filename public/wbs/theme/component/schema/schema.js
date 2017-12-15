angular.module('ued').directive('schema', function ($rootScope, $interval,WebApi, Info, config, modal) {
    return {
        replace: false,
        templateUrl: 'component/schema/schema.html',
        scope: {},
        link: function ($scope, element, attrs) {
            $scope.schema_type = config.schema_type;

            var myModal = new modal();
            $rootScope.gridOptions = {
                exporterMenuCsv: false,
                enableGridMenu: true,
                enableColumnMenus : false,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                modifierKeysToMultiSelect : false,
                noUnselect:  true,
                columnDefs: [
                    { name: 'name', displayName: '英文名'},
                    { name: 'zh_name', displayName: '中文名'},
                    { name: 'schema_type', displayName: '类型', cellFilter: 'schema_type',width: 100},
                    { name: 'remark', displayName: '备注'},
                    { name: 'sort', displayName: '权重',width: 100},
                    { name: 'visible', displayName: '列表显示',width: 100},
                ],
                gridMenuCustomItems: [
                    {
                        title: '新增',
                        action: function ($event) {
                            $scope.create_schema = {}
                            $('#create_schema').modal('show')
                        },
                        order: 210
                    },
                    {
                        title: '保存排序和列表显示',
                        action: function ($event) {
                            $scope.saveAllSchema();
                        },
                        order: 210
                    },
                    {
                        title: '编辑',
                        action: function ($event) {
                            if($scope.gridApi.selection.getSelectedCount() != 1){
                                alert('请选择一个属性！');
                                return;
                            }
                            $scope.create_schema = angular.copy($scope.gridApi.selection.getSelectedRows()[0])
                            $('#edit_schema').modal('show')
                        },
                        order: 210
                    },
                    {
                        title: '删除',
                        action: function ($event) {
                            if(!confirm("确定删除该信息吗?")) {
                                return;
                            }
                            WebApi.deleteSchema($scope.gridApi.selection.getSelectedRows()[0]['_id']);
                            alert('删除成功');
                            $scope.allSchema()
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

            $scope.allSchema = function () {
                WebApi.allSchema(Info.collection_id)
                    .then(function (res) {
                        $rootScope.gridOptions.data = res.result
                    })
            }

            $scope.createSchema = function () {
                WebApi.saveSchema(Info.collection_id, $scope.create_schema)
                    .then(function (res) {
                        alert('创建成功');
                        $scope.allSchema()
                        $('#create_schema').modal('hide')
                    })
            }

            $scope.saveSchema = function () {
                WebApi.saveSchema(Info.collection_id, $scope.create_schema)
                    .then(function (res) {
                        alert('编辑成功');
                        $scope.allSchema()
                        $('#edit_schema').modal('hide')
                    })
            }

            $scope.saveAllSchema = function () {
                WebApi.saveAllSchema($rootScope.gridOptions.data)
                    .then(function (res) {
                        alert('保存成功');
                        $scope.allSchema()
                    })
            };

            $scope.$on('showEditSchema', function(event) {
                $scope.allSchema()
                myModal.open();
            });

        }
    }
})


