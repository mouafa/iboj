var path = require('path')

module.exports = {
  build: {
    index: path.resolve(__dirname, 'dist/index.html'),
    assetsRoot: path.resolve(__dirname, 'dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: false,
    tungolia: 'http://tungolia.jobi.tn/'
  },
  dev: {
    port: 8081,
    proxyTable: {}
  }
}
