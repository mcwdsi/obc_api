var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')

function DatasetsHarness() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        fs.readFile(__dirname + '/datasets_queries/all_datasets.rq', function (err, allDatasetsQueryFile) {
            var filters = utils.buildFilters(terms);

            con.query({
                    database: 'PROD',
                    query: allDatasetsQueryFile.toString().replace("##ABOUT##", filters)
                },
                function (datasets_results) {
                    callback(utils.transformToJSON(datasets_results));
                }
            );
        });

    };
    
    this.queryString = function(terms, callback) {
        fs.readFile(__dirname + '/datasets_queries/all_datasets.rq', function (err, allDatasetsQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allDatasetsQueryFile.toString().replace("##ABOUT##", filters);
            
            callback({query: queryString});
        });  
    };

};

module.exports = new DatasetsHarness;