angular.module('ued', [
    'ngRoute',
    'ngCookies',
    'ngTouch',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.pagination',
    'ui.grid.edit',
    'ngFileUpload',
    'ui.grid.resizeColumns'
])



angular.element(document).ready(function () {
    angular.bootstrap(document, ['ued'])
})


var routes = [
    'index', // 首页
    'login', // 登陆
    'test', // test
    'statistics',
    'profile',
    'auth',
]

angular.module('ued')
.config(function ($routeProvider) {
    routes.forEach(function (name) {
        $routeProvider.when('/' + name, {
            controller: name,
            controllerAs: name,
            templateUrl: 'page/' + name + '/' + name + '.html'
        })
    })

    $routeProvider.otherwise({
        redirectTo: '/login'
    })
})
angular.module('ued').filter('encode', function () {
    return function (url) {
        return encodeURIComponent(url)
    }
})
angular.module('ued').filter('rmb', function () {
    /**
     * 人民币以分为单位 / 100 得到元，再保留两位小数，千位不分割
     * 如要千位分割 可以  {{ value | rmb | rmb2 }}
     * @param text 单位:分
     */
    return function (text) {
        text = parseInt(text); // 为啥不是parseFloat呢。因为分已经是最小单位了，如果有小数点 直接舍去
        return isNaN(text) ? '--' : (text / 100).toFixed(2);
    }
})
angular.module('ued').filter('rmb2', function () {
    /**
     * 人民币千位分割
     * @param value 单位:元
     * @param 保留几位小数 默认2
     */
    return function (value, n) {
        value = parseFloat(value)
        return isNaN(value) ? '--' : value.toFixed(n != null ? n : 2)
            .replace(/./g, function (c, i, a) {
                return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c
            })
    }
})
angular.module('ued').filter('rmb3', function () {
    return function (value) {
        return (value < 0 ? '' : '+') + value
    }
})
angular.module('ued').filter('schema_type', function(config) {

    return function(input) {
        if (!input){
            return '';
        } else {
            return config.schema_type[input];
        }
    };
})
angular.module('ued').filter('trust', function ($sce) {
    return function (source) {
        return $sce.trustAsHtml(source)
    }
})
angular.module('ued').filter('uLocation', function (uLocation) {
    return function (hash) {
        if (hash == null) {
            return ''
        }
        hash = String(hash).trim()
        if (hash == '') {
            return ''
        }
        if (hash == '#' || /^javascript/i.test(hash)) {
            return 'javascript:;'
        }
        if(/^http/i.test(hash)) {
            return hash
        }
        return uLocation.getHref(hash)
    }
})
angular.module('ued').service('HtmlUtil', function () {
    var HtmlUtil = {
        /*1.用浏览器内部转换器实现html转码*/
        htmlEncode: function (html) {
            //1.首先动态创建一个容器标签元素，如DIV
            var temp = document.createElement("div");
            //2.然后将要转换的字符串设置为这个元素的innerText(ie支持)或者textContent(火狐，google支持)
            (temp.textContent != undefined ) ? (temp.textContent = html) : (temp.innerText = html);
            //3.最后返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
            var output = temp.innerHTML;
            temp = null;
            return output;
        },
        /*2.用浏览器内部转换器实现html解码*/
        htmlDecode: function (text) {
            //1.首先动态创建一个容器标签元素，如DIV
            var temp = document.createElement("div");
            //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
            temp.innerHTML = text;
            //3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
            var output = temp.innerText || temp.textContent;
            temp = null;
            return output;
        }
    }

    return HtmlUtil
})

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
angular.module('ued').service('Info',function (WebApi) {
    var Info = {
        "project_id" : null,
        "collection_id" : null,
        "collection_schema" : []
    }


    return Info
})
angular.module('ued').service('Request', function ($timeout) {
    var Request = {}

    /**
     * 当前ajax请求个数
     * @type {number}
     */
    Request.count = 0

    /**
     * 是否本地环境
     * @type {Boolean}
     */
    Request.isLocal = /^(127\.0\.0\.1|localhost|192\.)/.test(window.location.hostname)

    /**
     * 底层ajax请求
     * @param {Object} options
     * @returns {*}
     */
    Request.ajax = function (options) {
        var def = $.Deferred()
        Request.count++
        // 如果是本地环境,并且URL非http开始的路径,使用mock数据
        // if (Request.isLocal && !/^http/i.test(options.url)) {
        //     options.url = 'mock' + options.url + '.json'
        //     options.type = 'GET'
        // } else {
            // 非跨域请求 上CDN后 影响接口调用,拼上绝对路径
            if (options.url.indexOf('http') === -1) {
                options.url = window.location.origin + options.url
            }
        // }

        $.ajax(options).always(function () {
            Request.count--
            NProgress.start();
            // console.log('ajax');
        }).then(function (res) {
            NProgress.done();
            $timeout(function () {
                if (res.success) {
                    def.resolve(res)
                } else {
                    if(res.error_code == 401){
                        window.location.href = 'http://'+window.location.host
                    }
                    alert(res.errorMsg);
                    def.reject(res)
                }
            })
        }, function (err) {
            NProgress.done();
            $timeout(function () {
                def.reject({
                    success: false,
                    errorMsg: '网络繁忙,请稍候重试!'
                })
            })
        })

        return def.promise()
    }

    /**
     * GET请求
     * @param {String} url
     * @param {Object|String} [data]
     * @returns {*}
     */
    Request.get = function (url, data) {
        return Request.ajax({
            type: 'GET',
            url: url,
            data: data,
            dataType: 'json'
        })
    }

    /**
     * JSONP请求
     * @param {String} url
     * @param {Object|String} [data]
     * @returns {*}
     */
    Request.jsonp = function (url, data) {
        return Request.get(url + '?jsonpcallback=?', data)
    }

    /**
     * POST请求
     * @param {String} url
     * @param {Object|String} [data]
     * @returns {*}
     */
    Request.post = function (url, data) {
        return Request.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'json'
        })
    }

    /**
     * 带文件上传的ajax POST表单提交
     * @param {String} url
     * @param {FormData} data
     * @returns {*}
     */
    Request.upload = function (url, data) {
        return Request.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'json',
            contentType: false,
            processData: false
        })
    }

    return Request
})
angular.module('ued').service('StringUtil', function () {
    var StringUtil = {}

    StringUtil.getByteLength = function (value) {
        return value.replace(/[^\x00-\xff]/g, "**").length
    }

    return StringUtil
})
angular.module('ued').factory('modal', ['$compile', '$rootScope', function ($compile, $rootScope) {
    return function() {
        var elm;
        var modal = {
            open: function() {

                var html = '<div class="modal" ng-style="modalStyle">{{modalStyle}}<div class="modal-dialog" style="width: 1200px;"><div class="modal-content"><div class="modal-header"></div><div class="modal-body"><div id="grid1" ui-grid="gridOptions" ui-grid-selection ui-grid-edit class="grid" style="height: 700px;"></div></div><div class="modal-footer"><button id="buttonClose" class="btn btn-primary" ng-click="close()">Close</button></div></div></div></div>';
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
angular.module('ued').service('uLocation', function () {
    var location = window.location

    return {
        getHref: function (hash) {
            return location.protocol + '//' + location.host + location.pathname + (hash || '')
        },

        href: function (hash) {
            location.href = this.getHref(hash)
        },
        
        replace: function (hash) {
            location.replace(this.getHref(hash))
        }
    }
})
angular.module('ued').service('Validate', function () {
    var Validate = {}

    /**
     * 是否为空
     * @param value
     * @returns {boolean}
     */
    Validate.isEmpty = function (value) {
        return value == null || !String(value).trim()
    }

    /**
     * 是否为手机号码
     * @param value
     * @returns {boolean}
     */
    Validate.isMobile = function (value) {
        return /^\d{11}$/.test(value)
    }

    /**
     * 是否为数字
     * @param value
     * @returns {boolean}
     */
    Validate.isNumber = function (value) {
        return !Validate.isEmpty(value) && !isNaN(value)
    }

    return Validate
})
angular.module('ued').service('WebApi', function (Request, $cookies) {
    var WebApi = {}


    /**
     * 登录
     * @returns {*}
     */
    WebApi.login = function (user_name, password) {
        return Request.post('/login', {
            user_name: user_name,
            password: password
        })
    }

    /**
     * 登出
     * @returns {*}
     */
    WebApi.logout = function (user_name, password) {
        return Request.get('/logout')
    }

    /**
     * 新建项目
     * @returns {*}
     */
    WebApi.saveProject = function (data) {
        return Request.post('/wbs/project/save', data)
    }

    /**
     * 新建或编辑集合
     * @returns {*}
     */
    WebApi.saveCollection = function (project_id, data) {
        data.project_id = project_id
        return Request.post('/wbs/collection/save', data)
    }

    /**
     * 删除集合
     * @returns {*}
     */
    WebApi.deleteCollection = function (data) {
        return Request.post('/wbs/collection/remove', data)
    }

    /**
     * demo2pro_collection
     * @returns {*}
     */
    WebApi.demo2pro_collection = function (data) {
        return Request.post('/wbs/collection/demo2pro', data)
    }

    /**
     * pro2demo_collection
     * @returns {*}
     */
    WebApi.pro2demo_collection = function (data) {
        return Request.post('/wbs/collection/pro2demo', data)
    }

    /**
     * clear_collection
     * @returns {*}
     */
    WebApi.clear_collection = function (data) {
        return Request.post('/wbs/document/clear-table', data)
    }


    /**
     * 集合列表
     * @returns {*}
     */
    WebApi.indexCollection = function (params, project_id) {
        params.project_id = project_id
        return Request.get('/wbs/collection/index', params)
    }

    /**
     * 所有项目
     * @returns {*}
     */
    WebApi.allProject = function () {
        return Request.get('/wbs/project/get-all')
    }

    /**
     * 删除项目
     * @returns {*}
     */
    WebApi.deleteProject = function (id) {
        return Request.get('/wbs/project/delete', {
            id: id
        })
    }

    /**
     * 属性列表
     * @returns {*}
     */
    WebApi.allSchema = function (collection_id) {
        return Request.get('/wbs/schema/get-collection-schema', {
            collection_id: collection_id
        })
    }

    /**
     * 新建属性
     * @returns {*}
     */
    WebApi.saveSchema = function (collection_id, data) {
        data.collection_id = collection_id
        return Request.post('/wbs/schema/save', data)
    }

    /**
     * 新建属性
     * @returns {*}
     */
    WebApi.saveAllSchema = function (data) {
        return Request.post('/wbs/schema/save-all', {"data":data})
    }

    /**
     * 删除属性
     * @returns {*}
     */
    WebApi.deleteSchema = function (id) {
        return Request.get('/wbs/schema/delete', {
            id: id
        })
    }


    /**
     * 新建或编辑文档
     * @returns {*}
     */
    WebApi.saveDocument = function (collection_id, data) {
        var j = {}
        $.extend(j, data);
        json = {
            "collection_id": collection_id,
            "data": j
        }
        return Request.post('/wbs/document/save', json)
    }

    /**
     * 保存所有
     * @returns {*}
     */
    WebApi.saveAll = function (collection_id, data) {
        var j = {}
        $.extend(j, data);
        json = {
            "collection_id": collection_id,
            "data": j
        }
        return Request.post('/wbs/document/save-all', json)
    }

    /**
     * 文档列表
     * @returns {*}
     */
    WebApi.indexDocument = function (params, collection_id) {
        params.collection_id = collection_id
        return Request.post('/wbs/document/index', params)
    }

    /**
     * 文档删除
     * @returns {*}
     */
    WebApi.deleteDocument = function (collection_id, ids) {
        return Request.post('/wbs/document/delete', {
            ids: ids,
            collection_id: collection_id,
        })
    }
    /**
     * 统计
     * @returns {*}
     */
    WebApi.statistics = function () {
        return Request.post('/wbs/statistics/index')
    }

    /**
     * 慢查询统计
     * @returns {*}
     */
    WebApi.profile = function (params) {
        return Request.post('/wbs/profile/index', params)
    }

    /**
     * 所有索引
     * @returns {*}
     */
    WebApi.allindex = function (collection_id) {
        return Request.post('/wbs/index/index', {"collection_id": collection_id})
    }

    /**
     * 创建索引
     * @returns {*}
     */
    WebApi.createindex = function (collection_id, keys) {
        return Request.post('/wbs/index/create', {"collection_id": collection_id, "keys": keys})
    }

    /**
     * 删除索引
     * @returns {*}
     */
    WebApi.deleteindex = function (collection_id, index_name) {
        return Request.post('/wbs/index/delete', {"collection_id": collection_id, "index_name": index_name})
    }


    /**
     * 获取全部用户
     * @returns {*}
     */
    WebApi.allUser = function () {
        return Request.post('/wbs/auth/all-user')
    }

    /**
     * 获取用户权限
     * @returns {*}
     */
    WebApi.userAuth = function (user_id) {
        return Request.post('/wbs/auth/user-auth', {"user_id": user_id})
    }

    /**
     * 更改用户权限
     * @returns {*}
     */
    WebApi.saveAuth = function (data) {
        return Request.post('/wbs/auth/save-auth', data)
    }
    return WebApi
})