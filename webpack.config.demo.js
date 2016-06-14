var config = require('./webpack.config');

config.externals = {};
config.output.library = 'interactiveTutorials';
config.output.libraryTarget = 'var';

module.exports = config;
