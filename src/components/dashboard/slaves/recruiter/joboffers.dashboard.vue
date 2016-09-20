<style lang="less" scoped>
.card-container {
  min-height: 425px;
  padding: 0;
  .input-container {
    display: inline-block;
    margin-left: 15px;
    label {
      padding-left: 25px;
    }
  }
  .-pagination-container {
    margin: 0 !important;
    .pagination {
      margin: 0;
      .pagination-buttons {
        padding: 0px;
      }
      li {
        transition: 200ms;
        font-size: 1rem;
        line-height: 1rem;
        padding: 8px;
        &.disabled {
          opacity: 0;
          a {
            display: none;
          }
        }
      }
    }
    .btn-flat {
      padding: 0;
    }
  }
}
</style>

<template>
<section class="card-container">
  <form>
    <p class="input-container">
      <input type="checkbox" id="open" v-model="chosen.open" />
      <label for="open">Open</label>
    </p>
    <p class="input-container">
      <input type="checkbox" id="draft" v-model="chosen.draft" />
      <label for="draft">Draft</label>
    </p>
    <p class="input-container">
      <input type="checkbox" id="closed" v-model="chosen.closed" />
      <label for="closed">Closed</label>
    </p>
  </form>
  <div>
    <joboffer v-for="joboffer in recruiterJoboffers | selectedType" track-by="$index" :job="joboffer"></joboffer>
  </div>
  <section class="-pagination-container fx-row fx-center-center m-b-sm row" flex>
    <ul v-if="total > limit && recruiterJoboffers.length" class="pagination fx-row fx-start-center" flex>
        <li @click="prevRange" :class="{'disabled': !hasPrev}" class="pagination-buttons" flex>
          <a class="waves-effect waves-teal btn-flat">
            Prev. Page
          </a>
        </li>
        <li @click="goTo(pg)" v-for="pg in pagesRange" class="waves-effect" :class="{'active teal lighten-2': page === pg}">
          <a>{{pg}}</a>
        </li>
        <li @click="nextRange" :class="{'disabled': !hasNext}" class="pagination-buttons" flex>
          <a class="waves-effect waves-teal btn-flat">
            Next Page
          </a>
        </li>
      </ul>
  </section>
</section>
</template>

<script>
import joboffer from 'dashboard/slaves/recruiter/joboffer-details-row.dashboard.vue'

let connect = require('services/connect')

module.exports = {
  components: {
    joboffer: joboffer
  },
  data () {
    return {
      chosen: {
        open: false,
        draft: false,
        closed: false
      },
      recruiterJoboffers: [],
      total: 0,
      page: 1,
      numberOfPages: 0,
      limit: 50
    }
  },
  ready () {
    let vm = this
    vm.$watch('chosen', (oldVal, newVal) => {
      let states = []
      if (newVal.open) states.push('pushed')
      if (newVal.draft) states.push('staged')
      if (newVal.closed) states.push(...['concluded', 'aborted'])
      vm.page = 1
      vm.recruiterJoboffers = []
      vm.getJoboffers(states)
      .then((result) => {
        vm.total = result.request.getResponseHeader('total')
        vm.numberOfPages = Math.ceil(vm.total / vm.limit)
        vm.recruiterJoboffers = result.data
      })
      .catch((err) => console.error(err))
    }, { deep: true })

    vm.getJoboffers()
    .then((result) => {
      vm.total = result.request.getResponseHeader('total')
      vm.numberOfPages = Math.ceil(vm.total / vm.limit)
      vm.recruiterJoboffers = result.data
    })
    .catch((err) => console.error(err))
  },
  filters: {
    selectedType: function (arr) {
      return arr
    }
  },
  computed: {
    pagesRange () {
      let vm = this
      let min = Math.floor((vm.page - 1) / 10) * 10
      let minOfMax = Math.floor((vm.numberOfPages - 1) / 10) * 10
      let max = vm.numberOfPages
      let arr = []
      if ((vm.page - minOfMax) <= 0) {
        max = min + 10
      }
      for (var i = min + 1; i <= max; i++) {
        arr.push(i)
      }
      return arr
    },
    hasPrev () {
      let vm = this
      return vm.page > 1
    },
    hasNext () {
      let vm = this
      return vm.page < vm.numberOfPages
    }
  },
  methods: {
    getJoboffers (states) {
      let vm = this
      if (!states || !states.length) states = ['pushed', 'staged', 'concluded', 'aborted']
      return connect.apiAsyncWithHeaders('GET', '/dashboard/joboffers?fields=[id,uuid,collaborators,applications,company,responsible,created_at,title,state,slug]', {
        limit: vm.limit,
        page: vm.page,
        state: states
      })
    },
    goTo (p) {
      let vm = this
      vm.recruiterJoboffers = []
      if (p) vm.page = p
      vm.getJoboffers()
      .then((result) => {
        vm.total = result.request.getResponseHeader('total')
        vm.numberOfPages = Math.ceil(vm.total / vm.limit)
        vm.recruiterJoboffers = result.data
      })
      .catch((err) => console.error(err))
    },
    nextRange () {
      let vm = this
      if (vm.page < vm.numberOfPages) vm.page++
      vm.goTo()
    },
    prevRange () {
      let vm = this
      if (vm.page > 1) vm.page--
      vm.goTo()
    }
  }
}
</script>
