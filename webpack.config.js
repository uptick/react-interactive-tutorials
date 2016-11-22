var path = require('path');
var NodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/init.jsx',
  output: {
    path: __dirname + '/dist',
    filename: 'react-interactive-tutorials.js',
    library: 'interactive-tutorials',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            'react',
            'es2015',
            'stage-0',
          ],
        },
      },
    ],
  },
  externals: NodeExternals(),
};
