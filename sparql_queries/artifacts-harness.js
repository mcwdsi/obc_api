/* global __dirname */
var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')
var config = require('../config');

function ArtifactsHarness() {
    this.abouts = function (artifact, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/artifacts_queries/artifact_abouts.rq', function (err, artifactAboutsQueryFile) {
            con.query({
                database: 'DEV',
                query: artifactAboutsQueryFile.toString().replace("##ARTIFACT##", artifact)
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
                database: 'DEV',
                query: queryString
            },
                function (results) {
                    callback();
                });
        });
    };
};

module.exports = new ArtifactsHarness;