var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')

function SoftwareHarness() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        fs.readFile(__dirname + '/software_queries/all_software.rq', function (err, allSoftwareQueryFile) {

            var filters = utils.buildFilters(terms);

            con.query({
                    database: 'PROD',
                    query: allSoftwareQueryFile.toString().replace("##ABOUT##", filters)
                },
                function (software_results) {
                    callback(utils.transformToJSON(software_results))
                });
        });

    };
    
    this.queryString = function(terms, callback) {
        fs.readFile(__dirname + '/software_queries/all_software.rq', function (err, allSoftwareQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allSoftwareQueryFile.toString().replace("##ABOUT##", filters);
            
            callback({query: queryString});
        });  
    };

};

module.exports = new SoftwareHarness;