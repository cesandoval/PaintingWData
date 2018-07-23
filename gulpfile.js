var gulp = require('gulp')
// var gutil = require('gulp-util')
gulp.task('default', ['watch'])

/*
const eslint = require('gulp-eslint')

var browserify = require('browserify')

const source = require('vinyl-source-stream')
const glob = require('glob')
const rename = require('gulp-rename')
const es = require('event-stream')

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

gulp.task('vue-lint', () => {
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return (
        gulp
            .src(['./private/vue/*.*'])
            // eslint() attaches the lint output to the "eslint" property
            // of the file object so it can be used by other modules.
            .pipe(
                eslint({
                    configFile: './private/vue/.eslintrc_vue.js',
                    warnFileIgnored: true,
                    ignorePath: '.gitignore',
                    // fix: true,
                })
            )
            // eslint.format() outputs the lint results to the console.
            // Alternatively use eslint.formatEach() (see Docs).
            .pipe(eslint.format())
            // To have the process exit with an error code (1) on
            // lint error, return the stream and pipe to failAfterError last.
            .pipe(eslint.failAfterError())
    )
})

gulp.task('vue:watch', function() {
    // gulp.watch(['private/vue/*.*'], ['vue-lint', 'vueify'])
    gulp.watch(['private/vue/*.*'], ['vueify'])
})
*/

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
