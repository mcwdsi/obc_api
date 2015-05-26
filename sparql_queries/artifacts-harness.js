var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')
var config = require('../config');

function ArtifactsHarness() {
    this.abouts = function (artifact, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        
        

        fs.readFile(__dirname + '/artifact_queries/artifact_abouts.rq', function (err, artifactAboutsQueryFile) {
            con.query({
                    database: 'PROD',
                    query: artifactAboutsQueryFile.toString().replace("##ARTIFACT##", artifact)
                },
                function (artifactAbouts) {
                    console.log(artifactAboutsQueryFile.toString().replace("##ARTIFACT##", artifact));
                    callback(utils.transformToJSON(artifactAbouts));
                }
            );
        });

    };
};

module.exports = new ArtifactsHarness;