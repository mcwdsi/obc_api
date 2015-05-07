var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')

var ReportsHarness = new function() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        fs.readFile(__dirname + '/reports_queries/all_reports.rq', function (err, all_reports_query_file) {

            var filters = utils.buildFilters(terms);

            con.query({
                    database: 'PROD',
                    query: all_reports_query_file.toString().replace("##ABOUT##", filters)
                },
                function (reports_results) {
                    callback(utils.transformToJSON(reports_results))
                }
            )
        })

    }

};

module.exports = ReportsHarness;