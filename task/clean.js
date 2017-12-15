var gulp = require('gulp')
var $ = require('gulp-load-plugins')()

gulp.task('clean', function () {
    return gulp.src([
        'public/wbs/dist/**/*.*',
    ], {read: false})
        .pipe($.clean())
})
