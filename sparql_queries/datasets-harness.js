/* global __dirname */
var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');

function DatasetsHarness() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/datasets_queries/all_datasets.rq', function (err, allDatasetsQueryFile) {
            var filters = utils.buildFilters(terms);

            con.query({
                database: 'PROD',
                query: allDatasetsQueryFile.toString().replace("##ABOUT##", filters)
            },
                function (datasets_results) {
                    callback(utils.transformToJSON(datasets_results));
                });
        });

    };

    this.queryString = function (terms, callback) {
        fs.readFile(__dirname + '/datasets_queries/all_datasets.rq', function (err, allDatasetsQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allDatasetsQueryFile.toString().replace("##ABOUT##", filters);

            callback({ query: queryString });
        });
    };

    this.update = function (datasetData, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/datasets_queries/update_dataset.rq', function (err, updateDatasetsQueryFile) {

            var aboutsUpdate = '';
            for (var i in datasetData.abouts) {
                aboutsUpdate += '<' + datasetData.uri + '> obo:IAO_0000136 <' + datasetData.abouts[i].uri + '> .\n        ';
            }

            var queryString = updateDatasetsQueryFile.toString()
                .replace(/##DATASET##/g, datasetData.uri)
                .replace(/##TITLE##/g, datasetData.title)
                .replace(/##LINKOUT##/g, datasetData.linkout)
                .replace(/##SOURCE##/g, datasetData.authors)
                .replace(/##DATE##/g, datasetData.date)
                .replace(/##TYPE##/g, utils.lookupTypeURI(datasetData.artifactType))
                .replace(/##DOI##/g, datasetData.doi)                
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

module.exports = new DatasetsHarness;