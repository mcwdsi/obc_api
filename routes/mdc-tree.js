var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query-harness')

/* GET tree of indexing terms. */
router.get('/', function(req, res, next) {
    harness.retrievalMDCTerms(function(data) {
        res.json(data);
    });
});

module.exports = router;