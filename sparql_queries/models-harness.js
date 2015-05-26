var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');

function ModelsHarness() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

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