var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query-harness')
var utils = require('./utils');
var auth = require('../auth');

/* GET tree of the meter data. */
router.get('/', function(req, res, next) {
	var terms = {
        type: req.query.type,
    }
    harness.retrievalMeter(terms,function(data) {
        res.json(data);
    });
});

module.exports = router;