var fs = require('fs');
var stardog = require('stardog');

var models_harness = new function() {
    this.query = function (callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        fs.readFile(__dirname + '/models_queries/all_models.rq', function (err, all_models_query_file) {
            con.query({
                    database: 'DEV',
                    query: all_models_query_file.toString()
                },
                function (models_results) {
                    callback(transformToJson(models_results))
                }
            )
        })

    }

    this.search_query = function (filters, callback) {

    }

};

function transformToJson(models_results){
    var returned_results = models_results.results.bindings;
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

module.exports = models_harness;