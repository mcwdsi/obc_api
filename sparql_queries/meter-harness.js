/* global __dirname */
var fs = require('fs');
var stardog = require('stardog');
var config = require('../config');
var utils = require('./utils');
var http = require('http');

function retrievalMeter() {
    var agent = new http.Agent({ maxSockets: 15 });

    this.getData = function (terms,callback) {
        var con = new stardog.Connection();
        con.setEndpoint(config.stardogURL);
        con.setCredentials(config.stardogUser, config.stardogPass);
        if(terms.type == "dataset"){
            getDataset(con,callback)
        }
        else {
            getSoftware(con,callback)
        }
        
        
    }
    function getDataset(con, callback){
        fs.readFile(__dirname + '/mdc_meter/count-datasets-in-mdc.rq', function (err, total_dataset) {
            var queryString = total_dataset.toString()
            con.query({
                database: config.stardogMdcDB,
                query: queryString,
                agent: agent
            },
            function (total_dataset) {
                var total_ds = total_dataset.results.bindings[0].numberDatasets.value
                fs.readFile(__dirname + '/mdc_meter/count-datasets-with-any-identifier-in-mdc.rq', function (err, ds_with_any_identifier_query) {
                    var queryString = ds_with_any_identifier_query.toString()
                    con.query({
                        database: config.stardogMdcDB,
                        query: queryString,
                        agent: agent
                    },
                    function (ds_with_any_identifier_result) {
                        fs.readFile(__dirname + '/mdc_meter/count-datasets-with-common-format.rq', function (err, ds_with_common_format_query) {
                            var queryString = ds_with_common_format_query.toString()
                            con.query({
                                database: config.stardogMdcDB,
                                query: queryString,
                                agent: agent
                            },
                            function (ds_with_common_format_result) {
                                fs.readFile(__dirname + '/mdc_meter/count-datasets-with-reusable-license.rq', function (err, ds_with_reusable_lic_query) {
                                    var queryString = ds_with_reusable_lic_query.toString()
                                    con.query({
                                        database: config.stardogMdcDB,
                                        query: queryString,
                                        agent: agent
                                    },
                                    function (ds_with_reusable_lic_result) {
                                        fs.readFile(__dirname + '/mdc_meter/count-datasets-with-common-format-and-reusable-license.rq', function (err, ds_with_common_lic_query) {
                                            var queryString = ds_with_common_lic_query.toString()
                                            con.query({
                                                database: config.stardogMdcDB,
                                                query: queryString,
                                                agent: agent
                                            },
                                            function (ds_with_common_lic_result) {
                                                fs.readFile(__dirname + '/mdc_meter/count-datasets-with-doi-in-mdc.rq', function (err, ds_with_common_doi) {
                                                    var queryString = ds_with_common_doi.toString()
                                                    con.query({
                                                        database: config.stardogMdcDB,
                                                        query: queryString,
                                                        agent: agent
                                                    },
                                                    function (ds_with_common_doi_result) {
                                                        console.log("Getting Dataset")
                                                        var total_ds = total_dataset.results.bindings[0].numberDatasets.value
                                                        var ds_with_any_identifier = ds_with_any_identifier_result.results.bindings[0].numberDatasetsWithAnyIdentifier.value
                                                        var ds_with_common_format = ds_with_common_format_result.results.bindings[0].numberDatasetsWithCommonFormat.value
                                                        var ds_with_reusable_lic = ds_with_reusable_lic_result.results.bindings[0].numberDatasetsWithDoi.value
                                                        var ds_with_common_lic = ds_with_common_lic_result.results.bindings[0].numberDatasetsWithCommonFormat.value
                                                        var ds_with_doi = ds_with_common_doi_result.results.bindings[0].numberDatasetsWithDoi.value
                                                        var results = {
                                                            "ds_with_any_identifier":ds_with_any_identifier,
                                                            "total_ds":total_ds,
                                                            "ds_with_common_format":ds_with_common_format,
                                                            "ds_with_reusable_lic":ds_with_reusable_lic,
                                                            "ds_with_common_lic":ds_with_common_lic,
                                                            "ds_with_doi":ds_with_doi
                                                        }
                                                        callback (results)  
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }


        function getSoftware(con, callback){
        fs.readFile(__dirname + '/mdc_meter/count-software-in-mdc.rq', function (err, total_software) {
            var queryString = total_software.toString()
            con.query({
                database: config.stardogMdcDB,
                query: queryString,
                agent: agent
            },
            function (total_software_result) {
                fs.readFile(__dirname + '/mdc_meter/count-software-with-any-identifier-in-mdc.rq', function (err, sw_with_any_identifier_query) {
                    var queryString = sw_with_any_identifier_query.toString()
                    con.query({
                        database: config.stardogMdcDB,
                        query: queryString,
                        agent: agent
                    },
                    function (sw_with_any_identifier_result) {
                        fs.readFile(__dirname + '/mdc_meter/count-software-with-common-input-or-output-format.rq', function (err, sw_with_common_format_query) {
                            var queryString = sw_with_common_format_query.toString()
                            con.query({
                                database: config.stardogMdcDB,
                                query: queryString,
                                agent: agent
                            },
                            function (sw_with_common_format_result) {
                                fs.readFile(__dirname + '/mdc_meter/count-software-with-reusable-license.rq', function (err, sw_with_reusable_lic_query) {
                                    var queryString = sw_with_reusable_lic_query.toString()
                                    con.query({
                                        database: config.stardogMdcDB,
                                        query: queryString,
                                        agent: agent
                                    },
                                    function (sw_with_reusable_lic_result) {
                                        fs.readFile(__dirname + '/mdc_meter/count-software-with-reusable-license-and-common-format.rq', function (err, sw_with_common_lic_query) {
                                            var queryString = sw_with_common_lic_query.toString()
                                            con.query({
                                                database: config.stardogMdcDB,
                                                query: queryString,
                                                agent: agent
                                            },
                                            function (sw_with_common_lic_result) {
                                                fs.readFile(__dirname + '/mdc_meter/count-software-with-doi-in-mdc.rq', function (err, sw_with_common_doi) {
                                                    var queryString = sw_with_common_doi.toString()
                                                    con.query({
                                                        database: config.stardogMdcDB,
                                                        query: queryString,
                                                        agent: agent
                                                    },
                                                    function (sw_with_common_doi_result) {
                                                        fs.readFile(__dirname + '/mdc_meter/count-software-with-input-format.rq', function (err, sw_with_input) {
                                                            var queryString = sw_with_input.toString()
                                                            con.query({
                                                                database: config.stardogMdcDB,
                                                                query: queryString,
                                                                agent: agent
                                                            },
                                                            function (sw_with_input_result) {
                                                                fs.readFile(__dirname + '/mdc_meter/count-software-with-output-format.rq', function (err, sw_with_output) {
                                                                    var queryString = sw_with_output.toString()
                                                                    con.query({
                                                                        database: config.stardogMdcDB,
                                                                        query: queryString,
                                                                        agent: agent
                                                                    },
                                                                    function (sw_with_output_result) {
                                                                       fs.readFile(__dirname + '/mdc_meter/count-software-with-common-input-and-output-format.rq', function (err, sw_with_io) {
                                                                            var queryString = sw_with_io.toString()
                                                                            con.query({
                                                                                database: config.stardogMdcDB,
                                                                                query: queryString,
                                                                                agent: agent
                                                                            },
                                                                            function (sw_with_io_result) {
                                                                                console.log("Getting Software")
                                                                                var total_sw = total_software_result.results.bindings[0].numSoftware.value
                                                                                var sw_with_any_identifier = sw_with_any_identifier_result.results.bindings[0].numberSoftwareWithAnyId.value
                                                                                var sw_with_common_format = sw_with_common_format_result.results.bindings[0].numberSoftwareWithLicense.value
                                                                                var sw_with_reusable_lic = sw_with_reusable_lic_result.results.bindings[0].numberSoftwareWithLicense.value
                                                                                var sw_with_common_lic = sw_with_common_lic_result.results.bindings[0].numberSoftwareWithLicense.value
                                                                                var sw_with_doi = sw_with_common_doi_result.results.bindings[0].numberSoftwareWithDoi.value
                                                                                var sw_with_input = sw_with_input_result.results.bindings[0].numberSoftwareWithInputFormat.value
                                                                                var sw_with_output = sw_with_output_result.results.bindings[0].numberSoftwareWithOutputFormat.value
                                                                                var sw_with_io = sw_with_io_result.results.bindings[0].numberSoftwareWithLicense.value
                                                                                console.log(sw_with_io)
                                                                                var results = {
                                                                                    "sw_with_any_identifier":sw_with_any_identifier,
                                                                                    "total_sw":total_sw,
                                                                                    "sw_with_common_format":sw_with_common_format,
                                                                                    "sw_with_reusable_lic":sw_with_reusable_lic,
                                                                                    "sw_with_common_lic":sw_with_common_lic,
                                                                                    "sw_with_doi":sw_with_doi,
                                                                                    "sw_with_input":sw_with_input,
                                                                                    "sw_with_output":sw_with_output,
                                                                                    "sw_with_io":sw_with_io,

                                                                                }
                                                                                callback (results)  
                                                                            });
                                                                        }); 
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

}//Final

   




module.exports = new retrievalMeter;