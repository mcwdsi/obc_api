var indexingTermsHarness = require('./indexing-terms-harness');
var publicationsHarness = require('./publications-harness');
var datasetsHarness = require('./datasets-harness');
var modelsHarness = require('./models-harness');
var reportsHarness = require('./reports-harness');
var softwareHarness = require('./software-harness');
var artifactsHarness = require('./artifacts-harness');


function Harness() {

    this.retrievalTerms = function(terms, callback){
        indexingTermsHarness.retrievalQuery(terms, callback);
    };
    
    this.indexingTerms = function(terms, callback){
        indexingTermsHarness.indexingQuery(terms, callback);
    };

    this.publications = function(terms, callback){
        publicationsHarness.query(terms, callback);
    };

    this.datasets = function(terms, callback){
        datasetsHarness.query(terms, callback);
    };

    this.models = function(terms, callback){
        modelsHarness.query(terms, callback);
    };

    this.reports = function(terms, callback){
        reportsHarness.query(terms, callback);
    };

    this.software = function(terms, callback){
        softwareHarness.query(terms, callback);
    };
    
    this.artifactAbouts = function(artifact, callback){
        artifactsHarness.abouts(artifact, callback);
    };
    
    this.publicationsQuery = function(terms, callback){
        publicationsHarness.queryString(terms, callback);
    };

    this.datasetsQuery = function(terms, callback){
        datasetsHarness.queryString(terms, callback);
    };

    this.modelsQuery = function(terms, callback){
        modelsHarness.queryString(terms, callback);
    };

    this.reportsQuery = function(terms, callback){
        reportsHarness.queryString(terms, callback);
    };

    this.softwareQuery = function(terms, callback){
        softwareHarness.queryString(terms, callback);
    };


};

module.exports = new Harness;