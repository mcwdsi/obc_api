var indexingTermsHarness = require('./indexing-terms-harness');
var publicationsHarness = require('./publications-harness');
var datasetsHarness = require('./datasets-harness');
var modelsHarness = require('./models-harness');
var reportsHarness = require('./reports-harness');
var softwareHarness = require('./software-harness');
var artifactsHarness = require('./artifacts-harness');


function Harness() {

    this.update = function (data, callback) {
        if (data.artifactType === 'data set') {
            this.updateDataset(data, callback);
        } else if (data.artifactType === 'publication') {
            this.updatePublication(data, callback);
        } else if (data.artifactType === 'report') {
            this.updateReport(data, callback);
        } else if (data.artifactType === 'model') {
            this.updateModel(data, callback);
        } else if (data.artifactType === 'software') {
            this.updateSoftware(data, callback);
        }
    };
    
    //INDEXING TERMS

    this.retrievalTerms = function (terms, callback) {
        indexingTermsHarness.retrievalQuery(terms, callback);
    };

    this.indexingTerms = function (terms, callback) {
        indexingTermsHarness.indexingQuery(terms, callback);
    };
    
    //PUBLICATIONS

    this.publications = function (terms, callback) {
        publicationsHarness.query(terms, callback);
    };

    this.updatePublication = function (data, callback) {
        publicationsHarness.update(data, callback);
    };

    this.publicationsQuery = function (terms, callback) {
        publicationsHarness.queryString(terms, callback);
    };

    //DATASETS

    this.datasets = function (terms, callback) {
        datasetsHarness.query(terms, callback);
    };

    this.updateDataset = function (datasetData, callback) {
        datasetsHarness.update(datasetData, callback);
    };

    this.datasetsQuery = function (terms, callback) {
        datasetsHarness.queryString(terms, callback);
    };
    
    //MODELS

    this.models = function (terms, callback) {
        modelsHarness.query(terms, callback);
    };

    this.updateModel = function (data, callback) {
        modelsHarness.update(data, callback);
    };

    this.modelsQuery = function (terms, callback) {
        modelsHarness.queryString(terms, callback);
    };
    
    //REPORTS

    this.reports = function (terms, callback) {
        reportsHarness.query(terms, callback);
    };

    this.updateReport = function (data, callback) {
        reportsHarness.update(data, callback);
    };

    this.reportsQuery = function (terms, callback) {
        reportsHarness.queryString(terms, callback);
    };

    //SOFTWARE

    this.software = function (terms, callback) {
        softwareHarness.query(terms, callback);
    };

    this.updateSoftware = function (data, callback) {
        softwareHarness.update(data, callback);
    };

    this.softwareQuery = function (terms, callback) {
        softwareHarness.queryString(terms, callback);
    };

    //GENERAL

    this.artifactAbouts = function (artifact, callback) {
        artifactsHarness.abouts(artifact, callback);
    };
};

module.exports = new Harness;