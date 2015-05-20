var express = require('express');
var router = express.Router();
var auth = require('../auth')

/* POST to sessions to create new session ID. */
router.post('/', function(req, res, next) {
	var user = req.body.user;
	var pass = req.body.pass;
    
	var sessionID = auth.getNewSessionID(user, pass);
	if(typeof sessionID.error !== 'undefined'){
		res.cookie(sessionID);
		res.json({'session': sessionID});
	} else {
		res.json(sessionID);
	}
});

router.get('/:sessionID', function(req, res, next) {
	var sessionValid = auth.isValidSession(req.params.sessionID);
	
	if(sessionValid === true){
		res.sendStatus(200);
	} else {
		res.sendStatus(404);
	}
});

module.exports = router;