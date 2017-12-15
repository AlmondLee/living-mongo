angular.module('ued').service('Info',function (WebApi) {
    var Info = {
        "project_id" : null,
        "collection_id" : null,
        "collection_schema" : []
    }


    return Info
})