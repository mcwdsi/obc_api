var indexingTermsHarness = require('./indexing-terms-harness');
var indexingMDCHarness = require('./indexing-mdc-harness');
var publicationsHarness = require('./publications-harness');
var datasetsHarness = require('./datasets-harness');
var modelsHarness = require('./models-harness');
var reportsHarness = require('./reports-harness');
var softwareHarness = require('./software-harness');
var artifactsHarness = require('./artifacts-harness');
var grantHarness = require('./grant-harness');
var pubsPageHarness = require('./pubs-page-harness')
var openQueryHarness = require('./open_queries-harness')
var linkageHarness = require('./linkage-harness')
var mdcSearchHarness = require('./mdc-search-harness')
var mdcMeterHarness = require('./meter-harness')
var utils = require('./utils');


function Harness() {
    //MDC METER
    this.retrievalMeter = function (terms, callback) {
        mdcMeterHarness.getData(terms, callback);
    };

    //MDC Search retrieval of elements
    this.retrievalMDCElements = function (terms, callback) {
        mdcSearchHarness.retrievalMDCQuery(terms, callback);
    };

    this.MDCSearch = function (terms, callback) {
        mdcSearchHarness.MDCSearch(terms, callback);
    };
    
    //INDEXING TERMS

    this.retrievalTerms = function (terms, callback) {
        indexingTermsHarness.retrievalQuery(terms, callback);
    };

    this.indexingTerms = function (terms, callback) {
        indexingTermsHarness.indexingQuery(terms, callback);
    };

    //INDEXING MDC

    this.retrievalMDCTerms = function (terms, callback) {
        indexingMDCHarness.indexingQuery(terms, callback);
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

    // GRANT
    this.grant = function (terms, callback) {
        grantHarness.query(terms, callback);
    };

    this.updateGrant = function (data, callback) {
        grantHarness.update(data, callback);
    };

    this.grantQuery = function (terms, callback) {
        grantHarness.queryString(terms, callback);
    };

    // Linking Grants to Pubs
    this.grantLink = function (terms, callback){
        linkageHarness.update(terms, callback);
    };

    // Pubs Page
    this.pubsPage = function (terms, callback) {
        pubsPageHarness.query(terms, callback);
    };

    // this.updateGrant = function (data, callback) {
    //     grantHarness.update(data, callback);
    // };

    this.pubsPageQuery = function (terms, callback) {
        pubsPageHarness.queryString(terms, callback);
    };

    //OPEN_Query
    this.openQuery = function (terms, callback) {
        openQueryHarness.query(terms, callback);
    };

    //GENERAL

    this.artifactAbouts = function (artifact, callback) {
        artifactsHarness.abouts(artifact, callback);
    };

    this.update = function (data, callback) {
        if (data.artifactType === 'data set') {
            this.updateDataset(data, callback);
        } else if (data.artifactType === 'publication') {
            this.updatePublication(data, callback);
        } else if (data.artifactType === 'report') {
            this.updateReport(data, callback);
        } else if (data.artifactType === 'epidemic model') {
            this.updateModel(data, callback);
        } else if (data.artifactType === 'software') {
            this.updateSoftware(data, callback);
        } else if (data.artifactType === 'grant') {
            this.updateGrant(data, callback);
        } else if (data.artifactType === 'linkage') {
            console.log("linkage found")
            this.grantLink(data, callback);
        }

    };
    
    this.delete = function (data, callback) {
        artifactsHarness.delete(data, callback);
    };

    this.saveNew = function (data, callback) {
        var self = this;
         utils.getNewURI().then(function (uri) {
                var prefix = 'http://www.pitt.edu/obc/IDE_ARTICLE_';
                var completeURI = prefix + (uri)
                data.uri = completeURI;
                self.update(data, callback);
         });
    };
};

module.exports = new Harness;