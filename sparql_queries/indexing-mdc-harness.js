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
        currentItem[termURI].label = results[j].title.value
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
                        if (key !== "x" && key !== "title"){
                            tree[rootName][i][termURI][key].push(results[j][key].value)
                            tree[rootName][i][termURI][key] = tree[rootName][i][termURI][key].filter(function(item, i, ar){ return ar.indexOf(item) === i; })
                        }
                    }
                }
            }
            
        }
        //if we checked everything and the URI is still new then insert it as new.
        if (newURI){
            for (var key in results[j]) {
                if (key !== "x" && key !== "title"){
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
        currentItem[termURI].label = results[j].title.value
        currentItem[termURI].isRoot = false
        currentItem[termURI].children = {}
        var newURI = true;
        if(tree[rootName] == undefined){
            tree[rootName] = []
        } // if the tree is not empty then we have to take into account that the data could be there twice. 
        else {
            for (var i in tree[rootName]){
                if(tree[rootName][i][termURI] !== undefined){
                    var newURI = false;
                    for (var key in results[j]) {
                        if (key !== "x" && key !== "title"){
                            tree[rootName][i][termURI][key].push(results[j][key].value)
                            tree[rootName][i][termURI][key] = tree[rootName][i][termURI][key].filter(function(item, i, ar){ return ar.indexOf(item) === i; })
                        }
                    }
                }
            }
        }
         //if we checked everything and the URI is still new then insert it as new.
        if (newURI){
            for (var key in results[j]) {
                if (key !== "x" && key !== "title"){
                    currentItem[termURI][key] = [results[j][key].value]
                }
            }
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