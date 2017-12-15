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