var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')

var DatasetsHarness = new function() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        fs.readFile(__dirname + '/datasets_queries/all_datasets.rq', function (err, all_datasets_query_file) {
            var filters = utils.buildFilters(terms);

            con.query({
                    database: 'PROD',
                    query: all_datasets_query_file.toString().replace("##ABOUT##", filters)
                },
                function (datasets_results) {
                    callback(utils.transformToJSON(datasets_results))
                }
            )
        })

    }

};

module.exports = DatasetsHarness;