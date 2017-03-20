/* global __dirname */
var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')
var config = require('../config');
var http = require('http'); 

function OpenHarness() {
    var agent = new http.Agent({ maxSockets: 15 });    
        
    this.query = function (terms, callback) {
        console.log("Calling Open query")
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/open_queries/open_queries.rq', function (err, openQueryFile) {

            var filters = utils.buildGrantFilters(terms);
            con.query({
                database: config.stardogDB,
                query: openQueryFile.toString().replace("##ABOUT##", filters),
                agent: agent
            }, function (open_results) {
                    callback(utils.transformToJSON(open_results))
                });
        });

    };
};

module.exports = new OpenHarness;