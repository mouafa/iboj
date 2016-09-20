var urlParser = document.createElement('a')
function pluralize (time, label) {
  if (time === 1) {
    return time + label
  }
  return time + label + 's'
}
module.exports = {
  ISODate: {
    read: function (date) {
      if (date) {
        if (date.indexOf('T') >= 0) return date.substring(0, date.indexOf('T'))
        else if (/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(date)) return date
      }
      return date
    },
    write: function (date, oldVal) {
      if (/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(date)) return date
      else return oldVal
    }
  },
  toDate: {
    read: function (date) {
      var t = new Date(date)
      return t.toDateString()
    },
    write: function (date, oldVal) {
      var t = new Date(date)
      return t.toDateString()
    }
  },
  date: {
    read: function (date) {
      if (/((19|20)\d\d)-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/.test(date)) return date
      return ''
    },
    write: function (date, oldVal) {
      if (/((19|20)\d\d)-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/.test(date)) return date
      return ''
    }
  },
  domain: {
    read: function (url) {
      urlParser.href = url
      return urlParser.hostname
    },
    write: function (url, oldVal) {
      urlParser.href = url
      return urlParser.hostname
    }
  },
  fromNow: {
    read: function (time) {
      var between = Date.now() / 1000 - Number(time)
      if (between < 3600) {
        return pluralize(~~(between / 60), ' minute')
      } else if (between < 86400) {
        return pluralize(~~(between / 3600), ' hour')
      } else {
        return pluralize(~~(between / 86400), ' day')
      }
    },
    write: function (time, oldVal) {
      var between = Date.now() / 1000 - Number(time)
      if (between < 3600) {
        return pluralize(~~(between / 60), ' minute')
      } else if (between < 86400) {
        return pluralize(~~(between / 3600), ' hour')
      } else {
        return pluralize(~~(between / 86400), ' day')
      }
    }
  },
  month: {
    read: function (value, min = 0, max = 13) {
      if (min == -1) min = new Date().getMonth()
      if (max == -1) max = new Date().getMonth()
      value = Number(value)
      if (value > min && value < max) return value < 10 ? '0' + value : value
      return ''
    },
    write: function (value, oldVal, min = 0, max = 13) {
      if (min == -1) min = new Date().getMonth()
      if (max == -1) max = new Date().getMonth()
      value = Number(value)
      if (value > min && value < max) return value < 10 ? '0' + value : value
      return ''
    }
  },
  year: {
    read: function (value, min = 1940, max = 2030) {
      if (min == -1) min = (new Date().getFullYear())
      if (max == -1) max = (new Date().getFullYear() + 1)
      value = Number(value)
      if (value > min && value < max) return value
      return ''
    },
    write: function (value, oldVal, min = 1940, max = 2030) {
      if (min == -1) min = (new Date().getFullYear())
      if (max == -1) max = (new Date().getFullYear() + 1)
      value = Number(value)
      if (value > min && value < max) return value
      return ''
    }
  },
  not: {
    read: function (value) {
      return !value
    },
    write: function (val, oldVal) {
      return !val
    }
  },
  substring: {
    read: function (value, limit) {
      if (value) return value.substring(0, limit)
      return ''
    },
    write: function (value, oldVal, limit) {
      if (value) return value.substring(0, limit)
      return ''
    }
  },
  email: {
    read: function (val) {
      if (/^(([^<>()[\]\\.,:\s@\"]+(\.[^<>()[\]\\.,:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)) return val
      else return ''
    },
    write: function (val, oldVal) {
      if (/^(([^<>()[\]\\.,:\s@\"]+(\.[^<>()[\]\\.,:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)) return val
      else return ''
    }
  },
  numeric: {
    read: function (val) {
      if (/^[0-9]+$/.test(val)) return Number(val)
      else return ''
    },
    write: function (val, oldVal) {
      if (/^[0-9]+$/.test(val)) return Number(val)
      else return ''
    }
  },
  min: {
    read: function (val, limit) {
      if (Number(val) >= limit) return Number(val)
      else return ''
    },
    write: function (val, limit) {
      if (Number(val) >= limit) return Number(val)
      else return ''
    }
  },
  max: {
    read: function (val, limit) {
      if (Number(val) <= Number(limit)) return Number(val)
      else return ''
    },
    write: function (val, limit) {
      if (Number(val) <= Number(limit)) return Number(val)
      else return ''
    }
  },
  minmax: {
    read: function (val, min, max) {
      if (Number(val) >= Number(min) && Number(val) <= Number(max)) return Number(val)
      else return ''
    },
    write: function (val, oldVal, min, max) {
      if (Number(val) >= Number(min) && Number(val) <= Number(max)) return Number(val)
      else return ''
    }
  },
  url: {
    read: function (val) {
      if (/^\(?(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?$/.test(val)) return val
      else return ''
    },
    write: function (val, oldVal) {
      if (/^\(?(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?$/.test(val)) return val
      else return ''
    }
  },
  string: {
    read: function (vals) {
      // if (/^[ a-zA-Z\-0-9_']+$/.test(vals)) return vals
      // else return ''
      return vals
    },
    write: function (vals, oldVal) {
      // if (/^[ a-zA-Z\-0-9_']+$/.test(vals)) return vals
      // else return ''
      return vals
    }
  },
  lineBreak (val) {
    if (typeof val == 'string') {
      val = val.replace(/</g, '&lt;')
      val = val.replace(/>/g, '&gt;')
      return val.split('\n').join('<br>')
    } else return val
  },
  currency (val) {
    return val + ' TND'// .toFixed(2)
  }
}
