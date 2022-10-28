var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var customerRouter = require('./routes/customer');

const bodyParser = require('body-parser');
const cors = require('cors');

var app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerDocumentFileName = './swagger.json';
const swaggerDocument = require(swaggerDocumentFileName);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/customer', customerRouter);

// catch 404 and forward to error handler
app.use(function (_, _, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, _) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
