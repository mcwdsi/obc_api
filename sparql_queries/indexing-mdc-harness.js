/* global __dirname */
var fs = require('fs');
var stardog = require('stardog');
var config = require('../config');
var utils = require('./utils');
var http = require('http');

function IndexingMDCHarness() {
    var agent = new http.Agent({ maxSockets: 15 });
        
    var indexingCachedResults = undefined;
    var retrievalCachedResults = undefined;

    this.indexingQuery = function (callback) {
        if (typeof indexingCachedResults !== 'undefined') {
            callback(indexingCachedResults);
            this._updateIndexingCache(function (data) {
            });
        } else {
            this._updateIndexingCache(callback);
        }
    };

    this._updateIndexingCache = function (callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/indexing_terms_queries/retrieval/mdc_software_tree_mdc.rq', function (err, partOf_query_file) {
            console.log(partOf_query_file)
            con.query({
                database: config.stardogDB,
                query: partOf_query_file.toString(),
                agent: agent
            },
                function (mdc_data_tree) {
                        formed_tree = convertToTree(mdc_data_tree);
                        callback(formed_tree);
                    });
        });
   };

    // this.retrievalQuery = function (callback) {
        
    //     utils.getNewURI();
    //     if (typeof retrievalCachedResults !== 'undefined') {
    //         callback(retrievalCachedResults);
    //         this._updateRetrievalCache(function (data) {
    //             //no op, since we've already returned the cached results
    //             //this is just to refresh the cache
    //         });
    //     } else {
    //         this._updateRetrievalCache(callback);
    //     }
    // };

//     this._updateRetrievalCache = function (callback) {
//         var con = new stardog.Connection();
//         con.setEndpoint(config.stardogURL); 
//         con.setCredentials(config.stardogUser, config.stardogPass);

//         fs.readFile(__dirname + '/indexing_terms_queries/retrieval/partOf_indexing_terms.rq', function (err, partOf_query_file) {
//             con.query({
//                 database: config.stardogDB,
//                 query: partOf_query_file.toString(),
//                 agent: agent
//             },
//                 function (partOf_terms) {
//                     //get second subset of indexing terms
//                     fs.readFile(__dirname + '/indexing_terms_queries/retrieval/subClassOf_indexing_terms.rq', function (err, subClassOf_query_file) {
//                         con.query({
//                             database: config.stardogDB,
//                             query: subClassOf_query_file.toString(),
//                             agent: agent
//                         },
//                             function (subClassOf_terms) {
//                                 fs.readFile(__dirname + '/indexing_terms_queries/retrieval/ecosystem_indexing_terms.rq', function (err, ecosystem_query_file) {
//                                     con.query({
//                                         database: config.stardogDB,
//                                         query: ecosystem_query_file.toString(),
//                                         agent: agent
//                                     },
//                                         function (ecosystem_terms) {
//                                             retrievalCachedResults = convertToTree([partOf_terms, subClassOf_terms, ecosystem_terms]);
//                                             callback(retrievalCachedResults);
//                                         });

//                                 });
//                             });
//                     });
//                 });
//         });
//     };
// };

function convertToTree(queryAnswer) {
    var tree = {};
    var uniqueSoftwaresubs = []
    var results = queryAnswer.results.bindings;
    for (var j in results) {
        currentItem = {}
        var rootName = results[j].softwareOrSubclassLabel.value
        var parentTermURI = results[j].softwareOrSubclass.value
        var termURI = results[j].x.value
        currentItem[termURI] = {}
        currentItem[termURI].prefTerm = results[j].prefTerm.value
        if(results[j].sourceCodeRelease !== undefined){
            currentItem[termURI].sourceCodeRelease =  results[j].sourceCodeRelease.value
         }
        if(results[j].synopsis !== undefined){
            currentItem[termURI].synopsis = results[j].synopsis.value
        }
        if(results[j].executableName !== undefined){
            currentItem[termURI].execName = results[j].executableName.value
        }
        if(results[j].executableUrl !== undefined){
            currentItem[termURI].execURL = results[j].executableUrl.value
        }
        if(results[j].executableUrl !== undefined){
             currentItem[termURI].execURL = results[j].executableUrl.value
        }
        if(results[j].documentationDescription !== undefined){
             currentItem[termURI].documentationDesc = results[j].documentationDescription.value
        }
        if(results[j].documentationUrl !== undefined){
            currentItem[termURI].documentationURL = results[j].documentationUrl.value
        }
        if(results[j].version !== undefined){
            currentItem[termURI].version = results[j].version.value
        }
        if(results[j].sourceCodeRepositoryUrl !== undefined){
           currentItem[termURI].codeURl = results[j].sourceCodeRepositoryUrl.value
        }
        if(results[j].measureLabel !== undefined){
            currentItem[termURI].measureLabel = results[j].measureLabel.value
        } 
        //now we need to construct the tree
        if(tree[rootName] == undefined){
            tree[rootName] = []
        }
        tree[rootName].push(currentItem)
        //this gets the unique IDs and might be used in the future.
        // if(uniqueSoftwaresubs.indexOf(rootName) < 0) {
        //     uniqueSoftwaresubs.push(rootName); 
        // }
    }
    return(tree)
    // console.log(tree)

}
}


module.exports = new IndexingMDCHarness;