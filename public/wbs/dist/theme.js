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
angular.module('ued').controller('index', function ($scope, WebApi, Info, config) {
    NProgress.done();
    $scope.$on('collectionChanged', function (event) {
        $scope.collection_remark = '';
        $scope.collection_remark = Info.collection_remark;
    });
    $scope.header = 'header-demo'
})
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



angular.module('ued').directive('dateInput', function(){
    return {
        restrict : 'A',
        scope : {
            ngModel : '='
        },
        link: function (scope) {
            if (scope.ngModel) scope.ngModel = new Date(scope.ngModel);
        }
    }
});
angular.module('ued').directive('document', function ($rootScope, Upload, WebApi, Info, config, uiGridConstants) {
    return {
        replace: false,
        templateUrl: 'component/document/document.html',
        scope: {},
        link: function ($scope, element, attrs) {

            $scope.log = '';
            $scope.search_schema_number = config.search_schema_number;
            $scope.search_schema_input = config.search_schema_input;

            $scope.params = {
                page: 1,
                num: 10,
                total: 0,
                total_page: 0,
                pre_page: false,
                next_page: true,
            };

            $scope.search_query = {};
            $scope.search_str = '';
            $scope.new_document_data = [];
            $scope.collection_schema = [];

            $scope.upload = function (file, name) {

                if (file) {
                    if (!file.$error) {
                        Upload.upload({
                            url: '/file/upload-file',
                            data: {
                                file: file
                            }
                        }).then(function (resp) {
                            $scope.new_document_data[name] = resp.data.result.src
                        }, null, function (evt) {
                            var progressPercentage = parseInt(100.0 *
                                evt.loaded / evt.total);
                            $scope.log = 'progress: ' + progressPercentage +
                                '% ' + evt.config.data.file.name + '\n';
                        });
                    }
                }
            };

            $scope.currentPage = function () {
                if (!Info.collection_id) {
                    alert('请先选择集合！');
                    return;
                }
                WebApi.indexDocument($scope.params, Info.collection_id)
                    .then(function (res) {
                        $scope.gridOpts.data = res.result.datas
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
                if (!Info.collection_id) {
                    alert('请先选择集合！');
                    return;
                }
                if (!$scope.params.pre_page) {
                    return
                }
                $scope.params.page--;
                $scope.currentPage();
            }

            $scope.nextPage = function () {
                if (!Info.collection_id) {
                    alert('请先选择集合！');
                    return;
                }
                if (!$scope.params.next_page) {
                    return
                }
                $scope.params.page++;
                $scope.currentPage();
            }

            $scope.firstPage = function () {
                if (!Info.collection_id) {
                    alert('请先选择集合！');
                    return;
                }
                if (!$scope.params.pre_page) {
                    return
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
            }
            $scope.endPage = function () {
                if (!Info.collection_id) {
                    alert('请先选择集合！');
                    return;
                }
                if (!$scope.params.next_page) {
                    return
                }
                $scope.params = {
                    page: $scope.params.total_page,
                    num: 10,
                    total: 0,
                    total_page: 0,
                    pre_page: true,
                    next_page: false,
                };
                $scope.currentPage();
            }


            $scope.showCreateDocument = function () {
                if (!Info.collection_id) {
                    alert('请先选择集合！');
                    return;
                }
                $scope.collection_schema = Info.collection_schema
                $scope.new_document_data = {}
                // console.log($scope.new_document_data)
                $('#create_document').modal('show')

            };

            $scope.showEditDocument = function () {
                if (!Info.collection_id) {
                    alert('请先选择集合！');
                    return;
                }
                if ($scope.gridApi.selection.getSelectedCount() != 1) {
                    alert('请选择一个文档！');
                    return;
                }
                $scope.collection_schema = Info.collection_schema
                $scope.new_document_data = angular.copy($scope.gridApi.selection.getSelectedRows()[0])
                $('#edit_document').modal('show')
            };


            $scope.editDocument = function () {
                data = angular.copy($scope.new_document_data);
                angular.forEach(data, function (value, key) {
                    if (value instanceof Date) {
                        data[key] = value.toISOString();
                    }
                })
                WebApi.saveDocument(Info.collection_id, data)
                    .then(function (res) {
                        $scope.currentPage();
                        alert('编辑成功');
                        $('#edit_document').modal('hide')
                    })
            };

            $scope.clear_query= function () {
                $scope.search_query = {};
                $scope.search_str = '';
                $scope.currentPage();
            };

            $scope.saveAll = function () {
                if (!Info.collection_id) {
                    alert('请先选择集合！');
                    return;
                }
                WebApi.saveAll(Info.collection_id, $scope.gridOpts.data)
                    .then(function (res) {
                        alert('保存成功');
                        $scope.currentPage();
                    })
            };

            $scope.removeRow = function () {
                if (!confirm("确定删除该信息吗?")) {
                    return;
                }
                var ids = [];

                angular.forEach($scope.gridApi.selection.getSelectedRows(), function (value, key) {
                    ids.push(value._id);
                })

                WebApi.deleteDocument(Info.collection_id, ids)
                    .then(function (res) {
                        $scope.currentPage();
                    })
            };

            $scope.seach = function () {
                if (!Info.collection_id) {
                    alert('请先选择集合！');
                    return;
                }

                $scope.collection_schema = Info.collection_schema

                $('#seach').modal('show')
            };

            $scope.seachDocument = function () {
                //复制一份
                var query = angular.copy($scope.search_query);

                //把所有的Date类型转成字符串
                angular.forEach(query, function (value, key) {
                    if (typeof value.start != "undefined" && value.start != null) {
                        if (value.start instanceof Date) {
                            query[key].start = value.start.toISOString();
                        }
                    }
                    if (typeof value.end != "undefined" && value.end != null) {
                        if (value.end instanceof Date) {
                            query[key].end = value.end.toISOString();
                        }
                    }
                })

                //去除__CREATE_TIME__和__MODIFY_TIME__中为null的
                if(query.__MODIFY_TIME__.start == null && query.__MODIFY_TIME__.end == null){
                    delete query.__MODIFY_TIME__;
                }else{
                    if(query.__MODIFY_TIME__.start == null) {
                        delete query.__MODIFY_TIME__.start;
                    }
                    if(query.__MODIFY_TIME__.end == null) {
                        delete query.__MODIFY_TIME__.end;
                    }
                }
                if(query.__CREATE_TIME__.start == null && query.__CREATE_TIME__.end == null){
                    delete query.__CREATE_TIME__;
                }else{
                    if(query.__CREATE_TIME__.start == null) {
                        delete query.__CREATE_TIME__.start;
                    }
                    if(query.__CREATE_TIME__.end == null) {
                        delete query.__CREATE_TIME__.end;
                    }
                }

                console.log($scope.search_query);
                $scope.search_str = JSON.stringify(query);

                $scope.params = {
                    page: 1,
                    num: 10,
                    total: 0,
                    total_page: 0,
                    pre_page: false,
                    next_page: true,
                };

                $scope.params.query = query;

                $scope.currentPage();
            };

            $scope.export = function () {
                if (!Info.collection_id) {
                    alert('请先选择集合！');
                    return;
                }
                var url = '/wbs/csv/export?collection_id=' + Info.collection_id

                for (val in $scope.params) {
                    var str = '&' + val + '=' + $scope.params[val]
                    url += str;
                }
                window.location.href = url;
            };

            $scope.gridOpts = {
                exporterMenuCsv: false,
                exporterMenuPdf: false,
                enableFiltering: false,
                enableGridMenu: true,
                enableSorting: false,
                enableColumnMenus: false,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                }
            };

            $scope.createDocument = function () {
                data = angular.copy($scope.new_document_data);
                angular.forEach(data, function (value, key) {
                    if (value instanceof Date) {
                        data[key] = value.toISOString();
                    }
                })
                WebApi.saveDocument(Info.collection_id, data)
                    .then(function (res) {
                        alert('创建成功');
                        $scope.params = {
                            page: 1,
                            num: 10,
                            total: 0,
                            pre_page: false,
                            next_page: true,
                        };
                        $scope.currentPage();
                        $('#create_document').modal('hide')
                    })
            };

            $scope.$on('collectionChanged', function (event) {
                WebApi.allSchema(Info.collection_id)
                    .then(function (res) {
                        Info.collection_schema = angular.copy(res.result)
                        res.result.unshift(config.columnDefs_ID)
                        res.result.push(config.columnDefs_CREATE_TIME)
                        $scope.gridOpts.columnDefs = res.result
                    })
                $scope.params = {
                    page: 1,
                    num: 10,
                    total: 0,
                    pre_page: false,
                    next_page: true,
                };
                $scope.currentPage()
            });
        }
    }
})



angular.module('ued').directive("formatDate", function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attr, modelCtrl) {
            modelCtrl.$formatters.push(function(modelValue) {
                if (modelValue){
                    return new Date(modelValue);
                }
                else {
                    return null;
                }
            });
        }
    };
});
angular.module('ued').directive('project', function ($rootScope, WebApi, Info, config) {
    return {
        replace: false,
        templateUrl: 'component/project/project.html',
        scope: {},
        link: function ($scope, element, attrs) {

            $scope.getList = function () {
                WebApi.allProject()
                    .then(function (res) {
                        $scope.list = res.result
                    })
            }
            $scope.getList()

            $scope.change = function ($id) {
                Info.project_id = $id;
                $rootScope.$broadcast('databaseChanged');
                // console.log('databaseChanged',$id)
            }


            $scope.createProject = function () {
                WebApi.saveProject($scope.create_project)
                    .then(function (res) {
                        alert('创建成功');
                        $scope.getList()
                        $('#create_project').modal('hide')
                    })
            }


            $scope.showEditProject = function (obj) {
                $('#projectList').modal('hide')
                $scope.create_project = obj
                $('#edit_project').modal('show')
            }

            $scope.editProject = function () {
                WebApi.saveProject($scope.create_project)
                    .then(function (res) {
                        alert('编辑成功');
                        $scope.getList();
                        $('#edit_project').modal('hide')
                        $('#projectList').modal('show')
                    })
            }

            $scope.$on('showCreateProject', function (event) {
                $scope.create_project = {}
                $('#create_project').modal('show')
            });

            $scope.$on('showProjectList', function (event) {
                $('#projectList').modal('show')
            });
        }
    }
})
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
angular.module('ued').run(['$templateCache', function($templateCache) {$templateCache.put('page/auth/auth.html','<div>\r\n    <div class="container clearfix">\r\n        <div class="solvebutton">\r\n            <a href="#index" class="btn btn-success" >\u8FD4\u56DE\u9996\u9875</a>\r\n        </div>\r\n        <table class="table table-bordered">\r\n            <tr>\r\n                <th>user_id</th>\r\n                <th>\u7528\u6237\u6635\u79F0</th>\r\n                <th>\u767B\u5F55\u8D26\u53F7</th>\r\n                <th>\u7BA1\u7406\u5458</th>\r\n                <th>\u64CD\u4F5C</th>\r\n            </tr>\r\n            <tr ng-repeat="val in list">\r\n                <td>{{val._id}}</td>\r\n                <td>{{val.nickname}}</td>\r\n                <td>{{val.username}}</td>\r\n                <td>{{val.administrator}}</td>\r\n                <td><a ng-click="editAuth(val._id)" class="btn">\u5206\u914D\u6743\u9650</a></td>\r\n            </tr>\r\n        </table>\r\n        <!--<p>Current page: {{params.page}} of {{params.total_page}}&nbsp;&nbsp;&nbsp;&nbsp;total: {{params.total}}</p>-->\r\n        <!--<button type="button" class="btn btn-success" ng-click="firstPage()">\u9996\u9875</button>-->\r\n        <!--<button type="button" class="btn btn-success" ng-click="prePage()">\u4E0A\u4E00\u9875</button>-->\r\n        <!--<button type="button" class="btn btn-success" ng-click="nextPage()">\u4E0B\u4E00\u9875</button>-->\r\n        <!--<button type="button" class="btn btn-success" ng-click="endPage()">\u5C3E\u9875</button>-->\r\n        <!--<button type="button" class="btn btn-success" ng-click="currentPage()">\u5237\u65B0</button>-->\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class="modal fade bs-example-modal-lg" id="edit_auth" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u9879\u76EE\u7BA1\u7406</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <div class="form-group clearfix" ng-if="kupposhadowUserinfo.user_id != user_id">\r\n                    <label class="col-md-2 clearPadding">\u89D2\u8272:</label>\r\n                    <div class="col-md-10 clearPadding">\r\n                        <label><input type="radio" name="administrator" ng-model="data.administrator" value="no" required>\u666E\u901A\u7528\u6237</label>\r\n                        <label><input type="radio" name="administrator" ng-model="data.administrator" value="yes">\u7BA1\u7406\u5458</label>\r\n                    </div>\r\n                </div>\r\n                <div class="is-scrolled">\r\n                    <table class="table table-striped text-center table-hover list-table scrollTable">\r\n                        <thead>\r\n                            <tr>\r\n                                <td></td>\r\n                                <td>\u9879\u76EE\u540D\u79F0</td>\r\n                                <td>\u521B\u5EFA\u65F6\u95F4</td>\r\n                            </tr>\r\n                        </thead>\r\n                        <tbody>\r\n                            <tr ng-repeat="val in data.projectList">\r\n                                <td><input type="checkbox" name="administrator" ng-model="val.owner" ></td>\r\n                                <td>{{val.name}}</td>\r\n                                <td>{{val.__CREATE_TIME__}}</td>\r\n                            </tr>\r\n                        </tbody>\r\n                    </table>\r\n                </div>\r\n                <div class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n                <button class="btn btn-primary" ng-click="saveAuth()">\u786E\u8BA4</button>\r\n                <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n');
$templateCache.put('page/index/index.html','<div>\r\n    <header class="{{header}} clearfix">\r\n        <project></project>\r\n        <userinfo></userinfo>\r\n    </header>\r\n\r\n    <div class="clearfix">\r\n        <collection></collection>\r\n        <schema></schema>\r\n        <index></index>\r\n        <document></document>\r\n    </div>\r\n\r\n    <pre class="alert alert-info notebook">{{collection_remark}}</pre>\r\n</div>');
$templateCache.put('page/login/login.html','<div class="container">\r\n\r\n    <form class="form-signin" role="form" ng-submit="signIn()">\r\n        <h2 class="form-signin-heading">LivingMongo</h2>\r\n        <input type="text" class="form-control" placeholder="User Name" ng-model="user_name">\r\n        <input type="password" class="form-control" placeholder="Password" ng-model="password">\r\n        <div class="checkbox">\u8F93\u5165\u4EFB\u610F\u7528\u6237\u540D\u548C\u5BC6\u7801\u5373\u53EF\u767B\u5F55</div>\r\n        <button class="btn btn-lg btn-primary" type="submit" style="width:45%">\u767B\u5F55</button>\r\n    </form>\r\n\r\n</div>');
$templateCache.put('page/profile/profile.html','<div>\r\n    <div class="container clearfix">\r\n        <div class="solvebutton">\r\n            <a href="#index" class="btn btn-success" >\u8FD4\u56DE\u9996\u9875</a>\r\n        </div>\r\n        <table class="table table-bordered">\r\n            <tr>\r\n                <th>\u65F6\u95F4</th>\r\n                <th>\u96C6\u5408</th>\r\n                <th>\u8017\u65F6</th>\r\n                <th>\u8BE6\u60C5</th>\r\n            </tr>\r\n            <tr ng-repeat="val in data">\r\n                <td>{{val.ts}}</td>\r\n                <td>{{val.ns}}</td>\r\n                <td>{{val.millis}}</td>\r\n                <td><input type="text" value="{{val}}"></td>\r\n            </tr>\r\n        </table>\r\n        <div class="clearfix">\r\n            <p class="pull-left">Current page: {{params.page}} of {{params.total_page}}</p>\r\n            <p class="pull-right">total: {{params.total}}</p>\r\n        </div>\r\n        <button type="button" class="btn btn-success" ng-click="firstPage()">\u9996\u9875</button>\r\n        <button type="button" class="btn btn-success" ng-click="prePage()">\u4E0A\u4E00\u9875</button>\r\n        <button type="button" class="btn btn-success" ng-click="nextPage()">\u4E0B\u4E00\u9875</button>\r\n        <button type="button" class="btn btn-success" ng-click="endPage()">\u5C3E\u9875</button>\r\n        <button type="button" class="btn btn-success" ng-click="currentPage()">\u5237\u65B0</button>\r\n    </div>\r\n</div>');
$templateCache.put('page/statistics/statistics.html','<div>\r\n    <div class="container clearfix">\r\n        <div class="solvebutton">\r\n            <a href="#index" class="btn btn-success" >\u8FD4\u56DE\u9996\u9875</a>\r\n        </div>\r\n        <table class="table table-bordered">\r\n            <tr>\r\n                <th>\u540D\u79F0</th>\r\n                <th>\u603B\u5927\u5C0F</th>\r\n                <th>\u6570\u636E\u5E93\u603B\u6570</th>\r\n            </tr>\r\n            <tr>\r\n                <td>LivingMongo</td>\r\n                <td>{{data.totalSize}}</td>\r\n                <td>{{data.databases.length}}</td>\r\n            </tr>\r\n        </table>\r\n        <table class="table table-bordered">\r\n            <tr>\r\n                <th>\u6570\u636E\u5E93\u540D</th>\r\n                <th>\u5927\u5C0F</th>\r\n                <th>\u96C6\u5408\u6570</th>\r\n            </tr>\r\n            <tr ng-repeat="val in data.databases">\r\n                <td>{{val.name}}</td>\r\n                <td>{{val.sizeOnDisk}}</td>\r\n                <td>{{val.listCollections.length}}</td>\r\n            </tr>\r\n        </table>\r\n        <table class="table table-bordered">\r\n            <tr>\r\n                <th>\u96C6\u5408\u540D</th>\r\n                <th>\u5927\u5C0F</th>\r\n                <th>\u6587\u6863\u6570</th>\r\n                <th>\u6570\u636E\u5E73\u5747\u5927\u5C0F</th>\r\n                <th>\u6240\u5360\u78C1\u76D8\u5927\u5C0F(\u9884\u5206\u914D\u7A7A\u95F4)</th>\r\n                <th>\u7D22\u5F15\u5927\u5C0F</th>\r\n            </tr>\r\n            <tr ng-repeat="val in data.collectionInfo">\r\n                <td>{{val[0].ns}}</td>\r\n                <td>{{val[0].size}}</td>\r\n                <td>{{val[0].count}}</td>\r\n                <td>{{val[0].avgObjSize}}</td>\r\n                <td>{{val[0].storageSize}}</td>\r\n                <td>{{val[0].totalIndexSize}}</td>\r\n            </tr>\r\n        </table>\r\n    </div>\r\n</div>');
$templateCache.put('component/app/app.html','<div id="{{controllerName}}" ng-view></div>\r\n\r\n\r\n');
$templateCache.put('component/collection/collection.html','<content class="bar pull-left">\r\n    <button type="button" class="btn btn-success" ng-click="showCreateCollection()">\u65B0\u589E</button>\r\n    <button type="button" class="btn btn-success" ng-click="showSchemaManagerCollection()">\u5C5E\u6027</button>\r\n    <button type="button" class="btn btn-success" ng-click="showIndexManagerCollection()">\u7D22\u5F15</button>\r\n    <br>\r\n    <br>\r\n    <div id="gridcollection" ui-grid="gridOptions" ui-grid-selection ui-grid-edit class="grid"></div>\r\n    <div class="clearfix">\r\n        <p class="pull-left">Current page: {{params.page}} of {{params.total_page}}</p>\r\n        <p class="pull-right">total: {{params.total}}</p>\r\n    </div>\r\n    <button type="button" class="btn btn-success" ng-click="prePage()">\u4E0A\u4E00\u9875</button>\r\n    <button type="button" class="btn btn-success" ng-click="nextPage()">\u4E0B\u4E00\u9875</button>\r\n    <button type="button" class="btn btn-success" ng-click="currentPage()">\u5237\u65B0</button>\r\n</content>\r\n\r\n\r\n\r\n<div class="modal fade smallbox" id="create_collection" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u65B0\u5EFA\u96C6\u5408</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form>\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u96C6\u5408\u4E2D\u6587\u540D:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_collection.name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u5907\u6CE8:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <textarea class="form-control" ng-model="create_collection.remark"></textarea>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary" ng-click="createCollection()">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class="modal fade smallbox" id="edit_collection" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u7F16\u8F91\u96C6\u5408</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form>\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u96C6\u5408\u4E2D\u6587\u540D:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_collection.name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u5907\u6CE8:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <textarea class="form-control" ng-model="create_collection.remark"></textarea>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary" ng-click="editCollection()">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class="modal fade smallbox" id="delete_collection" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u8BF7\u786E\u8BA4\u60A8\u8981\u5220\u9664\u7684\u96C6\u5408</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form ng-submit="deleteCollection()" name="deleteCollection">\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u786E\u8BA4\u8981\u5220\u9664\u96C6\u5408:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="delete_collection.collection_name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class="modal fade smallbox" id="demo2pro_collection" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u8BF7\u786E\u8BA4\u8981\u7528demo\u73AF\u5883\u7684\u6570\u636E\u8986\u76D6\u6B63\u5F0F\u73AF\u5883\uFF1F</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form ng-submit="demo2proCollection()" name="demo2pro_collection">\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u786E\u8BA4\u96C6\u5408:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="demo2pro_collection.collection_name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n\r\n\r\n<div class="modal fade smallbox" id="pro2demo_collection" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u8BF7\u786E\u8BA4\u8981\u7528\u6B63\u5F0F\u73AF\u5883\u7684\u6570\u636E\u8986\u76D6demo\u73AF\u5883\uFF1F</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form ng-submit="pro2demoCollection()" name="pro2demo_collection">\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u786E\u8BA4\u96C6\u5408:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="pro2demo_collection.collection_name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n\r\n\r\n<div class="modal fade smallbox" id="clear_collection" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u8BF7\u786E\u8BA4\u6E05\u7A7A\u96C6\u5408</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form ng-submit="clearCollection()" name="clear_collection">\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u786E\u8BA4\u8981\u6E05\u7A7A\u7684\u96C6\u5408:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="clear_collection.collection_name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n');
$templateCache.put('component/dateInput/dateInput.html','');
$templateCache.put('component/document/document.html','<content class="board pull-left">\r\n    <button type="button" class="btn btn-success" ng-click="showCreateDocument()">\u65B0\u589E</button>\r\n    <button type="button" class="btn btn-success" ng-click="showEditDocument()">\u7F16\u8F91</button>\r\n    <button type="button" class="btn btn-success" ng-click="saveAll()">\u4FDD\u5B58</button>\r\n    <button type="button" class="btn btn-danger delete" ng-click="removeRow()">\u5220\u9664</button>\r\n    <span class="">{{search_str}}</span>\r\n    <div class="pull-right">\r\n        <button type="button" class="btn btn-info" ng-click="seach()">\u641C\u7D22</button>\r\n        <button type="button" class="btn btn-primary" ng-click="export()">\u5BFC\u51FA</button>\r\n    </div>\r\n    <br>\r\n    <br>\r\n    <div id="grid1" ui-grid="gridOpts" ui-grid-resize-columns ui-grid-selection ui-grid-edit class="grid"></div>\r\n    <div class="clearfix">\r\n        <p class="pull-left">Current page: {{params.page}} of {{params.total_page}}</p>\r\n        <p class="pull-right">total: {{params.total}}</p>\r\n    </div>\r\n    <button type="button" class="btn btn-success" ng-click="firstPage()">\u9996\u9875</button>\r\n    <button type="button" class="btn btn-success" ng-click="prePage()">\u4E0A\u4E00\u9875</button>\r\n    <button type="button" class="btn btn-success" ng-click="nextPage()">\u4E0B\u4E00\u9875</button>\r\n    <button type="button" class="btn btn-success" ng-click="endPage()">\u5C3E\u9875</button>\r\n    <button type="button" class="btn btn-success" ng-click="currentPage()">\u5237\u65B0</button>\r\n</content>\r\n\r\n\r\n<div class="modal fade smallbox" id="create_document" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u65B0\u5EFA\u6587\u6863</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form name="myForm" ng-submit="createDocument()">\r\n                    <ul class="verticalList">\r\n                        <li ng-repeat="(key, value) in collection_schema">\r\n                            <div class="form-group" ng-if="value.schema_type == \'single-line-text\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control"\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'multi-line-text\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <textarea class="form-control"\r\n                                              ng-model="$parent.new_document_data[value.name]"></textarea>\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'digital\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="number" class="form-control"\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'float-digital\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control"\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'non-input\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <select class="form-control" ng-model="$parent.new_document_data[value.name]"\r\n                                            ng-options="o.v as o.n for o in [{ n: \'\u662F\', v: true }, { n: \'\u5426\', v: false }]">\r\n                                        <option value="">--\u8BF7\u9009\u62E9--</option>\r\n                                    </select>\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'array\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-list\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'embedded-document\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <textarea class="form-control"\r\n                                              ng-model="$parent.new_document_data[value.name]"></textarea>\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'file\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <div ngf-drop ngf-select="upload(files,value.name)" ngf-change ng-model="files"\r\n                                         class="drop-box"\r\n                                         ngf-drag-over-class="\'dragover\'" ngf-multiple="false" ngf-allow-dir="true"\r\n                                         accept="image/jpg,image/JPG,image/gif,image/GIF,image/png,image/PNG,image/jpeg,image/JPEG"\r\n                                         ngf-pattern="\'image/jpg,image/JPG,image/gif,image/GIF,image/png,image/PNG,image/jpeg,image/JPEG\'">\r\n                                        <img width="64px" height="30px" ng-if="$parent.new_document_data[value.name]"\r\n                                             ng-src="{{$parent.new_document_data[value.name]}}?w=64&h=64" src-input>\r\n                                    </div>\r\n                                    <div ngf-no-file-drop>File Drag/Drop is not supported for this browser</div>\r\n                                    <pre ng-if="log">{{log}}</pre>\r\n                                    <input type="text" class="form-control" ng-hide="true"\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'rich-text\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <textarea class="form-control"\r\n                                              ng-model="$parent.new_document_data[value.name]"></textarea>\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'date\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="datetime-local" class="form-control" format-date\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class="modal fade smallbox" id="edit_document" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u7F16\u8F91\u6587\u6863</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form>\r\n                    <ul class="verticalList">\r\n                        <li ng-repeat="(key, value) in collection_schema">\r\n                            <div class="form-group" ng-if="value.schema_type == \'single-line-text\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control"\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'multi-line-text\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <textarea class="form-control"\r\n                                              ng-model="$parent.new_document_data[value.name]"></textarea>\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'digital\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="number" class="form-control"\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'float-digital\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control"\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'non-input\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <select class="form-control" ng-model="$parent.new_document_data[value.name]"\r\n                                            ng-options="o.v as o.n for o in [{ n: \'\u662F\', v: true }, { n: \'\u5426\', v: false }]">\r\n                                        <option value="">--\u8BF7\u9009\u62E9--</option>\r\n                                    </select>\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'array\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-list\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'embedded-document\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <textarea class="form-control"\r\n                                              ng-model="$parent.new_document_data[value.name]"></textarea>\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'file\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <div ngf-drop ngf-select="upload(files,value.name)" ngf-change ng-model="files"\r\n                                         class="drop-box"\r\n                                         ngf-drag-over-class="\'dragover\'" ngf-multiple="false" ngf-allow-dir="true"\r\n                                         accept="image/jpg,image/JPG,image/gif,image/GIF,image/png,image/PNG,image/jpeg,image/JPEG"\r\n                                         ngf-pattern="\'image/jpg,image/JPG,image/gif,image/GIF,image/png,image/PNG,image/jpeg,image/JPEG\'">\r\n                                        <img width="64px" height="30px" ng-if="$parent.new_document_data[value.name]"\r\n                                             ng-src="{{$parent.new_document_data[value.name]}}?w=64&h=64" src-input>\r\n                                    </div>\r\n                                    <div ngf-no-file-drop>File Drag/Drop is not supported for this browser</div>\r\n                                    <pre ng-if="log">{{log}}</pre>\r\n                                    <input type="text" class="form-control" ng-hide="true"\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'rich-text\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <textarea class="form-control"\r\n                                              ng-model="$parent.new_document_data[value.name]"></textarea>\r\n                                </div>\r\n                            </div>\r\n                            <div class="form-group" ng-if="value.schema_type == \'date\'">\r\n                                <label class="col-md-4 clearPadding">{{value.displayName}}</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="datetime-local" class="form-control" format-date\r\n                                           ng-model="$parent.new_document_data[value.name]">\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary" ng-click="editDocument()">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class="modal fade smallbox" id="seach" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u8BF7\u8F93\u5165\u641C\u7D22\u6761\u4EF6</h4>\r\n            </div>\r\n            <div class="modal-body searchtable">\r\n                <form ng-submit="seachDocument()">\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary">\u641C\u7D22</button>\r\n                        <button class="btn btn-primary" ng-click="clear_query()">\u6E05\u7A7A</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                    <ul>\r\n                        <li class="col-md-12 fieldgroup">\r\n                            <div>\r\n                                <div class="fieldtitle">\u7CFB\u7EDFid</div>\r\n                                <ul class="clearfix">\r\n                                    <li><div>\u6A21\u7CCA</div><input type="checkbox" ng-model="search_query[\'_id\'].fuzzy"></li>\r\n                                    <li><div>\u5355\u884C\u6587\u672C</div><input type="text" ng-model="search_query[\'_id\'].text"></li>\r\n                                </ul>\r\n                            </div>\r\n                        </li>\r\n                        <li class="col-md-12 fieldgroup"  ng-repeat="(key, value) in collection_schema">\r\n                            <div ng-if="search_schema_input.indexOf(value.schema_type) >=0">\r\n                                <div class="fieldtitle">{{value.zh_name}}</div>\r\n                                <ul class="clearfix">\r\n                                    <li><div>\u6A21\u7CCA</div><input type="checkbox" ng-model="$parent.search_query[value.name].fuzzy"></li>\r\n                                    <li><div>\u5355\u884C\u6587\u672C</div><input type="text" ng-model="$parent.search_query[value.name].text"></li>\r\n                                </ul>\r\n                            </div>\r\n                            <div ng-if="search_schema_number.indexOf(value.schema_type) >=0">\r\n                                <div class="fieldtitle">{{value.zh_name}}</div>\r\n                                <ul class="clearfix">\r\n                                    <li><div>\u6700\u5C0F\u503C(>=)</div><input type="text" ng-model="$parent.search_query[value.name].min"></li>\r\n                                    <li><div>\u6700\u5927\u503C(<=)</div><input type="text" ng-model="$parent.search_query[value.name].max"></li>\r\n                                </ul>\r\n                            </div>\r\n                            <div ng-if="value.schema_type == \'non-input\'">\r\n                                <div style="margin: 10px 10px 10px 0px;float: left;">{{value.zh_name}}</div>\r\n                                <div style="margin: 10px;float: left;">\r\n                                    <select ng-model="$parent.search_query[value.name]">\r\n                                        <option value="1">\u662F</option>\r\n                                        <option value="0">\u5426</option>\r\n                                    </select>\r\n                                </div>\r\n                            </div>\r\n                            <div ng-if="value.schema_type == \'date\'">\r\n                                <div class="fieldtitle">{{value.zh_name}}</div>\r\n                                <ul class="clearfix">\r\n                                    <li><div>\u5F00\u59CB\u65F6\u95F4</div><input type="datetime-local" ng-model="$parent.search_query[value.name].start"></li>\r\n                                    <li><div>\u622A\u6B62\u65F6\u95F4</div><input type="datetime-local" ng-model="$parent.search_query[value.name].end"></li>\r\n                                </ul>\r\n                            </div>\r\n                        </li>\r\n                        <li class="col-md-12 fieldgroup">\r\n                            <div>\r\n                                <div class="fieldtitle">\u521B\u5EFA\u65F6\u95F4</div>\r\n                                <ul class="clearfix">\r\n                                    <li><div>\u5F00\u59CB\u65F6\u95F4</div><input type="datetime-local" ng-model="search_query[\'__CREATE_TIME__\'].start"></li>\r\n                                    <li><div>\u622A\u6B62\u65F6\u95F4</div><input type="datetime-local" ng-model="search_query[\'__CREATE_TIME__\'].end"></li>\r\n                                </ul>\r\n                            </div>\r\n                        </li>\r\n                        <li class="col-md-12 fieldgroup">\r\n                            <div>\r\n                                <div class="fieldtitle">\u4FEE\u6539\u65F6\u95F4</div>\r\n                                <ul class="clearfix">\r\n                                    <li><div>\u5F00\u59CB\u65F6\u95F4</div><input type="datetime-local" ng-model="search_query[\'__MODIFY_TIME__\'].start"></li>\r\n                                    <li><div>\u622A\u6B62\u65F6\u95F4</div><input type="datetime-local" ng-model="search_query[\'__MODIFY_TIME__\'].end"></li>\r\n                                </ul>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary">\u641C\u7D22</button>\r\n                        <button class="btn btn-primary" ng-click="clear_query()">\u6E05\u7A7A</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>');
$templateCache.put('component/formatDate/formatDate.html','');
$templateCache.put('component/project/project.html','<div class="project pull-left">\r\n    <select class="form-control pull-left" ng-change="change(project_id._id)" ng-options="val.name for val in list" ng-model="project_id">\r\n        <option value="">--\u8BF7\u9009\u62E9--</option>\r\n    </select>\r\n</div>\r\n\r\n\r\n<div class="modal fade smallbox" id="edit_project" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u7F16\u8F91\u9879\u76EE</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form>\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u9879\u76EE\u540D\u79F0:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_project.name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary" ng-click="editProject()">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<div class="modal fade smallbox" id="create_project" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u65B0\u5EFA\u9879\u76EE</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form>\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u9879\u76EE\u540D\u79F0:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_project.name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary" ng-click="createProject()">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n\r\n\r\n<div class="modal fade bs-example-modal-lg" id="projectList" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u9879\u76EE\u7BA1\u7406</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <div class="list-block">\r\n                    <div class="list-panel">\r\n                        <div class="is-scrolled">\r\n                            <table class="table table-striped text-center table-hover list-table scrollTable">\r\n                                <thead>\r\n                                <tr>\r\n                                    <td>\u9879\u76EE\u540D\u79F0</td>\r\n                                    <td>\u521B\u5EFA\u65F6\u95F4</td>\r\n                                    <td>\u64CD\u4F5C</td>\r\n                                </tr>\r\n                                </thead>\r\n                                <tbody>\r\n                                <tr ng-repeat="val in list">\r\n                                    <td>{{val.name}}</td>\r\n                                    <td>{{val.__CREATE_TIME__}}</td>\r\n                                    <td><a ng-click="showEditProject(val)">\u7F16\u8F91</a></td>\r\n                                    <!--<td><a ng-click="deleteProject(val._id)">\u5220\u9664</a></td>-->\r\n                                </tr>\r\n                                </tbody>\r\n                            </table>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n                <div class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n                <button id="buttonClose" class="btn btn-primary" data-dismiss="modal">Close</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>');
$templateCache.put('component/index/index.html','<div class="modal fade smallbox" id="create_index" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u65B0\u5EFA\u7D22\u5F15</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form>\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u7D22\u5F15:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_index.keys" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary" ng-click="createindex()">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n');
$templateCache.put('component/schema/schema.html','<div class="modal fade smallbox" id="create_schema" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u65B0\u5EFA\u5C5E\u6027</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form>\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u82F1\u6587\u540D:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_schema.name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u4E2D\u6587\u540D:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_schema.zh_name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u7C7B\u578B:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <select class="form-control" ng-options="x as y for (x, y) in schema_type"\r\n                                            ng-model="create_schema.schema_type">\r\n                                        <option value="">--\u8BF7\u9009\u62E9--</option>\r\n                                    </select>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u5907\u6CE8:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_schema.remark" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u6743\u91CD:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="number" class="form-control" ng-model="create_schema.sort" placeholder="0">\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u5217\u8868\u663E\u793A:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <select class="form-control" ng-model="create_schema.visible" ng-options="o.v as o.n for o in [{ n: \'\u662F\', v: true }, { n: \'\u5426\', v: false }]">\r\n                                        <option value="">--\u8BF7\u9009\u62E9--</option>\r\n                                    </select>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary" ng-click="createSchema()">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class="modal fade smallbox" id="edit_schema" tabindex="-1" data-backdrop="static" data-keyboard="false">\r\n    <div class="modal-dialog">\r\n        <div class="modal-content">\r\n            <div class="modal-header">\r\n                <h4 class="modal-title">\u7F16\u8F91\u5C5E\u6027</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <form>\r\n                    <ul class="verticalList">\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u82F1\u6587\u540D:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_schema.name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u4E2D\u6587\u540D:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_schema.zh_name" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u7C7B\u578B:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <select class="form-control" ng-options="x as y for (x, y) in schema_type"\r\n                                            ng-model="create_schema.schema_type">\r\n                                        <option value="">--\u8BF7\u9009\u62E9--</option>\r\n                                    </select>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u5907\u6CE8:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="text" class="form-control" ng-model="create_schema.remark" required>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u6743\u91CD:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <input type="number" class="form-control" ng-model="create_schema.sort">\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n\r\n                        <li>\r\n                            <div class="form-group">\r\n                                <label class="col-md-4 clearPadding">\u5217\u8868\u663E\u793A:</label>\r\n                                <div class="col-md-8 clearPadding">\r\n                                    <select class="form-control" ng-model="create_schema.visible" ng-options="o.v as o.n for o in [{ n: \'\u662F\', v: true }, { n: \'\u5426\', v: false }]">\r\n                                    </select>\r\n                                </div>\r\n                            </div>\r\n                        </li>\r\n                    </ul>\r\n                    <div class="btngroup">\r\n                        <button class="btn btn-primary" ng-click="saveSchema()">\u786E\u8BA4</button>\r\n                        <button class="btn btn-danger" data-dismiss="modal">\u53D6\u6D88</button>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>');
$templateCache.put('component/userinfo/userinfo.html','<div class="user pull-right">\r\n    <div class="dropdown">\r\n        <div class="dropdown-toggle" id="dropdownMenu1" data-toggle="dropdown">\r\n            <img class="profile_picture" src="dist/component/userinfo/images/photo.jpg" alt="">\r\n            <span class="caret"></span>\r\n        </div>\r\n        <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">\r\n            <li role="presentation"><a href="#statistics" tabindex="-1">\u5B58\u50A8\u7A7A\u95F4\u7EDF\u8BA1</a></li>\r\n            <li role="presentation"><a href="#profile" tabindex="-1">\u6162\u67E5\u8BE2\u7EDF\u8BA1</a></li>\r\n            <li role="presentation" ><a role="menuitem" tabindex="-1" ng-click="clickNewProject()">\u65B0\u5EFA\u9879\u76EE</a></li>\r\n            <li role="presentation"><a role="menuitem" tabindex="-1"  ng-click="clickProjectManger()">\u9879\u76EE\u7BA1\u7406</a></li>\r\n            <li role="presentation"><a role="menuitem" tabindex="-1" ng-click="signOut()">\u9000\u51FA\u767B\u5F55</a></li>\r\n        </ul>\r\n    </div>\r\n</div>\r\n');}]);