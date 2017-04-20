var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');
var http = require('http');

function grantHarness() {
    var agent = new http.Agent({ maxSockets: 15 });
        
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/grants_queries/all_grants.rq', function (err, allGrantQueryFile) {

            var filters = utils.buildGrantFilters(terms);
            con.query({
                database: config.stardogDB,
                query: allGrantQueryFile.toString().replace("##ABOUT##", filters),
                agent: agent
            }, function (grant_results) {
                    callback(utils.transformGrantsToJSON(grant_results))
                });
        });

    };


    this.queryString = function (terms, callback) {
        fs.readFile(__dirname + '/grants_queries/all_grants.rq', function (err, allGrantQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allGrantQueryFile.toString().replace("##ABOUT##", filters);
            callback({ query: queryString });
        });
    };

    this.update = function (grantData, callback) {
        fs.readFile(__dirname + '/grants_queries/update_grant.rq', function (err, updategrantQueryFile) {
            var aboutsUpdate = '';
            for (var i in grantData.abouts) {
                aboutsUpdate += '<' + grantData.uri + '> obo:IAO_0000136 <' + grantData.abouts[i].uri + '> .\n        ';
            }
            grantData.abouts = aboutsUpdate
            if(grantData.grantid == undefined){
                utils.getNewURI().then(function (uri) {
                      var prefix = 'http://www.pitt.edu/obc/IDE_ARTICLE_';
                      var completeURI = prefix + (++uri)
                      grantData.grantid = completeURI 
                      executeQuery(grantData , updategrantQueryFile);
                       callback();
                  });
            }
            else {
                executeQuery(grantData, updategrantQueryFile);
                 callback();
            }
        
            
    });
}

    function executeQuery(grantData , updategrantQueryFile){

        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        var queryString = updategrantQueryFile.toString()
                .replace(/##GRANTS##/g, grantData.uri)
                .replace(/##TITLE##/g, grantData.title !== undefined ? grantData.title : "")
                .replace(/##LINKOUT##/g, grantData.grantLinkout !== undefined ? grantData.grantLinkout : "")
                .replace(/##PI##/g, grantData.authors !== undefined ? grantData.authors : "")
                .replace(/##TYPE##/g, utils.lookupTypeURI(grantData.artifactType))
                .replace(/##START##/g, grantData.start !== undefined ? grantData.start : "")
                .replace(/##END##/g, grantData.end !== undefined ? grantData.end : "")
                .replace(/##AGENCY##/g, grantData.agency !== undefined ? grantData.agency : "")
                .replace(/##FOA##/g, grantData.foa !== undefined ? grantData.foa : "")
                .replace(/##AWARDEE##/g, grantData.awardee !== undefined ? grantData.awardee : "")
                .replace(/##DATEINDEXED##/g, grantData.dateIndexed !== undefined ? grantData.dateIndexed : new Date().toISOString())
                .replace(/##GRANTID##/g,  grantData.grantid)
                .replace(/##GRANTIDLABEL##/g, grantData.grantidlabel !== undefined ? grantData.grantidlabel : "")
                .replace(/##ABOUTS##/g, grantData.abouts);
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