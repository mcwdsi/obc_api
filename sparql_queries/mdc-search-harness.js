/* global __dirname */
var fs = require('fs');
var stardog = require('stardog');
var config = require('../config');
var utils = require('./utils');
var http = require('http');

function retrievalMDCQuery() {
    var agent = new http.Agent({ maxSockets: 15 });

    this.MDCSearch = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        if(terms.type === "dtm"){
             getDTM(terms,con,callback);
        }
        else if (terms.type === "dataset"){
            getDatasets(terms,con,callback)
        }
        
    }
    function getDTM(terms,con, callback){
        fs.readFile(__dirname + '/mdc_search/get-dtm-pop-and-loc-and-associated-info.rq', function (err, allMdcSearchQueryFile) {
            var queryString = allMdcSearchQueryFile.toString()
                    .replace("##PATHOGEN##", terms.pathogen !== undefined ? terms.pathogen : "http://www.pitt.edu/obc/IDE_0000000007")
                    .replace("##HOST##", terms.host !== undefined ? terms.host : "http://purl.obolibrary.org/obo/APOLLO_SV_00000516")
                    .replace("##LOCATION##", terms.location !== undefined ? terms.location : "http://purl.obolibrary.org/obo/GEO_000000345")
                    .replace("##CONTROL_MEASURE_IRI##",terms.measure !== undefined ? terms.measure : "http://purl.obolibrary.org/obo/APOLLO_SV_00000086")
                    .replace("##TOGGLE##",terms.measure === undefined ? "" : "##TOGGLE##")
                    .replace("##TOGGLE##",terms.measure === undefined ? "" : "##TOGGLE##")
            con.query({
                database: config.stardogMdcDB,
                query: queryString,
                agent: agent
            },
                function (mdcSearch_results) {
                    // console.log(queryString)
                    var results = eliminateSearchDuplicates(mdcSearch_results)
                    callback (results) 
                }
                );
        });
    }

    function getDatasets(terms,con, callback){
        console.log("Running Datasets")
        fs.readFile(__dirname + '/mdc_search/dataset_query_by_host_path_location.rq', function (err, datasetQueryFile) {
            var datasetString = datasetQueryFile.toString()
                     .replace("##PATHOGEN##", terms.pathogen !== undefined ? terms.pathogen : "http://purl.obolibrary.org/obo/PCO_0000001")
                     .replace("##HOST##", terms.host !== undefined ? terms.host : "http://purl.obolibrary.org/obo/PCO_0000001")
                     .replace("##LOCATION##", terms.location !== undefined ? terms.location : "http://purl.obolibrary.org/obo/GEO_000000345")
            con.query({
                database: config.stardogMdcDB,
                query: datasetString,
                agent: agent
            },function (mdcSearch_results) {
                    var results = eliminateSearchDatasetsDuplicates(mdcSearch_results)
                    callback (results) 
                });

        });
    }

    function eliminateSearchDuplicates(mdcSearch_results){
        var tree = {};
        var results = mdcSearch_results.results.bindings;
        for (var j in results) {
            var prefTerm = results[j].prefTerm.value;
            var currentItem = {}
            newURI = true;
            if(tree[prefTerm] == undefined){
                tree[prefTerm] = []
            }
            else {
                var newURI = false;
                for (var key in results[j]) {
                    tree[prefTerm][0][key].push(results[j][key].value)
                    tree[prefTerm][0][key] = tree[prefTerm][0][key].filter(function(item, i, ar){ return ar.indexOf(item) === i; })
                }
            }
            if (newURI){
                for (var key in results[j]) {
                        currentItem[key] = [results[j][key].value]
                }
            tree[prefTerm].push(currentItem)
            }
    }
        return tree;
    }

    function eliminateSearchDatasetsDuplicates(dataset_results){
        var tree = {};
        var results = dataset_results.results.bindings;
        for (var j in results) {
            var prefTerm = results[j].prefTerm.value;
            var currentItem = {}
            newURI = true;
            if(tree[prefTerm] == undefined){
                tree[prefTerm] = []
            }
            else {
                var newURI = false;
                for (var key in results[j]) {
                    tree[prefTerm][0][key].push(results[j][key].value)
                    tree[prefTerm][0][key] = tree[prefTerm][0][key].filter(function(item, i, ar){ return ar.indexOf(item) === i; })
                }
            }
            if (newURI){
                for (var key in results[j]) {
                        currentItem[key] = [results[j][key].value]
                }
            tree[prefTerm].push(currentItem)
            }
    }
        return tree;
    }

    this.retrievalMDCQuery = function (callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        fs.readFile(__dirname + '/indexing_terms_queries/retrieval/get-unique-locations-simulated.rq', 
            function (err, locations_query_file) {
            con.query({
                database: config.stardogMdcDB,
                query: locations_query_file.toString(),
                agent: agent
            },
                function (location_results) {
                    fs.readFile(__dirname + '/indexing_terms_queries/retrieval/get-unique-hosts-simulated.rq',
                    function (err, hosts_query_file) {
                        con.query({
                            database: config.stardogMdcDB,
                            query: hosts_query_file.toString(),
                            agent: agent
                        },
                        function (hosts_results) {
                                fs.readFile(__dirname + '/indexing_terms_queries/retrieval/get-unique-pathogens-simulated.rq',
                                function (err, pathogens_query_file) {
                                    con.query({
                                        database: config.stardogMdcDB,
                                        query: pathogens_query_file.toString(),
                                        agent: agent
                                    },
                                    function (pathogens_results) {
                                       fs.readFile(__dirname + '/indexing_terms_queries/retrieval/get-unique-control-measures-simulated.rq',
                                        function (err, measures_query_file) {
                                        con.query({
                                            database: config.stardogMdcDB,
                                            query: measures_query_file.toString(),
                                            agent: agent
                                        },
                                        function (measures_results) {
                                            var location = parseLocation(location_results);
                                            var hosts = parseHosts(hosts_results);
                                            var pathogens = parsePathogens(pathogens_results);
                                            var measures = parseMeasures(measures_results);
                                            var consolidated_tree = {"location": location, "hosts":hosts, "pathogens":pathogens, "measures":measures }
                                            callback(consolidated_tree);
                                        });
                                     });
                                    });
                                });
                            });
                            
                        });
                    });

                });
            }

    function parseLocation(queryResults){
        var tree = {};
        var results = queryResults.results.bindings;
        for (var j in results) {
            var label = results[j].geoLocationLabel.value
            var uri = results[j].geoLocation.value
            tree[label] = uri
        }
        return tree;
    }
    function parseHosts(queryResults){
        var tree = {};
        var results = queryResults.results.bindings;
        for (var j in results) {
            var label = results[j].pathogenTypeLabel.value
            var uri = results[j].pathogenType.value
            tree[label] = uri
        }
        return tree;
    } 
    function parsePathogens(queryResults){
        var tree = {};
        var results = queryResults.results.bindings;
        for (var j in results) {
            var label = results[j].pathogenTypeLabel.value
            var uri = results[j].pathogenType.value
            tree[label] = uri
        }
        return tree;
    }  
    function parseMeasures(queryResults){
        var tree = {};
        var results = queryResults.results.bindings;
        for (var j in results) {
            var label = results[j].measureLabel.value
            var uri = results[j].measureType.value
            tree[label] = uri
        }
        return tree;
    }  
   };




module.exports = new retrievalMDCQuery;