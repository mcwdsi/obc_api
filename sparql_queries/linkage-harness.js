var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');
var http = require('http');

function linkageHarness() {
    var agent = new http.Agent({ maxSockets: 15 });

    this.update = function (grantData, callback) {
        fs.readFile(__dirname + '/linking_queries/link_pub_to_grant.rq', function (err, updateLinkageFile) {
            executeQuery(linkData, updategrantQueryFile);
            callback();   
    });
}

    function executeQuery(linkData , updateLinkageFile){

        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        var queryString = updategrantQueryFile.toString()

                utils.getNewURI().then(functin (uri)){
                    var prefix = 'http://www.pitt.edu/obc/IDE_ARTICLE_';
                    var completeURI = prefix + (++uri)
                    var os = completeURI
                    var pp = prefix + (uri+2)
                    callback();
                }
                .replace(/##GRANTS##/g, linkData.grant)
                .replace(/##PP##/g, pp)
                .replace(/##OS##/g, os)
                .replace(/##PUBLICATION##/g, linkData.publication)
            con.query({
                database: config.stardogDB,
                query: queryString,
                agent: agent
            },
                function (results) {
                    console.log(results)
                });
        };


}








module.exports = new grantHarness;