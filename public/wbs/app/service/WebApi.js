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