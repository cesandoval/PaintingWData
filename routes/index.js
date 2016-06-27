var express = require('express');
var router = express.Router();

// psql package import
var pg = require('pg');

// var conString = "postgres://postgres:postgrespass@localhost/PaintingWithData_Riyadh";
// var client = new pg.Client(conString);
// client.connect();

// Postgress connection client
var client = new pg.Client({
    user: 'postgres',
    password: 'postgrespass',
    database: 'PaintingWithData_Riyadh',
});
client.connect();

// Some example queries
// client.query("CREATE TABLE IF NOT EXISTS emps(firstname varchar(64), lastname varchar(64))");
// client.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Ronald', 'McDonald']);
// client.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Mayor', 'McCheese']);


// route middleware that will happen on every request
router.use(function(req, res, next) {
    // log each request to the console
    console.log(req.method, req.url);

    // continue doing what we were doing and go to the route
    next(); 
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/about', function (req, res) {
  res.render('about');
});

router.get('/documentation', function (req, res) {
  res.render('documentation');
});

router.get('/app', function (req, res) {
  res.render('app');
});

router.get('/signup', function (req, res) {
  res.render('signUp');
});

router.route('/login')
  // show the form (GET http://localhost:8080/login)
  .get(function(req, res) {
    res.send('this is the login form');
  })

    // process the form (POST http://localhost:8080/login)
  .post(function(req, res) {
    console.log('processing');
    res.send('processing the login form!');
  });

// route with parameters (http://localhost:8080/hello/:name)
router.get('/hello/:name', function(req, res) {
  res.send('hello ' + req.params.name + '!');

});

module.exports = router;
