var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');

function ReportsHarness() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/reports_queries/all_reports.rq', function (err, allReportsQueryFile) {

            var filters = utils.buildFilters(terms);

            con.query({
                database: 'PROD',
                query: allReportsQueryFile.toString().replace("##ABOUT##", filters)
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
                .replace(/##TITLE##/g, reportData.title)
                .replace(/##LINKOUT##/g, reportData.linkout)
                .replace(/##SOURCE##/g, reportData.authors)
                .replace(/##DATE##/g, reportData.date)
                .replace(/##TYPE##/g, utils.lookupTypeURI(reportData.artifactType))
                .replace(/##DOI##/g, reportData.doi)
                .replace(/##ABOUTS##/g, aboutsUpdate);
                
                console.log(queryString);

            con.query({
                database: 'PROD',
                query: queryString
            },
                function (results) {
                    callback();
                });
        });
    };

};

module.exports = new ReportsHarness;