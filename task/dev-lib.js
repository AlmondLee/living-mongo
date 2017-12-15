var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var config = require('./config')

gulp.task('dev-lib',  function () {
    return gulp.src(config.getConfig().lib)
        .pipe($.concat('lib.js'))
        .pipe(gulp.dest('public/wbs/dist'))
})