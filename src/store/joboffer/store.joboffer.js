const init = {
  data: {
    slug: '',
    uuid: null,
    company: null,
    targets: null,
    title: '',
    category_id: '',
    collaborators: [],
    location: null,
    description: '',
    summary: '',
    expectations: '',
    benefits: '',
    tags: [],
    degree: '',
    type: '',
    experience_id: 0,
    salary_min: 0,
    salary_max: 0,
    salary_type: 'Per Month',
    release_date: '',
    suspend_date: '',
    city_id: null,
    company_id: null,
    jobtype_id: '',
    requirements: [],
    questions: [],
    incentive: 10,
    statistic: null
  },
  loaded: false,
  referrer: '',
  persist: false,
  jobofferCategories: null,
  jobofferTypes: null,
  salaryTypes: null,
  yearsOfExperience: null,
  degrees: null,
  applicationList: [],
  numberOfApplication: 0
}
// initial state
const state = Object.assign({}, init)

// mutations
const mutations = {
  'SET_JOBOFFER_DATA' (state, res, persist) {
    state.loaded = res.slug ? res.slug : res.uuid
    if (res.applications && res.applications.length) {
      res.applications.forEach(app => (app.notif = false))
    }
    state.data = res
    if (persist) state.persist = true
  },
  'RESET_JOBOFFER_DATA' (state, force) {
    if (state.persist && !force) return
    // console.info('flushed')
    // Object.assign(state, init)
  },
  'SET_JOBOFFER_APPLICATIONS' (state, data, total) {
     state.applicationList = data
     state.numberOfApplication = Number(total)
  },
  'SET_JOBOFFER_APPLY' (state, res) {
    state.data.apply = true
  },
  // badges
  'SET_JOBOFFER_CATEGORIES' (state, data) {
    state.jobofferCategories = data
  },
  'SET_JOBOFFER_TYPES' (state, data) {
    state.jobofferTypes = data
  },
  'SET_JOBOFFER_SALARYTYPES' (state, data) {
    state.salaryTypes = data
  },
  'SET_REFERRER' (state, data) {
    state.referrer = data
  },
  'SET_JOBOFFER_YEARSEXPERIENCE' (state, data) {
    state.yearsOfExperience = data
  },
  'SET_JOBOFFER_DEGREES' (state, data) {
    state.degrees = data
  },
  'UPDATE_APPLICATION_STATUS' (state, recID, value) {
    var apps = state.applicationList
    var index = apps.findIndex((i) => i.id === recID)
    apps[index].state = value
  },
  'UPDATE_APPLICATION_LIST' (state, notifsArray) {
    if (!notifsArray || !state.applicationList || !state.applicationList.length) return
    state.applicationList.forEach((application) => {
      if (!notifsArray.length) application.notif = false
      let x = false
      notifsArray.forEach((notif) => {
        if (application.recommended === notif) {
          x = true
        }
      })
      application.notif = x
    })
  }
}

export default {
  state,
  mutations
}
