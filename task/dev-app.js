var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var config = require('./config')

gulp.task('dev-app', function () {
    return gulp.src(config.getConfig().app)
        .pipe($.concat('app.js'))
        .pipe(gulp.dest('public/wbs/dist'))
})