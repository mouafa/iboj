<template>
  <div class="m-l-xs ">
    <div class="font-light font-uppercase border-bottom p-sm">
      <i class="fa fa-trash-o"></i>
      <span>Draft</span>
    </div>
    <div class="m-l-lg " v-if="jobOffers && jobOffers.length">
      <section class="bg-white">

        <div track-by="$index" v-for="item in jobOffers">
          <div class="m-b-xs font-8 p-t-xs">
            <div class="panel-body m-none p-none x-row fx-space-between-center row">
              <div class="col s8">
                <section class="fx-row fx-start-center p-xs m-l-md">
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
              </div>
              <div class="col s3 offset-s1 pull-right">
                <div>
                  <span @click="viewDetail(item)" class="text-primary hand " v-if="item.id">
                    <span class="capital middle" v-ii18n="detailLbl">View Details</span>
                    <i class="material-icons ">&#xE5CC;</i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <pagination :pagination="pagination"></pagination>

    </div>
    <section class="fx-col fx-start-center placeholder" v-else>
      <i class="material-icons symbol">&#xE85F;</i>
      <p class="m-none capital">You don't have any joboffer in draft yet</p>
    </section>
  </div>
</template>

<script>
var connector = require('services/connect.js')
var pagination = require('shared/pagination.vue')
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
      },
      listMe: false,
      currentId: null
    }
  },
  ready () {
    bus.$on('pagination:change', this.loadJobOffer)
  },
  destroyed () {
    bus.$off('pagination:change')
  },
  components: {
    pagination
  },
  created () {
    this.loadJobOffer()
    var vm = this
    this.clickOut = function (event) {
      if ($(event.target).closest('#drop-down').length) return true
      vm.showmenu(null)
    }
  },
  methods: {
    loadJobOffer (result) {
      if (result) this.pagination = result
      var that = this
      connector.apiCall({
        limit: this.pagination.limit,
        page: this.pagination.currentPage,
        state: ['staged']
      }, '/dashboard/joboffers', 'GET', function (error, response, header) {
        if (!error) {
          that.jobOffers = response
          that.pagination.total = parseInt(connector.parse(header).total)
        }
      })
    },
    viewDetail (joboffer) {
      var jobId = joboffer.slug ? joboffer.slug : joboffer.uuid
      window.location.replace(window.location.origin + '/#!/joboffer/' + jobId)
    },
    gotoCompany (company) {
      var id = company.slug ? company.slug : company.uuid
      window.location.replace(window.location.origin + '/#!/company/' + id)
    }
  }
}

</script>
