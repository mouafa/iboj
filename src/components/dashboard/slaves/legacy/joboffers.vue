<template>
  <div class="m-l-xs">
    <recommendationinfo></recommendationinfo>

    <div class="m-b-lg">

      <div v-if="jobOffers && jobOffers.length">
        <section class="bg-white ">
          <div track-by="$index" v-for="item in jobOffers">
            <div class="m-b-xs font-8 p-t-xs">
              <div class="panel-body p-sm m-none p-none border-bottom row fx-row fx-space-between-center">
                <div class="col s8">
                  <section class="fx-row fx-start-center p-xs">
                    <img :src="item.company ? item.company.logo   : ''" @click="gotoCompany(item.company)" alt="logo" class="img-rounded company-logo border size-32 hand">
                    <div class="fx-col m-l-xs" flex>
                      <span @click="gotoCompany(item.company)" class="font-uppercase hand">{{item.company.name || item.company}}</span>
                      <span class="break-word">{{item.title}}</span>
                    </div>
                  </section>
                  <div class="m-l-sm">
                    <span class="break-word">
                      {{{item.summury | lineBreak}}}
                    </span>
                  </div>
                  <section class="fx-row">
                    <div @click="showApplication($index)" class="p-sm m-l-sm font-bold text-info hand" v-if="item.statistic.application.count > 0">
                      <span class="capital">{{item.statistic.application.count}}
                        {{item.statistic.application.count | pluralize 'application'}}</span>
                    </div>
                  </section>
                  <component :is="item.currentView" :joboffer="item.id" transition="fade-in"></component>
                </div>
                <div class="col s3">
                  <div>
                    <span @click="viewDetail(item)" class="m-l-md text-primary hand " v-if="item.id">
                      <span class="capital middle" v-ii18n="detailLbl">View Details</span>
                      <i class="material-icons ">&#xE5CC;</i>
                    </span>

                  </div>
                </div>
                <!-- <applications v-if="item.showrec" :joboffer="item.id"></applications> -->
              </div>
            </div>
          </div>
        </section>

        <paginations :pagination="pagination"></paginations>
      </div>

      <section class="fx-col fx-start-center placeholder" v-else>
        <i class="material-icons symbol">&#xE85F;</i>
        <p class="m-none capital">You don't have any joboffer yet</p>
      </section>

    </div>

  </div>
</template>

<script>
var paginations = require('shared/pagination.vue')
var applications = require('./applications.vue')
var connector = require('services/connect.js')
var recommendationinfo = require('./recommendation_info.vue')
var bus = require('services/bus.js')
module.exports = {
  data () {
    return {
      data: null,
      jobOffers: null,
      pagination: {
        limit: 5,
        currentPage: 1,
        total: null
      }
    }
  },
  components: {
    applications,
    recommendationinfo,
    paginations
  },
  ready () {
    this.loadJobOffer()
    bus.$on('pagination:change', this.loadJobOffer)
  },
  destroyed () {
    bus.$off('pagination:change')
  },
  methods: {
    loadJobOffer (result) {
      console.info('result', result)
      if (result instanceof Object) this.pagination = result
      var vm = this
      connector.apiCall({
        limit: this.pagination.limit,
        page: this.pagination.currentPage,
        state: ['pushed']
      }, '/dashboard/joboffers', 'GET', function (error, response, header) {
        if (!error) {
          vm.jobOffers = response
          vm.pagination.total = parseInt(connector.parse(header).total)
        }
      })
    },
    showApplication (id) {
      let item = this.jobOffers[id]
      if (!('currentView' in item)) this.jobOffers.$set(id, Object.assign({}, item, { currentView: 'applications' }))
      else if (!item.currentView || item.currentView == 'recommendations') item.currentView = 'applications'
      else item.currentView = null
    },
    gotoCompany (company) {
      var id = company.slug ? company.slug : company.uuid
      window.location.replace(window.location.origin + '/#!/company/' + id)
    },
    viewDetail (joboffer) {
      var jobId = joboffer.slug ? joboffer.slug : joboffer.uuid
      window.location.replace(window.location.origin + '/#!/joboffer/' + jobId)
    }
  }
}
</script>
