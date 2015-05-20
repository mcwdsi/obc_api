var fs = require('fs');
var stardog = require('stardog');

function IndexingTermsHarness(){
    var cachedResults = undefined;

    this.query = function(callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        if(typeof cachedResults !== 'undefined'){
            callback(cachedResults);
        } else {
            fs.readFile(__dirname + '/indexing_terms_queries/partOf_indexing_terms.rq', function (err, partOf_query_file) {
                con.query({
                        database: 'PROD',
                        query: partOf_query_file.toString()
                    },
                    function (partOf_terms) {
                        //get second subset of indexing terms
                        fs.readFile(__dirname + '/indexing_terms_queries/subClassOf_indexing_terms.rq', function (err, subClassOf_query_file) {
                            con.query({
                                    database: 'PROD',
                                    query: subClassOf_query_file.toString()
                                },
                                function (subClassOf_terms) {
                                    fs.readFile(__dirname + '/indexing_terms_queries/ecosystem_indexing_terms.rq', function (err, ecosystem_query_file) {
                                        con.query({
                                                database: 'PROD',
                                                query: ecosystem_query_file.toString()
                                            },
                                            function (ecosystem_terms) {
                                                cachedResults = convertToTree([partOf_terms, subClassOf_terms, ecosystem_terms]);
                                                callback(cachedResults);
                                            })

                                    });
                                }
                            );
                        });
                    }
                )

            })
        }
    };
};

function convertToTree(resultList){
    var tree = {};

    var termParents = {};

    for(var i in resultList){
        var results = resultList[i].results.bindings
        for(var j in results){
            var rootURI = results[j].rootClass.value;
            var rootLabel = results[j].rootLabel.value;
            var termURI = results[j].term.value;
            var termLabel = results[j].termLabel.value;
            var hieProp = results[j].hieProp.value

            //optional columns
            var parentTermURI = undefined;
            var parentLabel = undefined;

            if(results[j].parentTerm != undefined){
                parentTermURI = results[j].parentTerm.value;
                parentLabel = results[j].parentLabel.value;
            }

            //storing term parents to help find deepest parent
            if(termParents[termURI] == undefined){
                termParents[termURI] = {};
                //done using an object instead of array for pretty 'var in list' syntax
                termParents[termURI][rootURI] = true;
            }

            termParents[termURI][parentTermURI] = true;

            //if the root doesn't exist, add it to the top level
            if(tree[rootURI] == undefined){
                tree[rootURI] = {};
                tree[rootURI].uri = rootURI;
                tree[rootURI].label = rootLabel;
                tree[rootURI].hierarchy = hieProp;
                tree[rootURI].children = {};
            }

            //if no parent specified, it belongs directly under the root
            // also, can't be your own parent in the tree!  may be able to solve more elegantly in SPARQL
            if(parentTermURI == undefined || parentTermURI == termURI){
                //if this doesn't already exist under root
                if(tree[rootURI].children[termURI] == undefined) {
                    var term = {};
                    term.uri = termURI;
                    term.label = termLabel;
                    term.hierarchy = hieProp;
                    term.children = {};
                    tree[rootURI].children[termURI] = term;
                }
            }

            //*******************************************************************************************
            //doing a breadth-first search of tree for existing location of parent and term, if it exists
            //*******************************************************************************************

            //building initial processing queue out of root elements
            var processingQueue = [];
            for(var key in tree){
                processingQueue.push(tree[key]);
            }

            var parent = null;
            var term = null;

            //hunting for existing elements in tree
            while (processingQueue.length > 0) {
                var node = processingQueue.shift();
                //since breadth first, the last found should be the deepest
                if (node.uri in termParents[termURI]) {
                    //found parent!
                    parent = node;
                }
                if (termURI in node.children){
                    //found term!
                    term = node.children[termURI];

                    //removing from node, replaced at deepest parent later
                    delete node.children[termURI];

                }
                //add children to processing queue
                if (Object.keys(node.children).length > 0) {
                    for (var key in node.children) {
                        processingQueue.push(node.children[key]);
                    }

                }

            }

            if(parent == null){
                //didn't find it in tree, so adding parent to root
                parent = {};
                parent.uri = parentTermURI;
                parent.label = parentLabel;
                parent.hierarchy = hieProp;
                parent.children = {};
                tree[rootURI].children[parentTermURI] = parent;
            }


            if(term == null) {
                //didn't find term in tree, so adding as child to parent
                term = {};
                term.uri = termURI;
                term.label = termLabel;
                term.hierarchy = hieProp;
                term.children = {};
                parent.children[termURI] = term;
            } else {
                //found the term in the tree; moving to deepest relevant location
                parent.children[termURI] = term;
            }


        }

    }

    return tree;
}

module.exports = new IndexingTermsHarness;
