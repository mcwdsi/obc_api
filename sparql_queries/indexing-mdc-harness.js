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
        fs.readFile(__dirname + '/indexing_terms_queries/retrieval/mdc_software_tree.rq', function (err, software_query_file) {
            con.query({
                database: config.stardogMdcDB,
                query: software_query_file.toString(),
                agent: agent
            },
                function (software_results) {
                    fs.readFile(__dirname + '/indexing_terms_queries/retrieval/mdc_datasets_tree.rq', function (err, datasets_query_file) {
                    con.query({
                        database: config.stardogMdcDB,
                        query: datasets_query_file.toString(),
                        agent: agent
                    },
                        function (datasets_results) {
                            if(software_results.results === undefined){
                                var consolidated_tree = {}
                            }
                            else {
                                software_tree = convertSoftwareTree(software_results);
                                datasets_tree = convertDataSetsTree(datasets_results);
                                var consolidated_tree = {"software": software_tree, "dataset": datasets_tree}
                                //var consolidated_tree = {"software": software_tree}
                            }
                            callback(consolidated_tree);
                        });

                });
            });

        });
   };
function convertDataSetsTree(queryAnswer) {
    var tree = {}
    var uniqueSoftwaresubs = []
    var results = queryAnswer.results.bindings;
    for (var j in results){
        var termURI = results[j].x.value
        var rootName = results[j].datasetOrSubclassLabel.value
        var newURI = true;
        currentItem = {}
        currentItem[termURI] = {}
        currentItem[termURI].isRoot = false
        currentItem[termURI].children = {}
        currentItem[termURI].label = results[j].datasetPrefTerm.value
        //First we need to create the parent if it does not exist.
        if(tree[rootName] == undefined){
           tree[rootName] = []
        }
        else {//if the parent is already created then we check inside it if the item is already
              // in and we just need to add more information
            for (var i in tree[rootName]){
                if(tree[rootName][i][termURI] !== undefined){
                    var newURI = false;
                    for (var key in results[j]) {
                        if (key !== "x" && key !== "prefTerm"){
                            tree[rootName][i][termURI][key].push(results[j][key].value)
                            tree[rootName][i][termURI][key] = Array.from(new Set(tree[rootName][i][termURI][key]))
                        }
                    }
                }
            }
            
        }
        //if we checked everything and the URI is still new then insert it as new.
        if (newURI){
            for (var key in results[j]) {
                if (key !== "x" && key !== "prefTerm"){
                    currentItem[termURI][key] = [results[j][key].value]
                }
            }
            tree[rootName].push(currentItem)
        }
    }
    var datasetTree = {"label":"DATASETS" , "isRoot":true }
    var parents = {}
    for (item in tree){
        var parent = {"label":item , "isRoot":true}
        var children = {}
        for (child in tree[item]){
            var key = Object.keys(tree[item][child])[0];
            children[key] =  tree[item][child][key]
        }
        parent.children = children
        parents[item] = parent
    }
    datasetTree["children"] = parents
    result = { "dataset":datasetTree }
    return datasetTree;
}


function convertSoftwareTree(queryAnswer) {
    var tree = {};
    var uniqueSoftwaresubs = []
    var results = queryAnswer.results.bindings;
    for (var j in results) {
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
                    //This field can be repeated so we need extra logic to make into one. 
                    if(results[j].developerName !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].developerName.push(results[j].developerName.value)
                        tree[rootName][i][termURI].developerName = Array.from(new Set(tree[rootName][i][termURI].developerName))
                    }
                    if(results[j].sourceCodeRelease !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].sourceCodeRelease.push(results[j].sourceCodeRelease.value)
                        tree[rootName][i][termURI].sourceCodeRelease = Array.from(new Set(tree[rootName][i][termURI].sourceCodeRelease))
                    }
                    if(results[j].executableName !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].executableName.push(results[j].executableName.value)
                        tree[rootName][i][termURI].executableName = Array.from(new Set(tree[rootName][i][termURI].executableName))
                    }
                    if(results[j].executableUrl !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].executableUrl.push(results[j].executableUrl.value)
                        tree[rootName][i][termURI].executableUrl = Array.from(new Set(tree[rootName][i][termURI].executableUrl))
                    }
                    if(results[j].version !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].version.push(results[j].version.value)
                        tree[rootName][i][termURI].version = Array.from(new Set(tree[rootName][i][termURI].version))
                    }
                    if(results[j].sourceCodeRepositoryUrl !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].sourceCodeRepositoryUrl.push(results[j].sourceCodeRepositoryUrl.value)
                        tree[rootName][i][termURI].sourceCodeRepositoryUrl = Array.from(new Set(tree[rootName][i][termURI].sourceCodeRepositoryUrl))
                    }
                    if(results[j].measureLabel !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].measureLabel.push(results[j].measureLabel.value)
                        tree[rootName][i][termURI].measureLabel = Array.from(new Set(tree[rootName][i][termURI].measureLabel))
                    }
                    if(results[j].doi !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].doi.push(results[j].doi.value)
                        tree[rootName][i][termURI].doi = Array.from(new Set(tree[rootName][i][termURI].doi))
                    }
                    if(results[j].doiURL !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].doiURL.push(results[j].doiURL.value)
                        tree[rootName][i][termURI].doiURL = Array.from(new Set(tree[rootName][i][termURI].doiURL))
                    }
                    if(results[j].webAppUrl !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].webAppUrl.push(results[j].webAppUrl.value)
                        tree[rootName][i][termURI].webAppUrl = Array.from(new Set(tree[rootName][i][termURI].webAppUrl))
                    }
                    if(results[j].licenseName !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].licenseName.push(results[j].licenseName.value)
                        tree[rootName][i][termURI].licenseName = Array.from(new Set(tree[rootName][i][termURI].licenseName))
                    }
                    if(results[j].licenseUrl !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].licenseUrl.push(results[j].licenseUrl.value)
                        tree[rootName][i][termURI].licenseUrl = Array.from(new Set(tree[rootName][i][termURI].licenseUrl))
                    }
                    if(results[j].websiteUrl !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].websiteUrl.push(results[j].websiteUrl.value)
                        tree[rootName][i][termURI].websiteUrl = Array.from(new Set(tree[rootName][i][termURI].websiteUrl))
                    }
                    if(results[j].pubAbout !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].pubAbout.push(results[j].pubAbout.value)
                        tree[rootName][i][termURI].pubAbout = Array.from(new Set(tree[rootName][i][termURI].pubAbout))
                    }
                    if(results[j].pubThatUsedRelease !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].pubThatUsedRelease.push(results[j].pubThatUsedRelease.value)
                        tree[rootName][i][termURI].pubThatUsedRelease = Array.from(new Set(tree[rootName][i][termURI].pubThatUsedRelease))
                    }
                    if(results[j].inputSpecLabel !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].inputSpecLabel.push(results[j].inputSpecLabel.value)
                        tree[rootName][i][termURI].inputSpecLabel = Array.from(new Set(tree[rootName][i][termURI].inputSpecLabel))
                    }
                    if(results[j].outputSpecLabel !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].outputSpecLabel.push(results[j].outputSpecLabel.value)
                        tree[rootName][i][termURI].outputSpecLabel = Array.from(new Set(tree[rootName][i][termURI].outputSpecLabel))
                    }
                    if(results[j].olympus !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].olympus.push(results[j].olympus.value)
                        tree[rootName][i][termURI].olympus = Array.from(new Set(tree[rootName][i][termURI].olympus))
                    }
                    if(results[j].uids !== undefined){
                        newURI = false;
                        tree[rootName][i][termURI].uids.push(results[j].uids.value)
                        tree[rootName][i][termURI].uids = Array.from(new Set(tree[rootName][i][termURI].uids))
                    }
                    

                }
            }
           
        }
        if (newURI){
            if(results[j].developerName !== undefined){
                currentItem[termURI].developerName = [results[j].developerName.value]
            }
            if(results[j].sourceCodeRelease !== undefined){
                currentItem[termURI].sourceCodeRelease =  [results[j].sourceCodeRelease.value]
            }
            if(results[j].synopsis !== undefined){
                currentItem[termURI].synopsis = [results[j].synopsis.value]
            }
            if(results[j].executableName !== undefined){
                currentItem[termURI].executableName = [results[j].executableName.value]
            }
            if(results[j].executableUrl !== undefined){
                currentItem[termURI].executableUrl = [results[j].executableUrl.value]
            }
            if(results[j].documentationDescription !== undefined){
                 currentItem[termURI].documentationDescription = results[j].documentationDescription.value
            }
            if(results[j].documentationUrl !== undefined){
                currentItem[termURI].documentationUrl = results[j].documentationUrl.value
            }
            if(results[j].version !== undefined){
                currentItem[termURI].version = [results[j].version.value]
            }
            if(results[j].sourceCodeRepositoryUrl !== undefined){
               currentItem[termURI].sourceCodeRepositoryUrl = [results[j].sourceCodeRepositoryUrl.value]
            }
            if(results[j].measureLabel !== undefined){
                currentItem[termURI].measureLabel = [results[j].measureLabel.value]
            }  
            if(results[j].doi !== undefined){
                currentItem[termURI].doi = [results[j].doi.value]
            }
            if(results[j].doiURL !== undefined){
                currentItem[termURI].doiURL = [results[j].doiURL.value]
            }
            if(results[j].webAppUrl !== undefined){
                currentItem[termURI].webAppUrl = [results[j].webAppUrl.value]
            }
            if(results[j].licenseName !== undefined){
                currentItem[termURI].licenseName = [results[j].licenseName.value]
            }
            if(results[j].licenseUrl !== undefined){
                currentItem[termURI].licenseUrl = [results[j].licenseUrl.value]
            }
            if(results[j].websiteUrl !== undefined){
                currentItem[termURI].websiteUrl = [results[j].websiteUrl.value]
            }
            if(results[j].pubAbout !== undefined){
                currentItem[termURI].pubAbout = [results[j].pubAbout.value]
            }
            if(results[j].pubThatUsedRelease !== undefined){
                currentItem[termURI].pubThatUsedRelease = [results[j].pubThatUsedRelease.value]
            }
            if(results[j].inputSpecLabel !== undefined){
                currentItem[termURI].inputSpecLabel = [results[j].inputSpecLabel.value]
            }
            if(results[j].outputSpecLabel !== undefined){
                currentItem[termURI].outputSpecLabel = [results[j].outputSpecLabel.value]
            }
            if(results[j].olympus !== undefined){
                currentItem[termURI].olympus = [results[j].olympus.value]
            }
            if(results[j].uids !== undefined){
                currentItem[termURI].uids = [results[j].uids.value]
            }
        }
        if(newURI){
            tree[rootName].push(currentItem)
        }
    }
    var sofwareTree = {"label":"SOFTWARE" , "isRoot":true }
    var parents = {}
    for (item in tree){
        var parent = {"label":item , "isRoot":true}
        var children = {}
        for (child in tree[item]){
            var key = Object.keys(tree[item][child])[0];
            children[key] =  tree[item][child][key]
        }
        parent.children = children
        parents[item] = parent
    }
    sofwareTree["children"] = parents
    result = { "software":sofwareTree }
    return(sofwareTree)
}
}


module.exports = new IndexingMDCHarness;