var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var config = require('./config')

gulp.task('dev-theme-files', function () {
    gulp.src(['public/wbs/theme/**/*.*', '!public/wbs/theme/**/*.{less,js,html}'])
        .pipe(gulp.dest('public/wbs/dist'))
})