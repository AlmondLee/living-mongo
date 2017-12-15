var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var config = require('./config')

gulp.task('dev-theme-css', function () {
        gulp.src(['public/wbs/theme/{common,component,page}/**/*.less'])
            .pipe($.less())
            .pipe($.concat('theme.css'))
            .pipe(gulp.dest('public/wbs/dist'))
})
