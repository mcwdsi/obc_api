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
                database: config.stardogDB,
                query: urisQueryFile.toString()
            },
                function (results) {
                    var prefix = 'http://www.pitt.edu/obc/IDE_ARTICLE_';
                    var uri = results.results.bindings[0].uri.value;
                    var regex = new RegExp(prefix + '(.*)', 'g');
                    var num = regex.exec(uri)[1];
                    var suffix = pad(++num, 10);
                    deferred.resolve(suffix);
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

    this.transformPubsToJSON = function(sparql_results){
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
        
        return eliminateDuplicatesPubsByGrant(transformed_results);
    };

    this.transformGrantsToJSON = function(sparql_results){
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
        
        return eliminateDuplicatesByGrant(transformed_results);

    };

    this.transformGrantsToJSONPubsPage = function(sparql_results){
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
        
        return eliminateDuplicatesByPub(transformed_results);
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

    this.buildGrantFilters = function(terms){
        var filters = '';
        for(var i in terms){

            var uri = terms[i];

            var filter = "";

            //kludge for ecosystem queries until we work out the representation issues
            if(ecosystemURIs.indexOf(uri) >= 0){
                filter += "    {\n        ?grant obo:IAO_0000136 <" + uri + ">\n    } UNION {\n" +
                "        ?grant obo:IAO_0000136 [ obo:BFO_0000137*/rdf:type <" + uri + ">] \n    } UNION {\n" +
                "        ?grant obo:IAO_0000136 [ \n" +
                "            ro:has_participant/obo:BFO_0000137*/ro:located_in/obo:BFO_0000137*/^ro:located_in/^obo:BFO_0000137* <" + uri + "> ] .\n    }";
            } else {
                filter += "    {\n        ?grant obo:IAO_0000136 <" + uri + "> \n    } UNION {\n" +
                "        ?grant obo:IAO_0000136 [ rdf:type/rdfs:subClassOf* <" + uri + ">] \n    } UNION {\n" +
                "        ?grant obo:IAO_0000136 [ \n" +
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
         'software': 'http://purl.obolibrary.org/obo/IAO_0000010',
         'grant': 'http://purl.obolibrary.org/obo/OBI_0001636'
     };
         
         return types[artifactType];
    };
};

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function eliminateDuplicatesByPub(data){
    var titleList = {};
    var result = []
    var pis = []
     for (var i in data) {
      var title = data[i].pubName
      //eliminate any duplicated pi
        if (!(title in titleList)){
          titleList[title] = data[i]
          pis.push(data[i].pi);
          titleList[title].pi = pis;
        }
        else {
            var found = false;
            for (var x in titleList[title].pi){
                var piSaved = titleList[title].pi[x]
                if ((data[i].pi) === piSaved){
                    found = true
                }
            }
            if (found != true){
                titleList[title].pi.push(data[i].pi)
            }
        }
        pis = []
      }
      for (var key in titleList){
        result.push(titleList[key]);
      }
     return result;
  }

  function eliminateDuplicatesPubsByGrant(data){
    var titleList = {};
    var result = []
    var grants = []
    var foa = []
     for (var i in data) {
      var title = data[i].title
      //eliminate any duplicated grants
        if (!(title in titleList)){
          titleList[title] = data[i]
          grants.push(data[i].grantTitle);
          foa.push(data[i].foa);
          titleList[title].grantTitle = grants;
          titleList[title].foa = foa;
        }
        else {
            var found = false;
            for (var x in titleList[title].grantTitle){
                var grantTitleSaved = titleList[title].grantTitle[x]
                if ((data[i].grantTitle) === grantTitleSaved){
                    found = true
                }
            }
            if (found != true){
                titleList[title].grantTitle.push(data[i].grantTitle)
                titleList[title].foa.push(data[i].foa)
            }
        }
        foa = []
        grants = []
      }
      for (var key in titleList){
        result.push(titleList[key]);
      }
     return result;
  }


  function eliminateDuplicatesByGrant(data){
    var titleList = {};
    var result = []
    var pis = []
     for (var i in data) {
      var title = data[i].title
      //eliminate any duplicated pi
        if (!(title in titleList)){
          titleList[title] = data[i]
          pis.push(data[i].pi);
          titleList[title].pi = pis;
        }
        else {
            var found = false;
            for (var x in titleList[title].pi){
                var piSaved = titleList[title].pi[x]
                if ((data[i].pi) === piSaved){
                    found = true
                }
            }
            if (found != true){
                titleList[title].pi.push(data[i].pi)
            }
        }
        pis = []
      }
      for (var key in titleList){
        result.push(titleList[key]);
      }
     return result;
  }

module.exports = new Utils;
