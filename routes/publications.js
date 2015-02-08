var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query_harness')

/* GET list of publications. */
router.get('/', function(req, res, next) {
    //get list of publications
    harness.publications(function(data) {
        res.json(data);
    })
});

module.exports = router;