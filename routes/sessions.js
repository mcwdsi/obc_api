var express = require('express');
var router = express.Router();
var harness = require('../auth/')

/* GET tree of indexing terms. */
router.get('/', function(req, res, next) {
    harness.indexing_terms(function(data) {
        res.json(data);
    })
});

module.exports = router;