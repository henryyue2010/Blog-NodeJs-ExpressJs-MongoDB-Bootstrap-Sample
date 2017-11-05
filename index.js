var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite')(__dirname);
var routes = require('./routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');

var app = express();

// set template directory
app.set('views', path.join(__dirname, 'views'));
// set template engine to ejs
app.set('view engine', 'ejs');

// set static file directory
app.use(express.static(path.join(__dirname, 'public')));

// bootstrap
//app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));

// font-awesome
//app.use('/font-awesome', express.static(__dirname + '/node_modules/font-awesome/'));

// popper
//app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist/umd/'));

// session
app.use(session({
  name: config.session.key,// store session's key to cookie
  secret: config.session.secret,// set secret to calculate hash value, store it in the cookie
  resave: true,// resave session
  saveUninitialized: false,// create session for not logged in user
  cookie: {
    maxAge: config.session.maxAge// cookie expire time，session id will be deleted after cookie expires
  },
  store: new MongoStore({// store session into mongodb
    url: config.mongodb// mongodb url
  })
}));
// flash, for notification
app.use(flash());
// for form and file upload
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'),// file upload dir
  keepExtensions: true// store the file extension
}));

// set template global constants
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

// add variables
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});

// log file
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));

// router
routes(app);

// error log
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));

// error page
app.use(function (err, req, res, next) {
  res.render('error', {
    error: err
  });
});

if (module.parent) {
  module.exports = app;
} else {
  // monitor port，start program
    const port = process.env.PORT || config.port;
    app.listen(port, function () {
        console.log(`${pkg.name} listening on port ${port}`);
    });
}
