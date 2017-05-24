var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query-harness')
var utils = require('./utils');
var auth = require('../auth');

/* GET tree of indexing terms. */
router.get('/', function(req, res, next) {
    harness.retrievalMDCElements(function(data) {
        res.json(data);
    });
});

router.get('/query', function(req, res, next){
        var terms = {
            type: req.query.type,
        	pathogen: req.query.pathogen,
        	host: req.query.host,
        	location: req.query.location,
            measure: req.query.measure
        }
        //send to harness
        harness.MDCSearch(terms, function(data) {
            res.json(data);
        });
});

module.exports = router;