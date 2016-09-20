var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
  // eval-source-map is faster for development
  devtool: '#eval-source-map',
  plugins: [
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    // htmlApp('main.html', ['main', 'vendor']),
    // htmlApp('auth.html', ['auth', 'vendor'])
    htmlApp('auth.html', ['vendor', 'auth']),
    htmlApp('welcome.html', ['vendor', 'welcome']),
    htmlApp('index.html', ['vendor', 'index']),
    htmlApp('profile.html', ['vendor', 'profile']),
    htmlApp('addjoboffer.html', ['vendor', 'addjoboffer']),
    // htmlApp('company.html', ['vendor', 'company']),
    htmlApp('dashboard.html', ['vendor', 'dashboard']),
    htmlApp('messenger.html', ['vendor', 'messenger']),
    htmlApp('404.html', ['vendor', '404'])

  ]
})

function htmlApp (filename, chunks) {
  return new HtmlWebpackPlugin({
    filename,
    chunks,
    template: 'index.ejs',
    inject: true
  })
}
