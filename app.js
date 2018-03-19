var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    i18n = require('i18n')

var passport = require('passport'),
    flash = require('express-flash'),
    session = require('cookie-session')
// jsonParser = bodyParser.json();

var RedisServer = require('redis-server')

process.env.NODE_ENV = 'production'
// Simply pass the port that you want a Redis server to listen on.
var server = new RedisServer(6379)

server.open(err => {
    if (err === null) {
        console.log('redis server connected')
        // You may now connect a client to the Redis
        // server bound to `server.port` (e.g. 6379).
    }
})

var app = express()

if ('production' == app.get('env')) {
    // just for production code
}

if ('development' == app.get('env')) {
    // just for development code
    console.info('setting dev server...')
    var webpack = require('webpack'),
        webpackDevMiddleware = require('webpack-dev-middleware'),
        webpackHotMiddleware = require('webpack-hot-middleware'),
        webpackConfig = require('./webpack.config')

    var compiler = webpack(webpackConfig)

    app.use(
        webpackDevMiddleware(compiler, {
            hot: true,
            filename: 'bundle.js',
            publicPath: webpackConfig.output.publicPath,
            noInfo: true,
            stats: {
                colors: true,
            },
            historyApiFallback: true,
        })
    )

    app.use(
        webpackHotMiddleware(compiler, {
            log: console.log,
            path: '/__webpack_hmr',
            heartbeat: 10 * 1000,
        })
    )
}

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json({ limit: '50mb' }))
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
app.use(cookieParser())
app.use(
    session({
        secret: '4564f6s4fdsfdfd',
        resave: true,
        saveUninitialized: true,
    })
)
app.use(express.static(path.join(__dirname, 'public')))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

//--------User-Auth----------

// app.use(session({ secret: '4564f6s4fdsfdfd', resave: false, saveUninitialized: false }))
app.use(function(req, res, next) {
    res.locals.errorMessage = req.flash('error')
    next()
})

var Strategies = require('./app/controllers/signupController')
passport.use('signup', Strategies.SignUpStrategy)
passport.use('login', Strategies.LoginStrategy)
passport.use('facebookLogin', Strategies.FacebookLoginStrategy)
passport.use('googleLogin', Strategies.GoogleLoginStrategy)


app.use(express.static(path.join(__dirname, 'public')))

// Routes
var appRouter = require('./app/routers/appRouter')
var users = require('./app/routers/users')
app.use('/users', users)
app.use('/', appRouter)
// app.use('/datajson', datajson);

// language packages
i18n.configure({
    locales: ['en', 'ar'],
    directory: __dirname + '/locales',
})
app.use(i18n.init)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500)
        console.log(err)
        res.json({
            message: err.message,
            error: err,
        })
    })
}

// production error handler
// no stacktraces leaked to user
if (app.get('env') === 'production') {
    app.use(function(err, req, res) {
        res.status(err.status || 500)
        res.json({
            message: err.message,
            error: {},
        })
    })
}

console.log(38383838383, app.get('env') )
module.exports = app;
