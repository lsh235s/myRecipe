var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');          
var mysql_dbc = require('./commons/db_con')();
var indexRouter = require('./routes/index');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var app = express();

var helmet = require('helmet');

app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.disable('x-powered-by');

app.set('trust proxy', 1) // trust first proxy
//resave 세션아이디를 접속할때마다 발급하지 않는다 

app.use(session({
	  key: 'bugsboxpasswordkey', 
	  secret: 'lhlslj',
	  name: 'bugsbox3lee',
	  resave: false,
	  saveUninitialized: true,
	  cookie:{maxAge:1800000, secure:false},
	  store: new MySQLStore(mysql_dbc.mainsession())
}));

                                                           
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

//Port setting
var server = app.listen(3200, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
});
console.log('Server Start');

