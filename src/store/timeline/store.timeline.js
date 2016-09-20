// initial state
const state = {
  data: [],
  loaded: false,
  total: null,
  limit: 10,
  page: 1
}

// mutations
const mutations = {
  'SET_TIMELINE_DATA' (state, newdata, header) {
    state.data = [ ...state.data, ...newdata ]
    state.loaded = state.data.length
    state.total = Number(header.total)
    state.page = Math.floor(state.loaded / state.limit) + 1
  },
  'SET_TIMELINE_APPLY' (state, id) {
    if (!state.loaded) return
    state.data.forEach((item) => {
      if (item.id == id) item.apply = true
    })
  }
}

export default {
  state,
  mutations
}
