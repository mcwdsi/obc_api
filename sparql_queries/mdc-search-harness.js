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
       
        fs.readFile(__dirname + '/mdc_search/get-dtm-pop-and-loc-and-associated-info.rq', function (err, allMdcSearchQueryFile) {
            console.log("Running query")
            var queryString = allMdcSearchQueryFile.toString()
                    .replace("##PATHOGEN##", terms.pathogen !== undefined ? terms.pathogen : "http://www.pitt.edu/obc/IDE_0000000007")
                    .replace("##HOST##", terms.host !== undefined ? terms.host : "http://purl.obolibrary.org/obo/APOLLO_SV_00000516")
                    .replace("##LOCATION##", terms.location !== undefined ? terms.location : "http://purl.obolibrary.org/obo/GEO_000000345")
                    console.log(queryString)
            con.query({
                database: config.stardogMdcDB,
                query: queryString,
                agent: agent
            },
                function (mdcSearch_results) {
                    eliminateSearchDuplicates(mdcSearch_results)
                    //callback(utils.transformPubsToJSON(publications_results));
                    callback({"Something": "meaningful at Query"})
                }
                );
           
        });
    }

    function eliminateSearchDuplicates(mdcSearch_results){
        var tree = {};
        var results = mdcSearch_results.results.bindings;
        for (var j in results) {
            var title = results[j].title.value;
            var uri = results[j].dtm.value
            tree[title] = uri
        }
        console.log(tree);
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
                                        var location = parseLocation(location_results);
                                        var hosts = parseHosts(hosts_results);
                                        var pathogens = parsePathogens(pathogens_results);
                                        var consolidated_tree = {"location": location, "hosts":hosts, "pathogens":pathogens }
                                        callback(consolidated_tree);
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





   };




module.exports = new retrievalMDCQuery;