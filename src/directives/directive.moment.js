var moment = require('moment')
// var nextTime
var directive = {

  acceptStatement: true,
  priority: 500,

  update: function (value) {
    // console.log('v', value)
    if (!value) value = new Date()
    this.el.innerHTML = moment(value).fromNow()
    this.nextTime = setInterval(() => {
      if (this.el) this.el.innerHTML = moment(value).fromNow()
    }, 60 * 1000)
  },
  unbind: function () {
    // console.log('unbind', this.nextTime)
    clearInterval(this.nextTime)
  }
}

exports.fromNow = directive
