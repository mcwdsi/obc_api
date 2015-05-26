var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query-harness')

/* GET tree of indexing terms. */
router.get('/retrieval', function(req, res, next) {
    harness.retrievalTerms(function(data) {
        res.json(data);
    });
});

router.get('/indexing', function(req, res, next) {
    harness.indexingTerms(function(data) {
        res.json(data);
    });
});

module.exports = router;