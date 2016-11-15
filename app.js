var express = require('express'),
    path = require('path');
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

var passport = require('passport');
    flash = require('express-flash'),
    session = require('express-session'),
    jsonParser = bodyParser.json();


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: '4564f6s4fdsfdfd', 
  resave: true,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

//--------User-Auth----------

// app.use(session({ secret: '4564f6s4fdsfdfd', resave: false, saveUninitialized: false }))
app.use(flash())
app.use(function(req, res, next) {
    res.locals.errorMessage = req.flash('error')
    next()
});



var Strategies = require('./app/controllers/signUpController');
passport.use('signup', Strategies.SignUpStrategy);
passport.use('login', Strategies.LoginStrategy);

// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
//----------------------------

app.use(express.static(path.join(__dirname, 'public')));

// This is for PostGRES
var appRouter = require('./app/routers/appRouter');
var users = require('./app/routers/users');
var datajson = require('./app/routers/datajson');


app.use('/users', userRouter);
app.use('/', appRouter);
app.use('/datajson', datajson);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err)
    res.json({
      message: err.message,
      error: err
    });
  });
}

 // production error handler
 // no stacktraces leaked to user
 app.use(function(err, req, res, next) {
   res.status(err.status || 500);
   res.json({
     message: err.message,
     error: {}
   });
 });


module.exports = app;
