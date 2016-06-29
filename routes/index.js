var express = require('express');
var router = express.Router();


// // route middleware that will happen on every request
// router.use(function(req, res, next) {
//     // log each request to the console
//     console.log(req.method, req.url);

//     // continue doing what we were doing and go to the route
//     next(); 
// });

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index');
// });

// router.get('/about', function (req, res) {
//   res.render('about');
// });

// router.get('/documentation', function (req, res) {
//   res.render('documentation');
// });

// router.get('/app', function (req, res) {
//   res.render('app');
// });

// router.get('/users/signup', function (req, res) {
//   res.render('signUp');
// });

// // route with parameters (http://localhost:8080/hello/:name)
// router.get('/hello/:name', function(req, res) {
//   res.send('hello ' + req.params.name + '!');

// });

module.exports = router;
