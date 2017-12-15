angular.module('ued').factory('indexModal', ['$compile', '$rootScope', function ($compile, $rootScope) {
    return function() {
        var elm;
        var modal = {
            open: function() {

                var html = '<div class="modal" ng-style="modalStyle">{{modalStyle}}<div class="modal-dialog" style="width: 600px;"><div class="modal-content"><div class="modal-header"></div><div class="modal-body"><div id="grid1" ui-grid="gridOptions_index" ui-grid-selection ui-grid-edit class="grid" style="height: 400px;"></div></div><div class="modal-footer"><button id="buttonClose" class="btn btn-primary" ng-click="close()">Close</button></div></div></div></div>';
                elm = angular.element(html);
                angular.element(document.body).prepend(elm);

                $rootScope.close = function() {
                    modal.close();
                };

                $rootScope.modalStyle = {"display": "block"};

                $compile(elm)($rootScope);
            },
            close: function() {
                if (elm) {
                    elm.remove();
                }
            }
        };

        return modal;
    };
}]);