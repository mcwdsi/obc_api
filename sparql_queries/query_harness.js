var indexing_terms_harness = require('./indexing_terms_harness');
var publications_harness = require('./publications_harness')
var datasets_harness = require('./datasets_harness')
var models_harness = require('./models_harness')
var reports_harness = require('./reports_harness')
var software_harness = require('./software_harness')


var harness = new function() {

    this.indexing_terms = function(callback){
        indexing_terms_harness.query(callback);
    }

    this.publications = function(callback){
        publications_harness.query(callback);
    }

    this.datasets = function(callback){
        datasets_harness.query(callback);
    }

    this.models = function(callback){
        models_harness.query(callback);
    }

    this.reports = function(callback){
        reports_harness.query(callback);
    }

    this.software = function(callback){
        software_harness.query(callback);
    }


};

module.exports = harness;