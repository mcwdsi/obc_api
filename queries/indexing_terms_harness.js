var fs = require('fs');
var stardog = require('stardog');

var indexing_terms_harness = new function() {
    this.query = function(callback) {
        var con = new stardog.Connection();
        con.setEndpoint('http://localhost:5820');
        con.setCredentials('admin', 'admin');

        //get first subset of indexing terms
        fs.readFile(__dirname + '/indexing_terms_queries/partOf_indexing_terms.rq', function (err, partOf_query_file) {
            con.query({
                    database: 'DEV',
                    query: partOf_query_file.toString()
                },
                function (partOf_terms) {
                    //get second subset of indexing terms
                    fs.readFile(__dirname + '/indexing_terms_queries/subClassOf_indexing_terms.rq', function (err, subClassOf_query_file) {
                        con.query({
                                database: 'DEV',
                                query: subClassOf_query_file.toString()
                            },
                            function (subClassOf_terms) {
                                callback(convertToTree([ partOf_terms, subClassOf_terms ]));
                            }
                        );
                    });
                }
            )

        })
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

            //can't be your own parent in the tree!  may be able to solve more elegantly in SPARQL
            if(parentTermURI == termURI){
                continue;
            }

            //if the root doesn't exist, add it to the top level
            if(tree[rootURI] == undefined){
                console.log('adding new root ' + rootLabel)
                tree[rootURI] = {};
                tree[rootURI].uri = rootURI;
                tree[rootURI].label = rootLabel;
                tree[rootURI].children = {};
            }

            //if no parent specified, it belongs directly under the root
            if(parentTermURI == undefined){
                //if this doesn't already exist there
                if(tree[rootURI].children[termURI] == undefined) {
                    console.log('adding term ' + termLabel + ' directly below root')
                    var term = {};
                    term.uri = termURI;
                    term.label = termLabel;
                    term.children = {};
                    tree[rootURI].children[termURI] = term;
                }
                continue;
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
                    console.log('found existing parent ' + parentLabel);
                    parent = node;
                }
                if (termURI in node.children){
                    //found term!
                    console.log('found existing term ' + termLabel);
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
                console.log('adding parent ' + parentLabel)
                parent = {};
                parent.uri = parentTermURI;
                parent.label = parentLabel;
                parent.children = {};
                tree[rootURI].children[parentTermURI] = parent;
            }


            if(term == null) {
                //didn't find term in tree, so adding as child to parent
                console.log('adding term ' + termLabel)
                term = {};
                term.uri = termURI;
                term.label = termLabel;
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

module.exports = indexing_terms_harness;
