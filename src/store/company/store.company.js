// initial state
const state = {
  data: {},
  joboffers: [],
  loaded: false
}

// mutations
const mutations = {
  'SET_COMPANY_DATA' (state, res) {
    state.loaded = res.slug ? res.slug : res.uuid
    let _data = {
      id: res.id,
      slug: res.slug,
      uuid: res.uuid,
      name: res.name,
      url: res.url,
      description: res.description,
      logo: res.logo,
      address: res.address,
      region: res.region,
      country: res.country,
      email: res.email,
      zipcode: res.zipcode,
      phone: res.phone,
      city: res.city,
      created_by: res.created_by
    }
    state.data = _data
  },
  'SET_COMPANY_JOBOFFERS' (state, res) {
    state.joboffers = res
  },
  'SET_COMPANY_IMG' (state, res) {
    state.data.logo = res
  },
  'UNLOAD_COMPANY' (state) {
    state.loaded = false
    state.data = {}
    state.joboffers = []
  }
}

export default {
  state,
  mutations
}
