var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');
var http = require('http');

function grantHarness() {
    var agent = new http.Agent({ maxSockets: 15 });
        
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/grants_queries/all_grants.rq', function (err, allGrantQueryFile) {

            var filters = utils.buildFilters(terms);
            con.query({
                database: config.stardogDB,
                query: allGrantQueryFile.toString().replace("##ABOUT##", filters),
                agent: agent
            }, function (grant_results) {
                    callback(utils.transformGrantsToJSON(grant_results))
                });
        });

    };


    this.queryString = function (terms, callback) {
        fs.readFile(__dirname + '/grants_queries/all_grants.rq', function (err, allGrantQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allGrantQueryFile.toString().replace("##ABOUT##", filters);
            callback({ query: queryString });
        });
    };
    //TODO: create this query
    // this.update = function (grantData, callback) {
    //     var con = new stardog.Connection();
    //     con.setEndpoint(config.stardogURL);
    //     con.setCredentials(config.stardogUser, config.stardogPass);

    //     fs.readFile(__dirname + '/grants_queries/update_grant.rq', function (err, updategrantQueryFile) {

    //         var aboutsUpdate = '';
    //         for (var i in grantData.abouts) {
    //             aboutsUpdate += '<' + grantData.uri + '> obo:IAO_0000136 <' + grantData.abouts[i].uri + '> .\n        ';
    //         }

    //         var queryString = updategrantQueryFile.toString()
    //             .replace(/##grant##/g, grantData.uri)
    //             .replace(/##TITLE##/g, grantData.title !== undefined ? grantData.title : "")
    //             .replace(/##LINKOUT##/g, grantData.linkout !== undefined ? grantData.linkout : "")
    //             .replace(/##SOURCE##/g, grantData.authors !== undefined ? grantData.authors : "")
    //             .replace(/##DATE##/g, grantData.date !== undefined ? grantData.date : "")
    //             .replace(/##TYPE##/g, utils.lookupTypeURI(grantData.artifactType))
    //             .replace(/##VERSION##/g, grantData.version !== undefined ? grantData.version : "")
    //             .replace(/##DOI##/g, grantData.doi !== undefined ? grantData.doi : "")
    //             .replace(/##DATEINDEXED##/g, grantData.dateIndexed !== undefined ? grantData.dateIndexed : new Date().toISOString())
    //             .replace(/##ABOUTS##/g, aboutsUpdate);
                
    //             console.log(queryString);

    //         con.query({
    //             database: config.stardogDB,
    //             query: queryString,
    //             agent: agent
    //         },
    //             function (results) {
    //                 callback();
    //             });
    //     });
    // };

};

function eliminateDuplicates(data){
    console.log(data.bindings)
    var titleList = {};
    var result = []
     // for (var i in data) {
     //  var title = data[i].title
     //    if (!(title in titleList)){
     //      titleList[title] = data[i]
     //    }
     //    else {
     //      var authorSaved = titleList[title].pi;
     //      if ( !(authorSaved.includes(data[i].pi)) ){
     //        titleList[title].pi = titleList[title].pi + ", " + data[i].pi;
     //      }
     //    }
     //  }
     //  for (var key in titleList){
     //    result.push(titleList[key]);
     //  }
      console.log("RESU")
      console.log(result)
     return result;
  }









module.exports = new grantHarness;