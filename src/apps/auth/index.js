// window.$ = window.jQuery = require('jquery')
  // require('style/app.less')
  // require('materialize-css/dist/css/materialize.min.css')
  // require('materialize-css/dist/js/materialize.min.js')
// import Vue from 'vue'
import store from 'store/index.store'
import { routes } from './routes'
import { validator } from 'src/main.validator'
import { i18n } from 'directives/directive.i18n'

/* eslint-disable no-new */
Vue.config.debug = process.env.NODE_ENV !== 'production'
validator(Vue)
Vue.directive('ii18n', i18n)
const router = routes(Vue)
var app = Vue.extend({
  store,
  template: '<div class="container"><router-view transition="fade" transition-mode="out-in"></router-view></div>'
})
router.start(app, '#app')
