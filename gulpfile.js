var gulp = require('gulp');
var gutil = require('gulp-util');

var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var chalk = require('chalk');

var livereload = require('gulp-livereload');


function errHandler(error){
    gutil.log(chalk.red(error.toString()) + "\n"
             + error.codeFrame);
    gutil.log("Waiting...")
    this.emit('end')
}


gulp.task('default', ['build', 'watch']);


gulp.task('build', function() {
    var stream = browserify({
        entries: './private/jsx/entry.js',
        extensions: ['.js'],
        debug: true
    })
    .transform(babelify, {presets: ['es2015', 'react']})
    .bundle()
    .on('error', errHandler)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public/javascripts/'))
    .pipe(livereload());

return stream;
});

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch(['private/jsx/**/*.js'], ['build'])
})