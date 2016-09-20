'use strict'

var vue = require('vue')

var directive = {

  acceptStatement: true,
  priority: 700,

  update: function (handler) {
    if (typeof handler !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        vue.util.warn(
          this.name + '="' +
          this.expression + '" expects a function value, ' +
          'got ' + handler
        )
      }
      return
    }

    this.reset()

    var self = this
    var scope = this._scope || this.vm

    this.handler = function (ev) {
      if (!self.el.contains(ev.target)) {
        scope.$event = ev
        var res = handler(ev)
        scope.$event = null
        return res
      }
    }

    vue.util.on(document.documentElement, 'click', this.handler)
  },
  reset: function () {
    vue.util.off(document.documentElement, 'click', this.handler)
  },
  unbind: function () {
    this.reset()
  }
}

exports.clickOut = directive
