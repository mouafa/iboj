
<template>
    <div v-show="isReady">
        <div v-if="jobList.length" class="hpanel p-none">
            <ul class="">
             <li v-for="item in jobList" class="collection-item p-xs fx-col">
               <a>{{item.company.name}}</a>
               <span>{{item.title}}</span>
               <div class="fx-row fx-end-start"><button @click="restart(item.id)" class="btn-ghost right capital text-orange">restart</button></div>
             </li>
           </ul>
        </div>

        <section v-else class="fx-col fx-start-center placeholder">
           <i class="material-icons symbol">&#xE85F;</i>
           <p class="m-none capital center">You have no draft job offers</p>
       </section>
    </div>
</template>
<script>
var connector = require('services/connect.js')
var pagination = require('shared/pagination.vue')
// var bus = require('services/bus.js')
module.exports = {
  data: function () {
    return {
      isReady: false,
      error: '',
      jobList: [],
      labelClass: {
        'aborted': 'label-danger',
        'concluded': 'label-success'
      },
      pagination: {
        limit: 5,
        currentPage: 1
      }
    }
  },
  ready () {
    // bus.$on('pagination:change', this.loadJobOffer)
  },
  destroyed () {
    // bus.$off('pagination:change')
  },
  components: {
    pagination
  },
  created () {
    this.loadJobOffer()
  },
  methods: {
    restart (id) {
      window.location = window.location.origin + '/addjoboffer.html#!/' + id
      window.location.reload()
    },
    loadJobOffer (result) {
      if (result) this.pagination = result
      var vm = this
      connector.apiCall({
        limit: this.pagination.limit,
        page: this.pagination.currentPage,
        state: ['staged']
      }, '/dashboard/joboffers', 'GET', function (error, response, header) {
        if (!error) {
          vm.isReady = true
          vm.jobList = response
          vm.pagination.total = parseInt(connector.parse(header).total)
        }
      })
    }
  }
}
</script>
