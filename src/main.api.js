var connector = require('services/connect')

exports.install = function (Vue) {
  Vue.prototype.$api = connector.apiAsync.bind(null)
}
