var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query-harness')
var utils = require('./utils');

/* GET list of reports. */
router.get('/', function(req, res, next) {
    //pass through only valid URLs
    var validTerms = utils.validateTerms(req.query.term);

    //get list of reports
    harness.reports(validTerms, function(data) {
        res.json(data);
    })
});

module.exports = router;