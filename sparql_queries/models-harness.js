var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')

function ModelsHarness() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        fs.readFile(__dirname + '/models_queries/all_models.rq', function (err, allModelsQueryFile) {
            var filters = utils.buildFilters(terms);

            con.query({
                database: 'PROD',
                query: allModelsQueryFile.toString().replace("##ABOUT##", filters)
            },
                function (models_results) {
                    callback(utils.transformToJSON(models_results))
                });
        });

    };
    
    this.queryString = function(terms, callback) {
        fs.readFile(__dirname + '/models_queries/all_models.rq', function (err, allModelsQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allModelsQueryFile.toString().replace("##ABOUT##", filters);
            
            callback({query: queryString});
        });  
    };
};

module.exports = new ModelsHarness;