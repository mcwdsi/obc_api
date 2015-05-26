var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');

function PublicationsHarness() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/publications_queries/all_publications.rq', function (err, allPublicationsQueryFile) {

            var filters = utils.buildFilters(terms);

            con.query({
                    database: 'PROD',
                    query: allPublicationsQueryFile.toString().replace("##ABOUT##", filters)
                },
                function (publications_results) {
                    callback(utils.transformToJSON(publications_results));
                }
            );
        });

    };
    
    this.queryString = function(terms, callback) {
        fs.readFile(__dirname + '/publications_queries/all_publications.rq', function (err, allPublicationsQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allPublicationsQueryFile.toString().replace("##ABOUT##", filters);
            
            callback({query: queryString});
        });  
    };
};



module.exports = new PublicationsHarness;