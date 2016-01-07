var express = require('express');
var router = express.Router();
var utils = require('./utils');
var auth = require('../auth')
var config = require('../config');

/* GET relevant DB info if logged in. */
router.get('/', function(req, res, next) {
    var token = req.query.token;
    
    if(auth.isValidToken(token)){
        //todo: make configurable
        res.json({dbName: config.stardogDB});
    } else {
		res.sendStatus(401);
    }
    
});

module.exports = router;