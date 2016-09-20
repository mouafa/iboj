var Cookies = require('./cookie')
// var $ = require('jquery')
var $ = window.jQuery
var bus = require('services/bus')
var callStack = []
window.callStack = callStack
var appConfig = require('webpack-config-loader!src/main.config.js')

window.onunhandledrejection = function onunhandledrejection ({reason}) {
  if (process.env.NODE_ENV !== 'production') console.warn('unhandled promise rejection', reason)
}

import notify from 'services/notifs-center'

$.ajaxTransport('+binary', function (options, originalOptions, jqXHR) {
  if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob))))) {
    return {
      send: function (_, callback) {
        var xhr = new XMLHttpRequest()
        var url = options.url
        var type = options.type
        var dataType = options.responseType || 'blob'
        var data = options.data || null
        xhr.addEventListener('load', function () {
          var data = {}
          data[options.dataType] = xhr.response
          callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders())
        })
        xhr.withCredentials = true
        xhr.open(type, url, true)
        xhr.responseType = dataType
        xhr.send(data)
      },
      abort: function () {
        jqXHR.abort()
      }
    }
  }
})

module.exports = {
  apiDownLoad: function (dataObj, endPointUrl, typeRequest, callbackFunc) {
    $.ajax({
      url: (endPointUrl.indexOf('http') > -1 ? endPointUrl : appConfig.apiBaseUrl + endPointUrl),
      method: 'GET',
      dataType: 'binary'
    })
      .done(function (response, status, header) {
        var a = document.createElement('a')
        document.body.appendChild(a)
        a.style.display = 'none'
        var fileURL = window.URL.createObjectURL(response)
        a.href = fileURL
        a.download = 'cv talenthub.pdf'
        a.click()
      })
  },
  apiCall: function (dataObj, endPointUrl, typeRequest, callbackFunc) {
    console.info('apiCall url', endPointUrl)
    if (dataObj && typeRequest.toLowerCase() !== 'get') {
      dataObj = JSON.stringify(dataObj)
    }
    bus.$emit('connect:start')
    $.ajax({
      url: (endPointUrl.indexOf('http') > -1 ? endPointUrl : appConfig.apiBaseUrl + endPointUrl),
      method: typeRequest,
      dataType: 'json',
      contentType: 'application/json',
      xhrFields: {
        withCredentials: true
      },
      data: dataObj || null,
      beforeSend: function (xhr) {
          //  var token = Cookies.get('token')
          //    if (token && token !== 'null' && token !== 'undefined') xhr.setRequestHeader('Authorization', 'Bearer ' + Cookies.get('token'))
      }
    })
      .done(function (response, status, header) {
        bus.$emit('connect:end')
        if (callbackFunc) callbackFunc(null, response, header.getAllResponseHeaders())
      })
      .fail(function (error, status, header) {
        bus.$emit('connect:end')
        // notify.fail(error)
        if (error.status === 401) {
          Cookies.remove('token')
          // window.location = '/auth/logout'
          window.localStorage.removeItem('auth')
        }
        if (callbackFunc) callbackFunc(error, null)
      })
  },
  apiAsync: function (_method_, _url_, _data_) {
    if (_data_ && _method_.toLowerCase() !== 'get') {
      _data_ = JSON.stringify(_data_)
    }
    if (callStack.isPending(_url_)) {
      return callStack.resolve(_url_)
    }
    var promise = new Promise((resolve, reject) => {
      bus.$emit('connect:start')
      $.ajax({
        url: (_url_.indexOf('http') > -1 ? _url_ : appConfig.apiBaseUrl + _url_),
        method: _method_,
        dataType: 'json',
        contentType: 'application/json',
        xhrFields: {
          withCredentials: true
        },
        data: _data_ || null
      })
      .done((response) => {
        // if (header) header = this.parse(header.getAllResponseHeaders())
        callStack.remove(_url_)
        bus.$emit('connect:end')
        resolve(response)
      })
      .fail(error => {
        callStack.remove(_url_)
        bus.$emit('connect:end')
        // notify.fail(error)
        reject(error)
        if (error.status === 401) {
          Cookies.remove('token')
          // window.location = '/auth/logout'
          window.localStorage.removeItem('auth')
        }
      })
    })
    callStack.add(_url_, promise)
    return promise
  },
  apiAsyncWithCustomReferrer: function (_method_, _url_, _data_, _referrer_) {
    if (_data_ && _method_.toLowerCase() !== 'get') {
      _data_ = JSON.stringify(_data_)
    }
    if (callStack.isPending(_url_)) {
      return callStack.resolve(_url_)
    }
    var promise = new Promise((resolve, reject) => {
      bus.$emit('connect:start')
      $.ajax({
        url: (_url_.indexOf('http') > -1 ? _url_ : appConfig.apiBaseUrl + _url_),
        method: _method_,
        dataType: 'json',
        contentType: 'application/json',
        headers: { 'X-Alt-Referer': _referrer_ || window.location.protocol + '//' + window.location.hostname },
        xhrFields: {
          withCredentials: true
        },
        data: _data_ || null
      })
      .done((response) => {
        // if (header) header = this.parse(header.getAllResponseHeaders())
        callStack.remove(_url_)
        bus.$emit('connect:end')
        resolve(response)
      })
      .fail(error => {
        callStack.remove(_url_)
        bus.$emit('connect:end')
        // notify.fail(error)
        reject(error)
        if (error.status === 401) {
          Cookies.remove('token')
          // window.location = '/auth/logout'
          window.localStorage.removeItem('auth')
        }
      })
    })
    callStack.add(_url_, promise)
    return promise
  },
  apiAsyncWithHeaders: function (_method_, _url_, _data_) {
    if (_data_ && _method_.toLowerCase() !== 'get') {
      _data_ = JSON.stringify(_data_)
    }
    if (callStack.isPending(_url_)) {
      return callStack.resolve(_url_)
    }
    var promise = new Promise((resolve, reject) => {
      bus.$emit('connect:start')
      $.ajax({
        url: (_url_.indexOf('http') > -1 ? _url_ : appConfig.apiBaseUrl + _url_),
        method: _method_,
        dataType: 'json',
        contentType: 'application/json',
        xhrFields: {
          withCredentials: true
        },
        data: _data_ || null,
        success: function (data, textStatus, request) {
          callStack.remove(_url_)
          bus.$emit('connect:end')
          resolve({
            data: data,
            status: textStatus,
            request: request
          })
        },
        error: function (request, textStatus, error) {
          callStack.remove(_url_)
          bus.$emit('connect:end')
          notify.fail(error)
          reject(error)
          if (textStatus === 401) {
            Cookies.remove('token')
            // window.location = '/auth/logout'
            window.localStorage.removeItem('auth')
          }
        }
      })
    })
    callStack.add(_url_, promise)
    return promise
  },
  parse: function (headerStr) {
    var headers = {}
    if (!headerStr) return headers
    var headerPairs = headerStr.split('\u000d\u000a')
    for (var i = 0; i < headerPairs.length; i++) {
      var headerPair = headerPairs[i]
      var index = headerPair.indexOf('\u003a\u0020')
      if (index > 0) {
        var key = headerPair.substring(0, index)
        var val = headerPair.substring(index + 2)
        headers[key] = val
      }
    }
    return headers
  },
  goTo: function (page) {
    switch (page) {
      default: window.location.href = page
        break
    }
  },
  script: function (url) {
     return $.ajax({
      url: url,
      dataType: 'script',
      cache: true
    })
  }
}

// intern //
callStack.isPending = function (url) {
  return callStack.findIndex(i => i.url === url) > -1
}

callStack.resolve = function (url) {
  return callStack.find(i => i.url === url).promise
}

callStack.add = function (url, promise) {
  callStack.push({url, promise})
}

callStack.remove = function (url) {
  let item = callStack.find(i => i.url === url)
  callStack.$remove(item)
}
