var express = require('express');
var router = express.Router();
var auth = require('../auth')

/* POST to tokens to create new token. */
router.post('/', function(req, res, next) {
	var user = req.body.user;
	var pass = req.body.pass;
    
	var tokenPromise = auth.getNewToken(user, pass);
	
	tokenPromise.then(function(token){	
		if(typeof token.error === 'undefined'){
			res.json({'token': token});

		} else {
			res.json(token);
		}		
	});
	
});

router.get('/:token', function(req, res, next) {
	var tokenValid = auth.isValidToken(req.params.token);
	
	if(tokenValid === true){
		res.sendStatus(200);
	} else {
		res.sendStatus(404);
	}
});

module.exports = router;