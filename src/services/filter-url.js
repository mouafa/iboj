const QSTART = '#!/?q='
const EDGES = {
  filterDevider: '&',
  rangeDevider: ':',
  shortName: '$'
}
var ignoreUrlChange = false
var pickUp = ['term', 'page', 'sortBy', 'sortOrder']

exports.stringify = function stringify (options) {
  // console.info('raw', options)
  if (!options.term && !options.filters && options.page == 1) return
  var filters = []
  // if (options.term) filters.unshift(`term=${options.term}`)
  // if (options.page && options.page != 1) filters.push(`page=${options.page}`)
  // if (options.sortBy) filters.push(`sortBy=${options.sortBy}`)
  // if (options.sortOrder) filters.push(`sortOrder=${options.sortOrder}`)

  pickUp.forEach(key => {
    if (options[key]) filters.push(`${key}=${options[key]}`)
  })

  if (options.filters) filters = filters.concat(options.filters.map(encodeFilter))

  // console.info('filters', filters)
  ignoreUrlChange = true
  putToUrl(filters.join(EDGES.filterDevider))
  // console.info('putToUrl', ignoreUrlChange)
}

exports.parse = function parse (options) {
  var urlFilters = getFromUrl().split(EDGES.filterDevider)
  var out = {
    // term: '',
    // filters: null,
    page: 1
  }
  pickUp.forEach(key => {
    let item = urlFilters.find(i => i.indexOf(key) === 0)
    if (item) {
      out[key] = item.split('=')[1]
      urlFilters.$remove(item)
    }
  })
  if (urlFilters[0]) {
    out.filters = urlFilters.map(decodeFilter)
  }
  // console.info('urlFilters', urlFilters, out)
  return out
}

exports.watchUrl = function watchUrl (callback) {
  if (!callback) return
  // $(window).on('hashchange',
  window.onhashchange = function trackUrlChange () {
    if (ignoreUrlChange) return (ignoreUrlChange = false)
    // console.info('url changed firing callback')
    callback()
  }
}

/** intern **/
/** encode filter **/

function encodeFilter (i) {
  if (i.type == 'term') {
    return `${encodeField(i.field)}=${i.value}`
  } else if (i.type == 'range') {
    return `${i.field}=${i.from}${EDGES.rangeDevider}${i.to}`
  }
}

function encodeField (i) {
  return i.replace('.name.full', EDGES.shortName)
}

function putToUrl (q) {
  if (q) {
    window.location.hash = QSTART + encodeURI(q)
  } else {
    window.location.hash = '#!/'
  }
}

/** decode filter **/
function decodeFilter (i) {
  i = i.split('=')
  if (!i || !i.length || !i[1]) return
  // console.log('i index', i)
  if (i[1].indexOf(EDGES.rangeDevider) == -1) {
    return {
      field: decodeField(i[0]),
      type: 'term',
      value: i[1]
    }
  } else {
    var range = i[1].split(EDGES.rangeDevider)
    return {
      field: decodeField(i[0]),
      type: 'range',
      from: Number(range[0]),
      to: Number(range[1])
    }
  }
}

function decodeField (i) {
  return i.replace(EDGES.shortName, '.name.full')
}

function getFromUrl () {
  var url = window.location.hash
  if (url.indexOf(QSTART) === 0) {
    return decodeURI(url.replace(QSTART, ''))
  } else {
    return ''
  }
}
