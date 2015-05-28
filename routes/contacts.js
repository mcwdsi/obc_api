var express = require('express');
var router = express.Router();
var utils = require('./utils');
var auth = require('../auth')
var mailer = require('nodemailer');
var config = require('../config');

/* GET relevant DB info if logged in. */
router.post('/', function(req, res, next) {
    var email = req.body.email;
	var subject = req.body.subject;
    var msg = req.body.message;
    
    var transporter = mailer.createTransport();
    
    transporter.sendMail({
        from: 'OBC.IDE@obc.io',
        to: config.contactEmail,
        subject: subject,
        text: 'from: ' + email + '\n\n' + msg
    });
    
    res.sendStatus(200);
    
});

module.exports = router;