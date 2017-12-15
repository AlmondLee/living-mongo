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