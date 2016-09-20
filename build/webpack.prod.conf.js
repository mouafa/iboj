var path = require('path')
var config = require('../config')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var cssLoaders = require('./css-loaders')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var StatsPlugin = require('stats-webpack-plugin')
var AppCachePlugin = require('appcache-webpack-plugin')
var CompressionPlugin = require('compression-webpack-plugin')
// var VendorChunkPlugin = require('webpack-vendor-chunk-plugin')

module.exports = merge(baseWebpackConfig, {
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: path.join(config.build.assetsSubDirectory, '[name].[chunkhash].js'),
    chunkFilename: path.join(config.build.assetsSubDirectory, '[id].[chunkhash].js')
  },
  vue: {
    loaders: cssLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),

    // new ExtractTextPlugin(path.join(config.build.assetsSubDirectory, '[name].[contenthash].css'), {
    //   allChunks: true
    // }),

    // new webpack.optimize.CommonsChunkPlugin('vendor', path.join(config.build.assetsSubDirectory, 'vendor.[chunkhash].js')),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      chunks: ['auth', 'welcome', 'index', 'profile', 'addjoboffer', 'dashboard', 'messenger', '404'],
      // children: true,
      minChunks: 2
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'vendor'
    // }),

    // new VendorChunkPlugin('vendor'),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        dead_code: true,
        drop_console: true
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    // extract css into its own file
    new ExtractTextPlugin(path.join(config.build.assetsSubDirectory, '[name].[contenthash].css')),

    new StatsPlugin('stats.json', {
      chunkModules: true,
      chunkOrigins: true,
      chunks: true,
      timings: true,
      assets: true,
      children: true,
      reasons: true
    }),

    new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.js$|\.html$/,
            threshold: 10240,
            minRatio: 0.8
        }),

    new AppCachePlugin({
      settings: ['prefer-online'],
      output: 'manifest.appcache',
      exclude: ['stats.json', /.*\.mp4$/, /.*\.ogg$/, /.*\.webm$/, /.*\.ogv$/, /.*\.css$/, /.*\.js$/]
    }),

    // htmlApp('main.html', ['commons', 'main']),
    htmlApp('auth.html', ['vendor', 'commons', 'auth']),
    htmlApp('welcome.html', ['vendor', 'commons', 'welcome']),
    htmlApp('index.html', ['vendor', 'commons', 'index']),
    htmlApp('profile.html', ['vendor', 'commons', 'profile']),
    htmlApp('addjoboffer.html', ['vendor', 'commons', 'addjoboffer']),
    // htmlApp('company.html', ['vendor', 'commons', 'company']),
    htmlApp('dashboard.html', ['vendor', 'commons', 'dashboard']),
    htmlApp('messenger.html', ['vendor', 'commons', 'messenger']),
    htmlApp('404.html', ['vendor', 'commons', '404'])

  ]
})

function htmlApp (filename, chunks) {
  return new HtmlWebpackPlugin({
    filename,
    template: 'index.ejs',
    chunks: chunks,
    inject: true,
    injectVendors: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyJS: true
    }
  })
}
