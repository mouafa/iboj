const connect = require('services/connect')
const bus = require('services/bus')
const tungolia = require('webpack-config-loader!src/main.config.js').tungolia
const FURL = require('services/filter-url')
var lastCallOptions // prevent firing same call

function getJoboffers ({ dispatch, state }, _options = {}, ignoreResult = false) {
  Object.assign(options, _options)
  // console.info('lastCallOptions', lastCallOptions === JSON.stringify(options))
  return new Promise(function (resolve, reject) {
    if (lastCallOptions === JSON.stringify(options)) {
      resolve(options)
      return
    }
    connect.apiAsync('POST', tungolia.url + '/filter/joboffer', options)
    .then((res) => {
      dispatch('SET_FILTER_RESULT', res, options, ignoreResult)
      resolve(options)
    })
    .catch(reject)
    lastCallOptions = JSON.stringify(options)
  })
}

export const loadJoboffers = ({ dispatch, state }, _options = {}, ignoreResult = false) => {
  return getJoboffers({ dispatch, state }, _options, ignoreResult).then((options) => FURL.stringify(options))
}

export const termUpdate = ({ dispatch, state }, options) => {
  options.page = 1
  loadJoboffers({ dispatch, state }, options)
}

export const orderUpdate = ({ dispatch, state }, sortBy, orderby) => {
  let query = {'sortBy': sortBy, 'sortOrder': orderby}
  // console.log(query)
  loadJoboffers({ dispatch, state }, query)
}

export const goToPage = ({ dispatch, state }, page) => {
  let query = { page }
  loadJoboffers({ dispatch, state }, query)
  .then(() => window.$('html, body').animate({ scrollTop: '0px' }))
}

export const filterUpdate = ({ dispatch, state }, category, data) => {
  options.page = 1
  filterBase[category] = data
  // console.log('filterbase', filterBase)
  let filters = parseFilters()
  // console.info('parseFilters', filters)
  loadJoboffers({ dispatch, state }, {filters})
}

export const loadFiltredJoboffers = ({ dispatch, state }) => {
  var options = FURL.parse()
  getJoboffers({ dispatch, state }, options)
  storeFilters(options)
}

export const watchUrlFilter = ({ dispatch, state }) => {
  FURL.watchUrl(() => {
    loadFiltredJoboffers({ dispatch, state })
  })
}

/** intern **/
var filterBase = {
  category: [],
  company: [],
  // jobtype: [],
  salary: [],
  tags: []
}

function parseFilters () {
  var filters = []
  // console.info('filterBase', filterBase)
  filters = filters.concat(filterBase.category.map(i => ({field: 'category.name.full', type: 'term', value: i})))
  filters = filters.concat(filterBase.company.map(i => ({field: 'company.name.full', type: 'term', value: i})))
  // filters = filters.concat(filterBase.jobtype.map(i => ({field: 'job_type.full', type: 'term', value: i.value})))
  if (filterBase.salary.length) {
    let i = filterBase.salary
    filters = filters.concat([{field: 'salary_min', type: 'range', from: i[0], to: i[1]}])
    filters = filters.concat([{field: 'salary_max', type: 'range', from: i[0], to: i[1]}])
  }
  filters = filters.concat(filterBase.tags.map(i => ({field: 'tags', type: 'term', value: i})))
  return filters
}

function storeFilters ({filters, term, sortBy, sortOrder}) {
  if (term) bus.$emit('filter:set:query', term)
  if (sortOrder) bus.$emit('filter:set:sort', {sortBy, sortOrder})
  if (!filters) filters = []
  filterBase.category = filters.filter(i => i.field == 'category.name.full').map(i => i.value)
  bus.$emit('filter:set:category', filterBase.category)
  filterBase.company = filters.filter(i => i.field == 'company.name.full').map(i => i.value)
  bus.$emit('filter:set:company', filterBase.company)
  filterBase.tags = filters.filter(i => i.field == 'tags').map(i => i.value)
  bus.$emit('filter:set:tags', filterBase.tags)

  if (filters.findIndex(i => i.field == 'salary_min') > -1) {
    filterBase.salary[0] = filters.filter(i => i.field == 'salary_min').map(i => i.from)[0]
    filterBase.salary[1] = filters.filter(i => i.field == 'salary_max').map(i => i.to)[0]
    bus.$emit('filter:set:salary', filterBase.salary)
  }
  // console.info('storeFilters', filterBase)
}

var options = {
  attributesToSearch: ['title', 'company.name', 'tags', 'summary', 'description'],
  parser: 'source',
  page: 1,
  hitsPerPage: 10,
  sortBy: 'release_date',
  sortOrder: 'desc',
  facets: [
          // {'field': 'incentive', 'type': 'stats'},
          {'field': 'salary_min', 'type': 'min'},
          {'field': 'salary_max', 'type': 'max'},
          // {'field': 'job_type.full', 'type': 'terms'},
          // {'field': 'experience', 'type': 'terms'},
          {'field': 'company.name.full', 'type': 'terms'},
          {'field': 'category.name.full', 'type': 'terms'}
          ]
}
