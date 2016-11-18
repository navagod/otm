var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: __dirname,
  entry: [
    './src/index'
  ],
  module: {
    loaders: [
      { test: /\.(js|jsx)$/, loader: 'babel', exclude: /node_modules/ ,
        query:
      {
        presets:['react']
      }
    },
      { test: /\.s?css$/, loader: 'style!css!sass' },
    ]
  },
  resolve: {
    extensions: ['', '.js','.jsx']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './dist',
    hot: true,
    inline: true,
    port: 8080,
    historyApiFallback: true
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};
