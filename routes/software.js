var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query_harness')

/* GET list of software. */
router.get('/', function(req, res, next) {
    //get list of software
    harness.software(function(data) {
        res.json(data);
    })
});

module.exports = router;