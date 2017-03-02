/* global __dirname */
var fs = require('fs');
var stardog = require('stardog');
var config = require('../config');
var utils = require('./utils');
var http = require('http');

function IndexingTermsHarness() {
    var agent = new http.Agent({ maxSockets: 15 });
        
    var indexingCachedResults = undefined;
    var retrievalCachedResults = undefined;

    this.indexingQuery = function (callback) {


        if (typeof indexingCachedResults !== 'undefined') {
            callback(indexingCachedResults);
            this._updateIndexingCache(function (data) {
                //no op, since we've already returned the cached results
                //this is just to refresh the cache
            });
        } else {
            this._updateIndexingCache(callback);
        }


    };

    this._updateIndexingCache = function (callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/indexing_terms_queries/indexing/partOf_indexing_terms.rq', function (err, partOf_query_file) {
            con.query({
                database: config.stardogDB,
                query: partOf_query_file.toString(),
                agent: agent
            },
                function (partOf_terms) {
                    //get second subset of indexing terms
                    fs.readFile(__dirname + '/indexing_terms_queries/indexing/subClassOf_indexing_terms.rq', function (err, subClassOf_query_file) {
                        con.query({
                            database: config.stardogDB,
                            query: subClassOf_query_file.toString(),
                            agent: agent
                        },
                            function (subClassOf_terms) {
                                fs.readFile(__dirname + '/indexing_terms_queries/indexing/ecosystem_indexing_terms.rq', function (err, ecosystem_query_file) {
                                    con.query({
                                        database: config.stardogDB,
                                        query: ecosystem_query_file.toString(),
                                        agent: agent
                                    },
                                        function (ecosystem_terms) {
                                            indexingCachedResults = convertToTree([partOf_terms, subClassOf_terms, ecosystem_terms]);
                                            callback(indexingCachedResults);
                                        });

                                });
                            });
                    });
                });
        });

    };

    this.retrievalQuery = function (callback) {
        
        utils.getNewURI();
        if (typeof retrievalCachedResults !== 'undefined') {
            callback(retrievalCachedResults);
            this._updateRetrievalCache(function (data) {
                //no op, since we've already returned the cached results
                //this is just to refresh the cache
            });
        } else {
            this._updateRetrievalCache(callback);
        }
    };

    this._updateRetrievalCache = function (callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL); 
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/indexing_terms_queries/retrieval/partOf_indexing_terms.rq', function (err, partOf_query_file) {
            con.query({
                database: config.stardogDB,
                query: partOf_query_file.toString(),
                agent: agent
            },
                function (partOf_terms) {
                    //get second subset of indexing terms
                    fs.readFile(__dirname + '/indexing_terms_queries/retrieval/subClassOf_indexing_terms.rq', function (err, subClassOf_query_file) {
                        con.query({
                            database: config.stardogDB,
                            query: subClassOf_query_file.toString(),
                            agent: agent
                        },
                            function (subClassOf_terms) {
                                fs.readFile(__dirname + '/indexing_terms_queries/retrieval/ecosystem_indexing_terms.rq', function (err, ecosystem_query_file) {
                                    con.query({
                                        database: config.stardogDB,
                                        query: ecosystem_query_file.toString(),
                                        agent: agent
                                    },
                                        function (ecosystem_terms) {
                                            retrievalCachedResults = convertToTree([partOf_terms, subClassOf_terms, ecosystem_terms]);
                                            callback(retrievalCachedResults);
                                        });

                                });
                            });
                    });
                });
        });
    };
};

function convertToTree(resultList) {
    var tree = {};

    var termParents = {};

    for (var i in resultList) {
        var results = resultList[i].results.bindings;
        for (var j in results) {
            var rootURI = results[j].rootClass.value;
            var rootLabel = results[j].rootLabel.value;
            var termURI = results[j].term.value;
            var parentTermURI = undefined;
            var parentLabel = undefined;

        var isRoot = false;

            if (results[j].parentTerm != undefined && results[j].parentTerm.value != termURI) {
                parentTermURI = results[j].parentTerm.value;
                parentLabel = results[j].parentLabel.value;
        isRoot = parentTermURI==rootURI;
            } else {
        parentTermURI = results[j].rootClass.value;
        parentLabel = results[j].rootLabel.value;
        isRoot = true;
        } 

            var hieProp = results[j].hieProp.value;
            
            var termLabel
            if(results[j].termLabel) {
                termLabel = results[j].termLabel.value;
            } else if(results[j].termPreferredLabel){
                termLabel = results[j].termPreferredLabel.value
            } else if(results[j].termTitle){
                termLabel = results[j].termTitle.value
            } else {
                termLabel = ""
            }
            

            //if the term doesn't exist in the tree, then we add it
            if (tree[termURI] == undefined) {
                var node = {};
        node.uri = termURI;
        node.label = termLabel; 
        node.hierarchy = hieProp;
        node.children = {};
        node.isRoot = false;
        tree[termURI] = node;
            }

            //if the term's parent doesn't exist in the tree then we add it
            if (tree[parentTermURI] == undefined) {
        var node = {};
        node.uri = parentTermURI;
        node.label = parentLabel;
        node.hierarchy = hieProp;
        node.isRoot = isRoot;
        node.children = {};
        tree[parentTermURI] = node;  
            }

            //now, if the term and its parent aren't linked in the tree, then we link term to parent
            if (tree[parentTermURI].children[termURI] == undefined) {
        tree[parentTermURI].children[termURI] = tree[termURI];
        }

        //console.log(termLabel + "," + parentLabel);
        }

    }

     for (var key in tree) {
     if (!tree[key].isRoot) {
        tree[key] = undefined;
        }
    }

    return tree;
}


module.exports = new IndexingTermsHarness;