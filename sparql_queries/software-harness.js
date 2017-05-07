var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');
var http = require('http');

function SoftwareHarness() {
    var agent = new http.Agent({ maxSockets: 15 });
        
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/software_queries/all_software.rq', function (err, allSoftwareQueryFile) {

            var filters = utils.buildFilters(terms);

            con.query({
                database: config.stardogDB,
                query: allSoftwareQueryFile.toString().replace("##ABOUT##", filters),
                agent: agent
            },
                function (software_results) {
                    callback(utils.transformToJSON(software_results))
                });
        });

    };

    this.queryString = function (terms, callback) {
        fs.readFile(__dirname + '/software_queries/all_software.rq', function (err, allSoftwareQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allSoftwareQueryFile.toString().replace("##ABOUT##", filters);

            callback({ query: queryString });
        });
    };

    this.update = function (softwareData, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/software_queries/update_software.rq', function (err, updateSoftwareQueryFile) {

            var aboutsUpdate = '';
            for (var i in softwareData.abouts) {
                aboutsUpdate += '<' + softwareData.uri + '> obo:IAO_0000136 <' + softwareData.abouts[i].uri + '> .\n        ';
            }

            var queryString = updateSoftwareQueryFile.toString()
                .replace(/##SOFTWARE##/g, softwareData.uri)
                .replace(/##TITLE##/g, softwareData.title !== undefined ? softwareData.title : "")
                .replace(/##LINKOUT##/g, softwareData.linkout !== undefined ? softwareData.linkout : "")
                .replace(/##SOURCE##/g, softwareData.authors !== undefined ? softwareData.authors : "")
                .replace(/##DATE##/g, softwareData.date !== undefined ? softwareData.date : "")
                .replace(/##TYPE##/g, utils.lookupTypeURI(softwareData.artifactType))
                .replace(/##VERSION##/g, softwareData.version !== undefined ? softwareData.version : "")
                .replace(/##DOI##/g, softwareData.doi !== undefined ? softwareData.doi : "")
                .replace(/##DATEINDEXED##/g, softwareData.dateIndexed !== undefined ? softwareData.dateIndexed : new Date().toISOString())
                .replace(/##ABOUTS##/g, aboutsUpdate);
                
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

module.exports = new SoftwareHarness;