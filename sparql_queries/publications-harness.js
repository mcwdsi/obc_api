var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')

function PublicationsHarness() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

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