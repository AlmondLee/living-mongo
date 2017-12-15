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


