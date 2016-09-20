var toastr = require('toastr')
require('toastr/toastr.less')

toastr.options = {
  'closeButton': true,
  'debug': false,
  'newestOnTop': true,
  'progressBar': false,
  'positionClass': 'toast-top-right',
  'preventDuplicates': true,
  'onclick': null,
  'showDuration': '3000',
  'hideDuration': '3000',
  'timeOut': '3000',
  'extendedTimeOut': '1000',
  'showEasing': 'swing',
  'hideEasing': 'linear',
  'showMethod': 'fadeIn',
  'hideMethod': 'fadeOut'
}

function notifier (triger, _body_, _title_) {
  _title_ = _title_ || triger.name
  _body_ = _body_ || ''
  triger(_body_, null)
}

const success = notifier.bind(null, toastr.success)
const info = notifier.bind(null, toastr.info)
const error = notifier.bind(null, toastr.error)
const warn = notifier.bind(null, toastr.warning)
const clear = toastr.clear
const remove = toastr.remove
const fail = (err) => { if (err.responseJSON && err.responseJSON.msg) toastr.error(err.responseJSON.msg) }

export default {
  success,
  info,
  error,
  warn,
  clear,
  remove,
  fail
}
