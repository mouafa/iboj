// initial state
const state = {
  data: {},
  loaded: false,
  authed: false,
  connexion: null
}

// mutations
const mutations = {
  'SET_ACCOUNT_DATA' (state, res) {
    state.loaded = res.slug ? res.slug : res.uuid
    state.authed = true
    let _data = {
      user: res.user,
      title: res.title,
      state: res.state,
      img: res.img,
      id: res.id,
      slug: res.slug,
      uuid: res.uuid,
      name: res.firstname + ' ' + res.lastname,
      invitations: res.invitations,
      visits: res.visits,
      email: res.email
    }
    state.data = _data
  },
  'SET_ACCOUNT_ATR' (state, key, value) {
    state.data[key] = value
  },
  'SET_ACCOUNT_AUTHED' (state, value) {
    state.authed = value
    if (!state.authed) state.loaded = 'unauth'
  },
  'INVITATION_SENT' (state) {
    state.data.invitations --
  }
}

export default {
  state,
  mutations
}
