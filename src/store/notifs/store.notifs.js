// initial state
const state = {
  notifs: []
}

// mutations
const mutations = {
  ADD_NOTIF (state, data) {
    state.notifs.push(data)
  }
}

export default {
  state,
  mutations
}
