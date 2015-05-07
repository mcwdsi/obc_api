var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')

var ModelsHarness = new function() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        fs.readFile(__dirname + '/models_queries/all_models.rq', function (err, all_models_query_file) {
            var filters = utils.buildFilters(terms);

            con.query({
                database: 'PROD',
                query: all_models_query_file.toString().replace("##ABOUT##", filters)
            },
                function (models_results) {
                    callback(utils.transformToJSON(models_results))
                }
                )
        })

    }
};

module.exports = ModelsHarness;