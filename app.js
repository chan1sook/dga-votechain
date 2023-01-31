const express = require('express');
const path = require('path');
const morganLogger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const redis = require("redis")
const RedisStore = require("connect-redis")(session);
const keyConfig = require('./config');

const index = require('./routes/index');
const admin = require('./routes/admin');
const { initAdmins, isAdminRole } = require("./helper");

const redisClient = redis.createClient({ legacyMode: true });
redisClient.connect().catch(console.error);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morganLogger('dev'));
app.use(session({
  store: new RedisStore({ client: redisClient }),
  saveUninitialized: false,
  resave: true,
  rolling: true,
  secret: process.env.SESSION_SECRET,
  maxAge: 2 * 24 * 60 * 60 * 1000,
}));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    isAdmin: isAdminRole(req.session.userData),
	});
});

/**************************************MongoDB Database***************************************/
const mongoURI = keyConfig.mongoURI;

app.db = mongoose.createConnection(mongoURI);

app.db.on('error', console.error.bind(console, 'mongoose connection error: '));

app.db.once('open', function () {
  console.log("Connected to ", mongoURI);

  initAdmins(app.db).catch(console.error);
});

const { models } = require('./model');
models(app, mongoose);

/**************************************MongoDB Database***************************************/

const debug = require('debug')('dga-votechain-node:server');
const http = require('http');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log('Listening on ' + bind);
}

module.exports = server;