var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');
var http = require('http');

function ReportsHarness() {
    var agent = new http.Agent({ maxSockets: 15 });
        
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/reports_queries/all_reports.rq', function (err, allReportsQueryFile) {

            var filters = utils.buildFilters(terms);

            con.query({
                database: config.stardogDB,
                query: allReportsQueryFile.toString().replace("##ABOUT##", filters),
                agent: agent
            },
                function (reports_results) {
                    callback(utils.transformToJSON(reports_results));
                });
        });

    };

    this.queryString = function (terms, callback) {
        fs.readFile(__dirname + '/reports_queries/all_reports.rq', function (err, allReportsQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allReportsQueryFile.toString().replace("##ABOUT##", filters);

            callback({ query: queryString });
        });
    };

    this.update = function (reportData, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/reports_queries/update_report.rq', function (err, updateReportsQueryFile) {

            var aboutsUpdate = '';
            for (var i in reportData.abouts) {
                aboutsUpdate += '<' + reportData.uri + '> obo:IAO_0000136 <' + reportData.abouts[i].uri + '> .\n        ';
            }

            var queryString = updateReportsQueryFile.toString()
                .replace(/##REPORT##/g, reportData.uri)
                .replace(/##TITLE##/g, reportData.title !== undefined ? reportData.title : "")
                .replace(/##LINKOUT##/g, reportData.linkout !== undefined ? reportData.linkout : "")
                .replace(/##SOURCE##/g, reportData.authors !== undefined ? reportData.authors : "")
                .replace(/##DATE##/g, reportData.date !== undefined ? reportData.date : "")
                .replace(/##TYPE##/g, utils.lookupTypeURI(reportData.artifactType))
                .replace(/##DOI##/g, reportData.doi !== undefined ? reportData.doi : "")
                .replace(/##DATEINDEXED##/g, reportData.dateIndexed !== undefined ? reportData.dateIndexed : new Date().toISOString())
                .replace(/##ABOUTS##/g, aboutsUpdate);

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

module.exports = new ReportsHarness;