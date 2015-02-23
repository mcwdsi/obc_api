var validURL = require('valid-url');

var utils = new function() {
    this.validateTerms = function(terms) {
        var validTerms = [];
        if (typeof terms !== 'undefined') {
            if (Array.isArray(terms)) {
                terms.map(function (term) {
                    if (validURL.is_uri(term)) {
                        validTerms.push(term);
                    }
                });
            } else {
                if (validURL.is_uri(terms)) {
                    validTerms.push(terms);
                }
            }
        }
        return validTerms;
    }
}

module.exports = utils;
