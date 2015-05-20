var express = require('express');
var router = express.Router();
var auth = require('../auth');

/* GET your user account details. */
router.get('/me', function(req, res, next) {
	var token = req.query.token;

	if(auth.isValidToken(token)){
		var username = auth.getUserFromToken(token);
		res.json({'username': username});	
	} else {
		res.sendStatus(401);
	}
});

module.exports = router;