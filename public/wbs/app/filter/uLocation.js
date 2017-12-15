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