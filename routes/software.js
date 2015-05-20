var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query-harness')
var utils = require('./utils');
var auth = require('../auth');

/* GET list of software. */
router.get('/', function(req, res, next) {
    //pass through only valid URLs
    var validTerms = utils.validateTerms(req.query.term);

    //get list of software
    harness.software(validTerms, function(data) {
        res.json(data);
    });
});

router.get('/query', function(req, res, next){
    var token = req.query.token;
    
    if(auth.isValidToken(token)){
        //pass through only valid URLs
        var validTerms = utils.validateTerms(req.query.term);

        //get software query
        harness.softwareQuery(validTerms, function(data) {
            res.json(data);
        });
    } else {
        res.sendStatus(401);
    }
});

module.exports = router;