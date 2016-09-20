import Vue from 'vue'
import store from 'src/store/index.store.js'
var kudosContainer = require('profile/slaves/kudos/kudos.container.vue')
describe('kudos.container.vue', () => {
  const vm = new Vue({
    data () {
      return {
        data: {'id': 4893, 'title': 'Senior Accounts Technician', 'description': 'Investor', 'since': '2015-07-17T00:00:00.000Z'},
        editmode: true
      }
    },
    template: '<div><childcomponent  v-ref:reference :editmode="editmode" :record="data"></childcomponent></div>',
    components: {
      'childcomponent': kudosContainer
    },
    store: store
  }).$mount()
  it('should editmode be true', () => {
    expect(vm.$refs.reference.editmode).to.equal(vm.editmode)
  })
  it('should experience not be null', () => {
    expect(vm.$refs.reference.record).to.equal(vm.data)
  })
})
