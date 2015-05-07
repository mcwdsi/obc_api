// loads config file based on NODE_ENV environment variable
// defaults to 'development'
module.exports = require('./' + (app.get('env') || 'development') + '.json'); 