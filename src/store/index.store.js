// import Vue from 'vue'
import Vuex from 'vuex'
import account from './account/store.account'
import company from './company/store.company'
import notifs from './notifs/store.notifs'
import profile from './profile/store.profile'
import joboffer from './joboffer/store.joboffer'
import timeline from './timeline/store.timeline'
import filter from './filter/store.filter'
import messenger from './messenger/store.messenger'
// import products from './modules/products'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    account,
    company,
    notifs,
    profile,
    joboffer,
    timeline,
    filter,
    messenger
  },
  strict: debug
})
