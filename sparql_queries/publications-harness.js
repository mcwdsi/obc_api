var fs = require('fs');
var stardog = require('stardog');
var utils = require('./utils');
var config = require('../config');
var http = require('http');

function PublicationsHarness() {
    
    var agent = new http.Agent({ maxSockets: 15 });    
    
    this.query = function (terms, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        
        fs.readFile(__dirname + '/publications_queries/all_publications.rq', function (err, allPublicationsQueryFile) {

            var filters = utils.buildFilters(terms);

            con.query({
                database: config.stardogDB,
                query: allPublicationsQueryFile.toString().replace("##ABOUT##", filters),
                agent: agent
            },
                function (publications_results) {
                    callback(utils.transformPubsToJSON(publications_results));
                }
                );
        });

    };

    this.queryString = function (terms, callback) {
        console.log(terms)
        fs.readFile(__dirname + '/publications_queries/all_publications.rq', function (err, allPublicationsQueryFile) {
            var filters = utils.buildFilters(terms);
            var queryString = allPublicationsQueryFile.toString().replace("##ABOUT##", filters);

            callback({ query: queryString });
        });
    };

    this.update = function (publicationData, callback) {
        console.log("Publication data is")
        console.log(publicationData)
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/publications_queries/update_publication.rq', function (err, updatePublicationsQueryFile) {

            var aboutsUpdate = '';
            for (var i in publicationData.abouts) {
                aboutsUpdate += '<' + publicationData.uri + '> obo:IAO_0000136 <' + publicationData.abouts[i].uri + '> .\n        ';
            }

            var queryString = updatePublicationsQueryFile.toString()
                .replace(/##PUBLICATION##/g, publicationData.uri)
                .replace(/##TITLE##/g, publicationData.title !== undefined ? publicationData.title : "")
                .replace(/##LINKOUT##/g, publicationData.linkout !== undefined ? publicationData.linkout : "")
                .replace(/##AUTHORS##/g, publicationData.authors !== undefined ? publicationData.authors : "")
                .replace(/##DATE##/g, publicationData.date !== undefined ? publicationData.date : "")
                .replace(/##TYPE##/g, utils.lookupTypeURI(publicationData.artifactType))
                .replace(/##PMID##/g, publicationData.pmid !== undefined ? publicationData.pmid : "")
                .replace(/##JOURNAL##/g, publicationData.journal !== undefined ? publicationData.journal : "")
                .replace(/##DOI##/g, publicationData.doi !== undefined ? publicationData.doi : "")    
                .replace(/##DATEINDEXED##/g, publicationData.dateIndexed !== undefined ? publicationData.dateIndexed : new Date().toISOString())            
                .replace(/##ABOUTS##/g, aboutsUpdate);

            con.query({
                database: config.stardogDB,
                query: queryString,
                agent: agent
            },
                function (results) {
                    callback();
                });
        });
    };

    /* this.insert = function (publicationData, callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);

        fs.readFile(__dirname + '/publications_queries/insert_publication.rq', function (err, insertPublicationsQueryFile) {

            var aboutsInsert = '';
            for (var i in publicationData.abouts) {
                aboutsInsert += '<' + publicationData.uri + '> obo:IAO_0000136 <' + publicationData.abouts[i].uri + '> .\n        ';
            }

            var queryString = insertPublicationsQueryFile.toString()
                .replace(/##PUBLICATION##/g, publicationData.uri)
                .replace(/##TITLE##/g, publicationData.title !== undefined ? publicationData.title : "")
                .replace(/##LINKOUT##/g, publicationData.linkout !== undefined ? publicationData.linkout : "")
                .replace(/##AUTHORS##/g, publicationData.authors !== undefined ? publicationData.authors : "")
                .replace(/##DATE##/g, publicationData.date !== undefined ? publicationData.date : "")
                .replace(/##TYPE##/g, utils.lookupTypeURI(publicationData.artifactType))
                .replace(/##PMID##/g, publicationData.pmid !== undefined ? publicationData.pmid : "")
                .replace(/##JOURNAL##/g, publicationData.journal !== undefined ? publicationData.journal : "")
                .replace(/##DOI##/g, publicationData.doi !== undefined ? publicationData.doi : "")    
                .replace(/##DATEINDEXED##/g, publicationData.dateIndexed !== undefined ? publicationData.dateIndexed : new Date().toISOString())            
                .replace(/##ABOUTS##/g, aboutsUpdate)

            con.query({
                database: config.stardogDB,
                query: queryString,
                agent: agent
            },
                function (results) {
                    callback();
                });
        });
    }; */

};



module.exports = new PublicationsHarness;