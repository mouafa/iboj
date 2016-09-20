import Vue from 'vue'
import Vuex from 'vuex'
var kudosEditor = require('profile/slaves/kudos/kudos.editor.vue')
Vue.use(Vuex)
describe('kudos.editor.vue', () => {
  const store = new Vuex.Store({
    state: {
      badges: [{'id': 1, 'img': 'http://img.talenthub.io/assets/images/smart.svg', 'name': 'Smart'}],
      relationship: [{'id': 1, 'semantics': 'Coworkers', 'description': 'The endorser worked with the endorsed', 'type': 'work'}],
      endorsments: []
    },
    mutations: {
      ['SET_PROFILE_BADGES'] (state, badges) {
        state.badges = badges
      },
      ['SET_PROFILE_RELATIONSHIP'] (state, relationship) {
        state.relationship = relationship
      },
      ['ADD_PROFILE_ENDORSMENT_EXP'] (state, data) {
        state.endorsments.push(data)
      }
    }
  })
  it('load badges and relationship', () => {
    store.dispatch('SET_PROFILE_BADGES', [{'id': 1, 'img': 'http://img.talenthub.io/assets/images/smart.svg', 'name': 'Smart'}])
    expect(store.state.badges[0].name).to.equal('Smart')
    store.dispatch('SET_PROFILE_RELATIONSHIP', [{'id': 1, 'semantics': 'Coworkers', 'description': 'The endorser worked with the endorsed', 'type': 'work'}])
    expect(store.state.relationship[0].type).to.equal('work')
  })
  it('save new endorsment', () => {
    store.dispatch('ADD_PROFILE_ENDORSMENT_EXP', [{'id': 1, 'content': 'content', 'relationship_id': 1}])
    expect(store.state.endorsments).to.not.equal([])
  })
  const vm = new Vue({
    data () {
      return {
        data: {'id': 4893, 'title': 'Senior Accounts Technician', 'description': 'Investor', 'since': '2015-07-17T00:00:00.000Z'},
        typerec: 'work'
      }
    },
    template: '<div><childcomponent  v-ref:reference :typerec="typerec" :record="data"></childcomponent></div>',
    components: {
      'childcomponent': kudosEditor
    },
    store: store
  }).$mount()
  it('should have empty fields after cancel', () => {
    vm.$refs.reference.content = 'content'
    vm.$refs.reference.reset()
    expect(vm.$refs.reference.content).to.equal(null)
  })
  it('should have error where content is null', () => {
    vm.$refs.reference.content = null
    vm.$refs.reference.save()
    expect(vm.$refs.reference.error).to.equal('Missing Required Fields')
  })
  it('should save data', () => {
    vm.$refs.reference.content = 'content'
    vm.$refs.reference.relation = 1
    vm.$refs.reference.error = null
    vm.$refs.reference.save()
    expect(vm.$refs.reference.error).to.equal(null)
  })
})
