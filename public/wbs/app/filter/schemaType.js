angular.module('ued').filter('schema_type', function(config) {

    return function(input) {
        if (!input){
            return '';
        } else {
            return config.schema_type[input];
        }
    };
})