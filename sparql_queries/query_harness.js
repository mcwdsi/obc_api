var indexing_terms_harness = require('./indexing_terms_harness');
var publications_harness = require('./publications_harness')
var datasets_harness = require('./datasets_harness')
var models_harness = require('./models_harness')
var reports_harness = require('./reports_harness')
var software_harness = require('./software_harness')


var harness = new function() {

    this.indexing_terms = function(terms, callback){
        indexing_terms_harness.query(terms, callback);
    }

    this.publications = function(terms, callback){
        publications_harness.query(terms, callback);
    }

    this.datasets = function(terms, callback){
        datasets_harness.query(terms, callback);
    }

    this.models = function(terms, callback){
        models_harness.query(terms, callback);
    }

    this.reports = function(terms, callback){
        reports_harness.query(terms, callback);
    }

    this.software = function(terms, callback){
        software_harness.query(terms, callback);
    }


};

module.exports = harness;