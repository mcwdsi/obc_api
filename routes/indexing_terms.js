var express = require('express');
var router = express.Router();
var harness = require('../queries/query_harness')

/* GET roots. */
router.get('/', function(req, res, next) {
    //get list of indexing terms
    harness.indexing_terms(function(data) {
        res.json(data);
    })
});

module.exports = router;