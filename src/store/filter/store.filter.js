// initial state
const state = {
  result: [],
  facets: null,
  loaded: false,
  total: null,
  page: 0,
  limit: 0,
  maxPage: 0
}

// mutations
const mutations = {
  'SET_FILTER_RESULT' (state, data, options, ignoreResult) {
    // console.info(data.total)
    // console.table(data.hits)
    state.facets = margeFacets(state.facets, data.facets)
    if (ignoreResult) return
    state.loaded = true
    state.result = data.hits
    state.total = data.total
    state.page = options.page
    state.limit = options.hitsPerPage
    state.maxPage = state.total % state.limit == 0 ? Math.trunc(state.total / state.limit) : Math.trunc(state.total / state.limit) + 1
  },
  'SET_FILTER_APPLY' (state, id) {
    if (!state.loaded) return
    state.data.forEach((item) => {
      if (item.id == id) item.apply = false
    })
  }
}

export default {
  state,
  mutations
}

/** intern API**/
 function margeFacets (oldFs, newFs) {
   if (!oldFs) return newFs
   var out = Object.assign({}, oldFs)
   each(out, (i, k) => (out[k] = mergeFacetItem(out[k], newFs[k])))
   return out
 }

 function mergeFacetItem (oldF, newF) {
   if (!Array.isArray(oldF) && !Array.isArray(newF)) return newF
   else if (Array.isArray(oldF) && Array.isArray(newF)) {
     if (newF.length >= oldF.length) return newF
     else return mergeRule(oldF, newF)
   }
 }

 function mergeRule (oldF = [], newF = []) {
   oldF.forEach((i, k) => {
     let found = newF.findIndex((j) => i.key == j.key)
     if (found >= 0) oldF[k] = newF[found]
     else oldF[k].doc_count = 0
   })
   return oldF
 }

 function each (obj = {}, callback = () => {}) {
   Object.keys(obj).map(i => callback(obj[i], i))
 }
