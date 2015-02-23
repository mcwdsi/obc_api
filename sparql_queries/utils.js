var validURL = require('valid-url');

var utils = new function() {
    this.transformToJSON = function(publications_results){
        var returned_results = publications_results.results.bindings;
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

    this.buildFilters = function(terms){
        var filters = '';
        for(i in terms){
            var uri = terms[i];
            var filter = "\t{ ?information <http://purl.obolibrary.org/obo/IAO_0000136> <" + uri + "> } UNION {\n" +
                "\t?information <http://purl.obolibrary.org/obo/IAO_0000136> [ rdf:type/rdfs:subClassOf* <" + uri + ">] } .\n";

            filters = filters + "\n" +  filter
        }
        return filters;
    }
}

module.exports = utils;
