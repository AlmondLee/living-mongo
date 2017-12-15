angular.module('ued').directive('collection', function ($rootScope, $interval,WebApi, Info, config, modal) {
    return {
        replace: false,
        templateUrl: 'component/collection/collection.html',
        scope: {},
        link: function ($scope, element, attrs) {
            $scope.params = {
                page: 1,
                num: 10,
                total: 0,
                total_page: 0,
                pre_page: false,
                next_page: true,
            };

            $scope.currentPage = function () {
                if(!Info.project_id){
                    alert('请先选择项目！');
                    return;
                }

                WebApi.indexCollection($scope.params,Info.project_id)
                    .then(function (res) {
                        $scope.gridOptions.data = res.result.datas
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
                $scope.gridApi.selection.clearSelectedRows()
            }

            $scope.prePage = function () {
                if(!Info.project_id){
                    alert('请先选择项目！');
                    return;
                }
                if (!$scope.params.pre_page) {
                    return
                }
                $scope.params.page --;
                $scope.currentPage();
            }

            $scope.nextPage = function () {
                if(!Info.project_id){
                    alert('请先选择项目！');
                    return;
                }
                if (!$scope.params.next_page) {
                    return
                }
                $scope.params.page ++;
                $scope.currentPage();
            }

            $scope.gridOptions = {
                exporterMenuCsv: false,
                enableGridMenu: true,
                enableColumnMenus : false,
                enableSorting: false,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                modifierKeysToMultiSelect : false,
                noUnselect:  true,
                columnDefs: [
                    {
                        name : "_id",
                        displayName : "系统id",
                        width: 70
                    },
                    { name: 'name', displayName: '集合名'},
                ],
                gridMenuCustomItems: [
                    {
                        title: '编辑',
                        action: function ($event) {
                            if(!Info.collection_id){
                                alert('请先选择集合！');
                                return;
                            }
                            $scope.create_collection = angular.copy($scope.gridApi.selection.getSelectedRows()[0])
                            $('#edit_collection').modal('show')
                        },
                        order: 210
                    },
                    {
                        title: '删除',
                        action: function ($event) {
                            if(!Info.collection_id){
                                alert('请先选择集合！');
                                return;
                            }
                            $('#delete_collection').modal('show')
                        },
                        order: 210
                    },
                    {
                        title: '清空该表',
                        action: function ($event) {
                            if(!Info.collection_id){
                                alert('请先选择集合！');
                                return;
                            }
                            $('#clear_collection').modal('show')
                        },
                        order: 210
                    }
                ],
                onRegisterApi: function( gridApi ){
                    $scope.gridApi = gridApi;
                    $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        Info.collection_id = row['entity']['_id'];
                        Info.collection_remark = row['entity']['remark'];
                        $rootScope.$broadcast('collectionChanged');
                    });
                }
            };
            $scope.showCreateCollection = function () {
                if(!Info.project_id){
                    alert('请先选择项目！');
                    return;
                }
                $scope.create_collection = {}
                $('#create_collection').modal('show')
            }

            $scope.showSchemaManagerCollection = function () {
                if(!Info.collection_id){
                    alert('请先选择集合！');
                    return;
                }
                $rootScope.$broadcast('showEditSchema');
            }
            $scope.showIndexManagerCollection = function () {
                if(!Info.collection_id){
                    alert('请先选择集合！');
                    return;
                }
                $rootScope.$broadcast('showEditIndex');
            }

            $scope.createCollection = function () {
                WebApi.saveCollection(Info.project_id,$scope.create_collection)
                    .then(function (res) {
                        alert('创建成功');
                        $scope.params = {
                            page: 1,
                            num: 10,
                            total: 0,
                            total_page: 0,
                            pre_page: false,
                            next_page: true,
                        };
                        $scope.currentPage();
                        $('#create_collection').modal('hide')
                    })
            }
            $scope.editCollection = function () {
                WebApi.saveCollection(Info.project_id,$scope.create_collection)
                    .then(function (res) {
                        alert('编辑成功');
                        for (key in $scope.gridOptions.data) {
                            if($scope.gridOptions.data[key]._id == $scope.create_collection._id){
                                $scope.gridOptions.data[key] = $scope.create_collection
                            }
                        }
                        $scope.gridApi.selection.clearSelectedRows()
                        Info.collection_id = null
                        $('#edit_collection').modal('hide')
                    })
            }
            $scope.deleteCollection = function () {
                var data = {
                    "collection_id" : Info.collection_id,
                    "collection_name" : $scope.delete_collection.collection_name
                }
                WebApi.deleteCollection(data)
                    .then(function (res) {
                        alert('删除成功');
                        $scope.gridApi.selection.clearSelectedRows()
                        Info.collection_id = null;
                        $scope.delete_collection = null;
                        $scope.currentPage();
                        $('#delete_collection').modal('hide')
                    })
            }
            $scope.demo2proCollection = function () {
                var data = {
                    "collection_id" : Info.collection_id,
                    "collection_name" : $scope.demo2pro_collection.collection_name
                }
                WebApi.demo2pro_collection(data)
                    .then(function (res) {
                        alert(res.message);
                        $scope.gridApi.selection.clearSelectedRows()
                        Info.collection_id = null;
                        $scope.demo2pro_collection = null;
                        $('#demo2pro_collection').modal('hide')
                    })
            }
            $scope.pro2demoCollection = function () {
                var data = {
                    "collection_id" : Info.collection_id,
                    "collection_name" : $scope.pro2demo_collection.collection_name
                }
                WebApi.pro2demo_collection(data)
                    .then(function (res) {
                        alert(res.message);
                        $scope.gridApi.selection.clearSelectedRows()
                        Info.collection_id = null;
                        $scope.pro2demo_collection = null;
                        $('#pro2demo_collection').modal('hide')
                    })
            }
            $scope.clearCollection = function () {
                var data = {
                    "collection_id" : Info.collection_id,
                    "collection_name" : $scope.clear_collection.collection_name
                }
                WebApi.clear_collection(data)
                    .then(function (res) {
                        alert(res.message);
                        $scope.gridApi.selection.clearSelectedRows()
                        Info.collection_id = null;
                        $scope.clear_collection = null;
                        $scope.currentPage();
                        $('#clear_collection').modal('hide')
                    })
            }

            $scope.$on('databaseChanged', function(event) {
                if(!Info.project_id){
                    return;
                }
                $scope.params = {
                    page: 1,
                    num: 10,
                    total: 0,
                    total_page: 0,
                    pre_page: false,
                    next_page: true,
                };
                $scope.currentPage();
            });

        }
    }
})


