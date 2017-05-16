var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');
var http = require('http');

function linkageHarness() {
    var agent = new http.Agent({ maxSockets: 15 });

    this.update = function (linkData, callback) {
        console.log(linkData)
        fs.readFile(__dirname + '/linking_queries/link_pub_to_grant.rq', function (err, updateLinkageFile) {
            executeQuery(linkData, updateLinkageFile);
            callback();   
    });
}

    function executeQuery(linkData , updateLinkageFile){

        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        var os = ''
        var pp = ''

        utils.getNewURI().then(function (uri) {
            console.log("newURI")
            var prefix = 'http://www.pitt.edu/obc/IDE_ARTICLE_';
            var completeURI = prefix + (++uri)
            os = completeURI;
            console.log(os)
            pp = prefix + (uri+2);
            console.log(pp)

            var queryString = updateLinkageFile.toString()

            .replace(/##GRANTS##/g, linkData.grantURI)
            .replace(/##PP##/g, pp)
            .replace(/##OS##/g, os)
            .replace(/##PUBLICATION##/g, linkData.uri);


            console.log(queryString)

             con.query({
                database: config.stardogDB,
                query: queryString,
                agent: agent
            },
                function (results) {
                    console.log(results)
                });

            callback();
        });

           
        };


}



module.exports = new linkageHarness;