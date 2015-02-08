var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query_harness')

/* GET tree of indexing terms. */
router.get('/', function(req, res, next) {
    harness.indexing_terms(function(data) {
        res.json(data);
    })
});

module.exports = router;