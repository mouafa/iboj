import Vue from 'vue'
import store from 'src/store/index.store.js'
var kudosRecord = require('profile/slaves/kudos/kudos.record.vue')
describe('kudos.record.vue', () => {
  const vm = new Vue({
    data () {
      return {
        data: {'id': 4893, 'title': 'Senior Accounts Technician', 'description': 'Investor', 'since': '2015-07-17T00:00:00.000Z'},
        badges: [{'id': 1, 'img': 'http://img.talenthub.io/assets/images/smart.svg', 'name': 'Smart'}]
      }
    },
    template: '<div><childcomponent  v-ref:reference :badges="badges" :record="data"></childcomponent></div>',
    components: {
      'childcomponent': kudosRecord
    },
    store: store
  }).$mount()
  it('should badgesList not be empty', () => {
    expect(vm.$refs.reference.badgesList).to.not.equal([])
  })
  it('should experience not be null', () => {
    expect(vm.$refs.reference.record).to.equal(vm.data)
  })
})
