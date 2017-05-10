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
            con.query({
                database: config.stardogDB,
                query: partOf_query_file.toString(),
                agent: agent
            },
                function (mdc_data_tree) {
                    if (mdc_data_tree != undefined){
                        formed_tree = convertToTree(mdc_data_tree);
                        callback(formed_tree);
                    }
                    });

        });
   };


function convertToTree(queryAnswer) {
    var tree = {};
    var uniqueSoftwaresubs = []
    var results = queryAnswer.results.bindings;
    for (var j in results) {
        // console.log(j)
        // console.log(results[j])
        currentItem = {}
        var rootName = results[j].softwareOrSubclassLabel.value
        var parentTermURI = results[j].softwareOrSubclass.value
        var termURI = results[j].x.value
        currentItem[termURI] = {}
        currentItem[termURI].label = results[j].prefTerm.value
        currentItem[termURI].isRoot = false
        currentItem[termURI].children = {}
        var newURI = true;

        if(tree[rootName] == undefined){
            tree[rootName] = []
        } // if the tree is not empty then we have to take into account that the data could be there twice. 
        else {
            for (var i in tree[rootName]) {
                if(tree[rootName][i][termURI] !== undefined){
                    if(results[j].developerName !== undefined){
                        newURI = false;
                        for (var dev in tree[rootName][i][termURI].developerName) {
                            tree[rootName][i][termURI].developerName.push(results[j].developerName.value)
                        }
                        tree[rootName][i][termURI].developerName = Array.from(new Set(tree[rootName][i][termURI].developerName))
                    }
                }
            }
           
        }
        // if the URI is new then we do not have to worry about dupliciates
        if (newURI){
            // if(results[j].sourceCodeRelease !== undefined){
            //     currentItem[termURI].sourceCodeRelease =  results[j].sourceCodeRelease.value
            // }
            // if(results[j].synopsis !== undefined){
            //     currentItem[termURI].synopsis = results[j].synopsis.value
            // }
            // if(results[j].developerName !== undefined){
            //     currentItem[termURI].developerName = [results[j].developerName.value]
            // }
            // if(results[j].executableName !== undefined){
            //     currentItem[termURI].execName = results[j].executableName.value
            // }
            // if(results[j].executableUrl !== undefined){
            //     currentItem[termURI].execURL = results[j].executableUrl.value
            // }
            // if(results[j].documentationDescription !== undefined){
            //      currentItem[termURI].documentationDesc = results[j].documentationDescription.value
            // }
            // if(results[j].documentationUrl !== undefined){
            //     currentItem[termURI].documentationURL = results[j].documentationUrl.value
            // }
            // if(results[j].version !== undefined){
            //     currentItem[termURI].version = results[j].version.value
            // }
            // if(results[j].sourceCodeRepositoryUrl !== undefined){
            //    currentItem[termURI].codeURl = results[j].sourceCodeRepositoryUrl.value
            // }
            // if(results[j].measureLabel !== undefined){
            //     currentItem[termURI].measureLabel = results[j].measureLabel.value
            // }  
        }

        if (j ==4 ){
            break;
        }

        if(newURI){
            tree[rootName].push(currentItem)
        }
        //this gets the unique IDs and might be used in the future.
        // if(uniqueSoftwaresubs.indexOf(rootName) < 0) {
        //     uniqueSoftwaresubs.push(rootName); 
        // }
    }
    console.log("ORIGINAL")
    console.log(tree)
    console.log("--------")
    var sofwareTree = {"label":"SOFTWARE" , "isRoot":true }
    for (item in tree){
        var children = {}
        children.children = {}
        var children = {}
        for (child in tree[item]){
            var key = Object.keys(tree[item][child])[0];
            children[key] =  tree[item][child][key]
        }
        console.log(children)
        sofwareTree["children"] = children
        console.log(sofwareTree)
        break  
    }

    result = { "software":sofwareTree }


    return(result)
    // console.log(tree)

}
}


module.exports = new IndexingMDCHarness;