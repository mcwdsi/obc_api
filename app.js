/* global __dirname */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var indexing_terms = require('./routes/indexing-terms');
var publications = require('./routes/publications');
var datasets = require('./routes/datasets');
var models = require('./routes/models');
var reports = require('./routes/reports');
var software = require('./routes/software');
var artifacts = require('./routes/artifacts');
var grants = require('./routes/grants');
var pubs_page = require('./routes/pubs_page')
var open_query = require('./routes/open_query')
var mdc_tree = require('./routes/mdc_tree')
var mdc_search_retrieval = require('./routes/mdc_search')
var meter = require('./routes/meter')

var tokens = require('./routes/tokens');
var users = require('./routes/users');
var db = require('./routes/database');
var contacts = require('./routes/contacts');


var app = express();
//enabling cors
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/indexing_terms', indexing_terms);
app.use('/publications', publications);
app.use('/datasets', datasets);
app.use('/models', models); 
app.use('/reports', reports);
app.use('/software', software);
app.use('/tokens', tokens);
app.use('/users', users);
app.use('/database', db);
app.use('/artifacts', artifacts);
app.use('/contacts', contacts);
app.use('/grants', grants);
app.use('/pubs_page', pubs_page);
app.use('/open_query', open_query);
app.use('/mdc_tree',mdc_tree);
app.use('/mdc_retrieval',mdc_search_retrieval);
app.use('/meter',meter);


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
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
