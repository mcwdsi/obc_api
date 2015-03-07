var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils')

var publications_harness = new function() {
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        fs.readFile(__dirname + '/publications_queries/all_publications.rq', function (err, all_publications_query_file) {

            var filters = utils.buildFilters(terms);
            console.log(all_publications_query_file.toString().replace("##ABOUT##", filters))

            con.query({
                    database: 'PROD',
                    query: all_publications_query_file.toString().replace("##ABOUT##", filters)
                },
                function (publications_results) {
                    callback(utils.transformToJSON(publications_results))
                }
            )
        })

    }
};



module.exports = publications_harness;