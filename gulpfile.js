var gulp = require('gulp')
// var gutil = require('gulp-util')

var browserify = require('browserify')

const source = require('vinyl-source-stream')
const glob = require('glob')
const rename = require('gulp-rename')
const es = require('event-stream')

gulp.task('default', ['vueify', 'watch'])
gulp.task('vueify', function(done) {
    glob('./private/vue/*.js', function(err, files) {
        if (err) done(err)

        const tasks = files.map(function(entry) {
            return (
                browserify({ entries: [entry] })
                    // .transform([vueify, babelify]) // defined at package.json
                    .bundle()
                    .pipe(source(entry))
                    .pipe(rename({ dirname: '/' }))
                    .pipe(gulp.dest('./public/javascripts/vue'))
            )
        })
        es.merge(tasks).on('end', done)
    })
})

gulp.task('vue:watch', function() {
    gulp.watch(['private/vue/*.*'], ['vueify'])
})

/*
var source = require('vinyl-source-stream')
var chalk = require('chalk')

var livereload = require('gulp-livereload')

function errHandler(error) {
    gutil.log(chalk.red(error.toString()) + '\n' + error.codeFrame)
    gutil.log('Waiting...')
    this.emit('end')
}

gulp.task('default', ['build', 'watch'])

gulp.task('build', function() {
    var stream = browserify({
        entries: './private/jsx/entry.js',
        extensions: ['.js'],
        debug: true,
    })
        .transform(babelify, {
            presets: ['es2015', 'react'],
            plugins: ['transform-class-properties'],
        })
        .bundle()
        .on('error', errHandler)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./public/javascripts/'))
        .pipe(livereload())

    return stream
})
*/
