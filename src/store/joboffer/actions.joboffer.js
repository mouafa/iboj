var connect = require('services/connect')

import notify from 'services/notifs-center'

export const loadJoboffer = ({ dispatch, state }, jobofferId, persist) => {
  return new Promise(function (resolve, reject) {
    if (state.joboffer.loaded == jobofferId) resolve(state.joboffer.data)
    else {
      connect.apiAsyncWithCustomReferrer('GET', '/joboffers/' + jobofferId, null, state.joboffer.referrer)
      .then((res) => {
        resolve(res)
        dispatch('SET_JOBOFFER_DATA', res, persist)
      })
      .catch((err) => {
        notify.fail(err)
        reject(err)
      })
    }
  })
}

// load applicationList
export const loadJobofferApplications = ({ dispatch }, id, data) => {
  return new Promise((resolve, reject) => {
    connect.apiCall(data, '/dashboard/joboffers/' + id + '/recommendations', 'GET', (err, res, header) => {
      if (err) reject(err)
      else {
        dispatch('SET_JOBOFFER_APPLICATIONS', res, connect.parse(header).total)
        resolve(res)
      }
    })
  })
}

export const resetJoboffer = ({ dispatch, state }, force) => {
  dispatch('RESET_JOBOFFER_DATA', force)
}

// add joboffer actions
export const saveJoboffer = ({ dispatch, state }, data) => {
  var jobId = data.id
  return new Promise(function (resolve, reject) {
    let url = jobId ? '/joboffers/' + jobId : '/joboffers'
    let method = jobId ? 'PUT' : 'POST'
    data = $formatJob(Object.assign({}, data))
    connect.apiAsync(method, url, data)
    .then((res) => {
      resolve(res)
      // dispatch('SET_JOBOFFER_DATA', res)
    })
    .catch((err) => {
      notify.fail(err)
      reject(err)
    })
  })
}

export const saveJobofferQuiz = ({ dispatch, state }, data, jobId) => {
  return new Promise(function (resolve, reject) {
    if (!data.questions || !data.questions[0] || !jobId) return resolve()
    data.questions = data.questions.map((i) => { return { subject: i.subject, target: i.target, type: i.type } })
    connect.apiAsync('PUT', '/joboffers/' + jobId, data)
    .then((res) => {
      resolve(res)
      // dispatch('SET_JOBOFFER_DATA', res)
    })
    .catch((err) => {
      notify.fail(err)
      reject(err)
    })
  })
}

// jobofferCategories action
export const loadjobCategories = ({ dispatch, state }) => {
  if (state.joboffer.jobofferCategories) return
  connect.apiAsync('GET', '/jobofferCategories')
  .then((res) => dispatch('SET_JOBOFFER_CATEGORIES', res),
        (err) => console.warn('err load joboffer Categories', err.responseText))
}

// jobofferTypes action
export const loadjobTypes = ({ dispatch, state }) => {
  if (state.joboffer.jobofferTypes) return
  connect.apiAsync('GET', '/jobofferTypes')
  .then((res) => dispatch('SET_JOBOFFER_TYPES', res),
        (err) => console.warn('err load joboffer Types', err.responseText))
}

// salarytypes action
export const loadSalaryTypes = ({ dispatch, state }) => {
  if (state.joboffer.salaryTypes) return
  connect.apiAsync('GET', '/salaryTypes')
  .then((res) => dispatch('SET_JOBOFFER_SALARYTYPES', res),
        (err) => console.warn('err load joboffer salary Types', err.responseText))
}
// joboffer years of experience action
export const loadYearOfExperience = ({ dispatch, state }) => {
  if (state.joboffer.yearsOfExperience) return
  connect.apiAsync('GET', '/jobofferExperience')
  .then((res) => dispatch('SET_JOBOFFER_YEARSEXPERIENCE', res),
        (err) => console.warn('err load joboffer years of experience', err.responseText))
}

// joboffr degrees
export const loadDegrees = ({ dispatch, state }) => {
  if (state.joboffer.degrees) return
  connect.apiAsync('GET', '/degrees')
  .then((res) => dispatch('SET_JOBOFFER_DEGREES', res),
        (err) => console.warn('err load joboffer degrees', err.responseText))
}

export const updateStatus = ({ dispatch, state }, recID, value) => {
  dispatch('UPDATE_APPLICATION_STATUS', recID, value)
}

export const addNewMessagesNotifications = ({ dispatch, state }, notifsArray) => {
  dispatch('UPDATE_APPLICATION_LIST', notifsArray)
}

export const setReferrer = ({ dispatch, state }, referrer) => {
  dispatch('SET_REFERRER', referrer)
}

// export const setRecommendation = ({ dispatch, state }, callback) => {
//   dispatch('SET_RECOMMENDATION_DATA')
//   callback
// }

/** utitlity **/
function $formatJob (src) {
  var fields = ['questions', 'tags', 'targets', 'title', 'company_id', 'description', 'incentive', 'salary_type', 'salary_min', 'salary_max', 'city_id', 'degree', 'jobtype_id', 'experience_id', 'release_date', 'type', 'requirements', 'state']
  var data = {}
  fields.map((i) => (data[i] = src[i]))
  if (!data.company_id) data.company_id = $isObject(src.company) ? src.company.id : src.company
  if (!data.city_id) data.city_id = $isObject(src.location) ? src.location.id : src.location
  if (!data.release_date) delete data.release_date
  if (!data.type) data.type = 'public'
  return data
}

function $isObject (obj) {
  return typeof obj === 'object'
}
