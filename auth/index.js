/* global __dirname */
var stardog = require('stardog');
var fs = require('fs');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var q = require('q');
var jwt = require('jsonwebtoken');
var config = require('../config');

var secret = "asdflkjasdf";

function Auth() {
    this.getNewToken = function (user, pass) {
		
		//stupid JS 'this' binding nonsense requires me to do this to access the correct 'this' in the promise
		var self = this;
		
		var dbPassPromise = this._getPassFromDB(user);
		
		return dbPassPromise.then(function(dbPass){
			if (dbPass === undefined) {
				return { 'error': true, 'msg': 'Incorrect username.' };
			} else if (bcrypt.compareSync(pass, dbPass)) {
				return self._generateNewToken(user);
			} else {
				return { 'error': true, 'msg': 'Incorrect password.' };
			}
		});
		
	};

	this.isValidToken = function (token) {
		try{
			//if we can decrypt without errors, it's valid
			jwt.verify(token, secret);
			return true;
		} catch (e) {
			//if we can't verify, it's not valid
			console.log(e);
			return false;
		}
	};
	
	this.getUserFromToken = function (token) {
		try{
			return jwt.verify(token, secret);
		} catch (e) {
			return undefined;
		}
	};

	this._getPassFromDB = function (user) {
		
		var con = new stardog.Connection();
		con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
		
		var deferred = q.defer();
		
		fs.readFile(__dirname + '/sparql/read-password.rq', function (err, passwordFile) {
			
			con.query({
                    database: config.stardogDB,
                    query: passwordFile.toString().replace(/##USERNAME##/g, user)
                },
                function (passwordResults) {
					if(passwordResults.results.bindings.length > 0){
						var dbPass = passwordResults.results.bindings[0].passData.value;
						deferred.resolve(dbPass);
					} else {
						deferred.resolve(undefined); 
					}
                }
            );

		});
		
		return deferred.promise;
	
	};

	this._generateNewToken = function (user) {
		 var token = jwt.sign(user, secret, {
          expiresInMinutes: 1440 // expires in 24 hours
        });
		return token;
	};
};

module.exports = new Auth;
