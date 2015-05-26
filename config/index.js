var express = require('express');
// loads config file based on NODE_ENV environment variable
// defaults to 'development'
module.exports = require('./' + (express().get('env') || 'development') + '.json'); 