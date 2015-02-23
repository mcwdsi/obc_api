var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query_harness')
var utils = require('./utils');

/* GET list of models. */
router.get('/', function(req, res, next) {
    //pass through only valid URLs
    var validTerms = utils.validateTerms(req.query.term);

    //get list of models
    harness.models(validTerms, function(data) {
        res.json(data);
    })
});

module.exports = router;