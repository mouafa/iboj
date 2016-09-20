// Polyfill fn.bind() for PhantomJS
/* eslint-disable no-extend-native */
import Vue from 'vue'
// import store from 'src/store/index.store'
// import { routes } from 'src/main.routes'
// import { validator } from 'src/main.validator'
// import { i18n } from 'src/directives/directive.i18n'
// import api from 'src/main.api'
import filters from 'src/main.filters'

Vue.filter('month', filters.month)
Vue.filter('year', filters.year)
Vue.filter('not', filters.not)
Vue.filter('substring', filters.substring)
Vue.filter('email', filters.email)
Vue.filter('string', filters.string)
Vue.filter('numeric', filters.numeric)
Vue.filter('url', filters.url)

Function.prototype.bind = require('function-bind')
window.Audio = function () {
  this.play = function () {
  }
}
// require all test files (files that ends with .spec.js)
var testsContext = require.context('./specs', true, /\.spec$/)
testsContext.keys().forEach(testsContext)

// require all src files except main.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
var srcContext = require.context('../../src', true, /^\.\/(?!main(\.js)?$)/)
srcContext.keys().forEach(srcContext)
