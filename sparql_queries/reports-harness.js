var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')

function ReportsHarness() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

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
    
    this.queryString = function(terms, callback) {
        fs.readFile(__dirname + '/reports_queries/all_reports.rq', function (err, allReportsQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allReportsQueryFile.toString().replace("##ABOUT##", filters);
            
            callback({query: queryString});
        });  
    };

};

module.exports = new ReportsHarness;