var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var config = require('./config')

gulp.task('dev-theme-js', function () {
    var htmlFilter = $.filter('**/*.html', {restore: true})
    gulp.src([
        'public/wbs/theme/**/*.js',
        'public/wbs/theme/**/*.html',
        '!public/wbs/theme/config.js'
    ])
        .pipe(htmlFilter)
        .pipe($.replace(/(src\s*?=\s*?["'])([^({{|http://|https://)])/g, '$1dist/$2'))
        .pipe($.replace(/(url\s*?\(\s*?["'])([^({{|http://|https://)])/g, '$1dist/$2'))
        .pipe($.angularTemplatecache('theme.js', {module: 'ued'}))
        .pipe(htmlFilter.restore)
        .pipe($.concat('theme.js'))
        .pipe(gulp.dest('public/wbs/dist'))
})
