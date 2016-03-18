/* global __dirname */
var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')
var config = require('../config');
var http = require('http'); 

function ArtifactsHarness() {
    var agent = new http.Agent({ maxSockets: 15 });    
        
    this.abouts = function (artifact, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/artifacts_queries/artifact_abouts.rq', function (err, artifactAboutsQueryFile) {
            con.query({
                database: config.stardogDB,
                query: artifactAboutsQueryFile.toString().replace("##ARTIFACT##", artifact),
                agent: agent
            },
                function (artifactAbouts) {
                    callback(utils.transformToJSON(artifactAbouts));
                }
                );
        });

    };
    
    this.delete = function (artifact, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        
        fs.readFile(__dirname + '/artifacts_queries/delete_artifact.rq', function (err, deleteQueryFile) {

            var queryString = deleteQueryFile.toString()
                .replace(/##ARTIFACT##/g, artifact);
            
            console.log(queryString);

            con.query({
                database: config.stardogDB,
                query: queryString,
                agent: agent
            },
                function (results) {
                    callback();
                });
        });
    };
};

module.exports = new ArtifactsHarness;