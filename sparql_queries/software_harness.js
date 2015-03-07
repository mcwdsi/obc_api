var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')

var software_harness = new function() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        fs.readFile(__dirname + '/software_queries/all_software.rq', function (err, all_software_query_file) {

            var filters = utils.buildFilters(terms);

            con.query({
                    database: 'PROD',
                    query: all_software_query_file.toString().replace("##ABOUT##", filters)
                },
                function (software_results) {
                    callback(utils.transformToJSON(software_results))
                }
            )
        })

    }

};

module.exports = software_harness;