var indexing_terms_harness = require('./indexing_terms_harness');

var harness = new function() {

    this.indexing_terms = function(callback){
        indexing_terms_harness.query(callback)
    }
};

module.exports = harness;