var express = require('express');
var router = express.Router();
var harness = require('../sparql_queries/query-harness')
var utils = require('./utils');
var auth = require('../auth')

/* GET relevant DB info if logged in. */
router.get('/:uri/abouts', function (req, res, next) {
    var uri = req.params.uri;
    harness.artifactAbouts(uri, function (data) {
        res.json(data);
    });

});

// PUT (update) artifact with provided data

router.put('/:uri', function (req, res, next) {
    var uri = req.params.uri;
    var token = req.body.token;
    var artifact = req.body.artifact;

    // if (!auth.isValidToken(token)) {
    //     res.sendStatus(401);
    //     return;
    // }

    if (uri !== artifact.uri) {
        res.sendStatus(406, 'URI of payload does not match PUT URL');
        return;
    }

    harness.update(artifact, function (data) {
        res.sendStatus(200);
    });
});

router.post('/', function (req, res, next) {
    var token = req.body.token;
    var artifact = req.body.artifact;

    // if (!auth.isValidToken(token)) {
    //     res.sendStatus(401);
    //     return;
    // }

    harness.saveNew(artifact, function (data) {
        res.sendStatus(200);
    });
});

router.delete('/:uri', function (req, res, next) {
    var uri = req.params.uri;
    var token = req.headers.token;

    if (!auth.isValidToken(token)) {
        res.sendStatus(401);
        return;
    }

    harness.delete(uri, function (data) {
        res.sendStatus(200);
    });
});

module.exports = router;