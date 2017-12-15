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