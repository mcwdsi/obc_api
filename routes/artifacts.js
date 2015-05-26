var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query-harness')
var utils = require('./utils');
var auth = require('../auth')

/* GET relevant DB info if logged in. */
router.get('/:uri/abouts', function(req, res, next) {
    var uri = req.params.uri;
    console.log(uri);
    harness.artifactAbouts(uri, function(data){
        res.json(data);
    });
    
});

module.exports = router;