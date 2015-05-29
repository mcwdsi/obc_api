/* global __dirname */
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
    
    this.update = function (modelData, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        
        fs.readFile(__dirname + '/models_queries/update_model.rq', function (err, updateModelsQueryFile) {
   
            var aboutsUpdate = '';        
            for(var i in modelData.abouts){
                aboutsUpdate += '<' + modelData.uri + '> obo:IAO_0000136 <' + modelData.abouts[i].uri + '> .\n        '; 
            }
            
            var queryString = updateModelsQueryFile.toString()
                .replace(/##MODEL##/g, modelData.uri)
                .replace(/##TITLE##/g, modelData.title !== undefined ? modelData.title : "")
                .replace(/##LINKOUT##/g, modelData.linkout !== undefined ? modelData.linkout : "")
                .replace(/##SOURCE##/g, modelData.authors !== undefined ? modelData.authors : "")
                .replace(/##DATE##/g, modelData.date !== undefined ? modelData.date : "")
                .replace(/##TYPE##/g, utils.lookupTypeURI(modelData.artifactType))
                .replace(/##VERSION##/g, modelData.version !== undefined ? modelData.version : "")
                .replace(/##DOI##/g, modelData.doi !== undefined ? modelData.doi : "")                
                .replace(/##ABOUTS##/g, aboutsUpdate);

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

module.exports = new ModelsHarness;