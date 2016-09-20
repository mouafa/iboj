var path = require('path')
var config = require('../config')
var cssLoaders = require('./css-loaders')
var projectRoot = path.resolve(__dirname, '../')
var webpack = require('webpack')
// var ExtractTextPlugin = require('extract-text-webpack-plugin')
// var extractCSS = new ExtractTextPlugin('[name].css')

module.exports = {
  entry: {
    vendor: ['materialize-css/css/materialize.css', 'materialize-css/js/materialize.min.js','style/app.less'],
    // vendor: ['style/app.less'],
    // main: './src/main.js',
    auth: 'apps/auth',
    welcome: 'apps/welcome',
    index: 'apps/index',
    profile: 'apps/profile',
    addjoboffer: 'apps/addjoboffer',
    // company: 'apps/company',
    dashboard: 'apps/dashboard',
    messenger: 'apps/messenger',
    '404': 'apps/404'
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: config.build.assetsPublicPath,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js', '.vue'],
    fallback: [path.join(__dirname, '../vendors'), path.join(__dirname, '../node_modules')],
    alias: {
      'src': path.resolve(__dirname, '../src'),
      'assets': path.resolve(__dirname, '../src/assets'),
      'components': path.resolve(__dirname, '../src/components'),
      'shared': path.resolve(__dirname, '../src/components/shared'),
      'services': path.resolve(__dirname, '../src/services'),
      'directives': path.resolve(__dirname, '../src/directives'),
      'store': path.resolve(__dirname, '../src/store'),
      'models': path.resolve(__dirname, '../src/models'),
      'style': path.resolve(__dirname, '../src/style'),
      'auth': path.resolve(__dirname, '../src/components/auth'),
      'welcome': path.resolve(__dirname, '../src/components/welcome'),
      'profile': path.resolve(__dirname, '../src/components/profile'),
      'import': path.resolve(__dirname, '../src/components/import'),
      'contact': path.resolve(__dirname, '../src/components/contact'),
      'dashboard': path.resolve(__dirname, '../src/components/dashboard'),
      'add-joboffer': path.resolve(__dirname, '../src/components/add-joboffer'),
      'home': path.resolve(__dirname, '../src/components/home'),
      'joboffer': path.resolve(__dirname, '../src/components/joboffer'),
      'company': path.resolve(__dirname, '../src/components/company'),
      'messenger': path.resolve(__dirname, '../src/components/messenger'),
      'statistics': path.resolve(__dirname, '../src/components/statistics'),
      'search': path.resolve(__dirname, '../src/components/home'),
      'apps': path.resolve(__dirname, '../src/apps')
    }
  },
  resolveLoader: {
    fallback: [path.join(__dirname, '../node_modules')]
  },
  loader: {
    configEnvironment: process.env.NODE_ENV || 'development'
  },
  module: {
    preLoaders: [
      {
        test: /\.vue$/,
        loader: 'eslint',
        include: projectRoot,
        exclude: /(node_modules|vendors)/
      },
      {
        test: /\.js$/,
        loader: 'eslint',
        include: projectRoot,
        exclude: /(node_modules|vendors)/
      }
    ],
    loaders: [
      {
        test: /\.less$/,
        loader: 'style!css!less'
        // loader: extractCSS.extract(['style', 'css', 'less'])
      },
      {
        test: /\.css$/,
        loader: 'style!css'
        // loader: extractCSS.extract(['style', 'css'])
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: projectRoot,
        exclude: /(node_modules|vendors)/
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.html$/,
        loader: 'vue-html'
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: path.join(config.build.assetsSubDirectory, '[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
   new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
   new webpack.ProvidePlugin({
     'Vue': 'vue'
    //  '$': 'jquery',
    //  'jQuery': 'jquery',
    //  'jquery': 'jquery',
    //  'window.$': 'jquery',
    //  'window.jquery': 'jquery'
    })
   // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
  vue: {
    loaders: cssLoaders()
  },
  eslint: {
    formatter: require('eslint-friendly-formatter')
  }
}
