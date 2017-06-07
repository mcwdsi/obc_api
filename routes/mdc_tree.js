var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query-harness')
var utils = require('./utils');
var auth = require('../auth');

/* GET tree of indexing terms. */
router.get('/', function(req, res, next) {
    harness.retrievalMDCTerms(function(data) {
        res.json(data);
    });
});

module.exports = router;
