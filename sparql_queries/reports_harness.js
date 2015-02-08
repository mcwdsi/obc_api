var fs = require('fs');
var stardog = require('stardog');

var reports_harness = new function() {
    this.query = function (callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        fs.readFile(__dirname + '/reports_queries/all_reports.rq', function (err, all_reports_query_file) {
            con.query({
                    database: 'DEV',
                    query: all_reports_query_file.toString()
                },
                function (reports_results) {
                    callback(transformToJson(reports_results))
                }
            )
        })

    }

    this.search_query = function (filters, callback) {

    }

};

function transformToJson(reports_results){
    var returned_results = reports_results.results.bindings;
    var transformed_results = [];
    for(var i in returned_results) {
        var result_row = {};
        for(var key in returned_results[i]) {
            if (returned_results[i][key] != undefined) {
                result_row[key] = returned_results[i][key].value;
            }
        }
        transformed_results.push(result_row);
    }
    return transformed_results;
}

module.exports = reports_harness;