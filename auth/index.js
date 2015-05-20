var stardog = require('stardog');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');

function Auth() {
    this.getNewSessionID = function(user, pass) {
		var dbPass = this.getPassFromDB(user);
		
		if(dbPass === undefined){
			return {'error': true, 'msg': 'User not found.'};
		} else if(bcrypt.compareSync(pass, dbPass)){
			return this.generateNewSessionID(user);
		} else {
			return {'error': true, 'msg': 'Password incorrect.'};
		}

	};
	
	this.isValidSession = function(sessionID) {
		if(sessionID === '12345'){
			return true;
		} else {
			return false;
		}
	};
	
	this.getPassFromDB = function(user){
		if(user === 'test'){
			return bcrypt.hashSync('pass', 10);
		} else {
			return undefined;
		}
	};
	
	this.generateNewSession = function(user) {
		var session = uuid.v4();
		return session;
	};
};

module.exports = new Auth;
