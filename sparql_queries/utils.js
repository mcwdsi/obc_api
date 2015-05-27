var validURL = require('valid-url');

function Utils() {

    var ecosystemURIs = [
        'http://purl.obolibrary.org/obo/APOLLO_SV_00000100',
        'http://purl.obolibrary.org/obo/APOLLO_SV_00000104',
        'http://purl.obolibrary.org/obo/APOLLO_SV_00000097'
    ];

    this.transformToJSON = function(sparql_results){
        var returned_results = sparql_results.results.bindings;
        var transformed_results = [];
        for(var i in returned_results) {
            var result_row = {};
            for(var key in returned_results[i]) {
                if (returned_results[i][key] != undefined) {
                    result_row[key] = returned_results[i][key].value;
                }
            }
            if(Object.keys(result_row).length !== 0){
                transformed_results.push(result_row);
            }
        }
        return transformed_results;
    }

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
         'model': 'http://purl.obolibrary.org/obo/APOLLO_SV_00000001',
         'report': 'http://purl.obolibrary.org/obo/IAO_0000088',
         'software': 'http://purl.obolibrary.org/obo/IAO_0000010'};
         
         return types[artifactType];
    };
};

module.exports = new Utils;
