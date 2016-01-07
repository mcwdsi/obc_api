/* global __dirname */
var validURL = require('valid-url');
var fs = require('fs');
var stardog = require('stardog');
var config = require('../config');
var q = require('q');

function Utils() {

    var ecosystemURIs = [
        'http://purl.obolibrary.org/obo/APOLLO_SV_00000100',
        'http://purl.obolibrary.org/obo/APOLLO_SV_00000104',
        'http://purl.obolibrary.org/obo/APOLLO_SV_00000097'
    ];
    
    this.getNewURI = function(){
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        
        var deferred = q.defer();
        
        fs.readFile(__dirname + '/uris_queries/uris.rq', function (err, urisQueryFile) {

            con.query({
                database: 'DEV',
                query: urisQueryFile.toString()
            },
                function (results) {
                    var prefix = 'http://www.pitt.edu/obc/IDE_ARTICLE_';
                    var uri = results.results.bindings[0].uri.value;
                    
                    var regex = new RegExp(prefix + '(.*)', 'g');
                    var num = regex.exec(uri)[1];
                    var suffix = pad(++num, 10);
                    var newURI = prefix + suffix;
                    deferred.resolve(newURI);
                });
        });
        return deferred.promise;
    };

    this.transformToJSON = function(sparql_results){
        var returned_results = sparql_results.results.bindings;
        var transformed_results = [];
        for(var i in returned_results) {
            var result_row = {};
            for(var key in returned_results[i]) {
                if (returned_results[i][key] !== undefined && returned_results[i][key].value !== '') {
                    result_row[key] = returned_results[i][key].value;
                }
            }
            if(Object.keys(result_row).length !== 0){
                transformed_results.push(result_row);
            }
        }
        return transformed_results;
    };

    this.buildFilters = function(terms){
        var filters = '';
        for(var i in terms){

            var uri = terms[i];

            var filter = "";

            //kludge for ecosystem queries until we work out the representation issues
            if(ecosystemURIs.indexOf(uri) >= 0){
                filter += "    {\n        ?information obo:IAO_0000136 <" + uri + ">\n    } UNION {\n" +
                "        ?information obo:IAO_0000136 [ obo:BFO_0000137*/rdf:type <" + uri + ">] \n    } UNION {\n" +
                "        ?information obo:IAO_0000136 [ \n" +
                "            ro:has_participant/obo:BFO_0000137*/ro:located_in/obo:BFO_0000137*/^ro:located_in/^obo:BFO_0000137* <" + uri + "> ] .\n    }";
            } else {
                filter += "    {\n        ?information obo:IAO_0000136 <" + uri + "> \n    } UNION {\n" +
                "        ?information obo:IAO_0000136 [ rdf:type/rdfs:subClassOf* <" + uri + ">] \n    } UNION {\n" +
                "        ?information obo:IAO_0000136 [ \n" +
                "            ro:has_participant*/obo:BFO_0000137*/ro:located_in* <" + uri + "> ] .\n    }";
            }



            filters = filters + "\n" + filter;
        }
        return filters;
    };
    
    this.lookupTypeURI = function(artifactType) {
        var types = 
        {'data set': 'http://purl.obolibrary.org/obo/IAO_0000100',
         'publication': 'http://purl.obolibrary.org/obo/IAO_0000311',
         'epidemic model': 'http://purl.obolibrary.org/obo/APOLLO_SV_00000001',
         'report': 'http://purl.obolibrary.org/obo/IAO_0000088',
         'software': 'http://purl.obolibrary.org/obo/IAO_0000010'};
         
         return types[artifactType];
    };
};

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

module.exports = new Utils;
