var gulp = require('gulp')

gulp.task('make', ['clean'], function () {
    gulp.start(['dev-lib', 'dev-app', 'dev-theme'])
})
