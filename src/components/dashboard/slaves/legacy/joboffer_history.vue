<template>
    <div class="bg-white m-l-xs">
        <div class="font-light font-uppercase p-sm">
            <i class="fa fa-bars" aria-hidden="true"></i>
            <span>jobOffer history</span>
        </div>
        <div v-if="historyList.length" class="hpanel p-none">
            <div class="panel-body m-none p-none ">
                <section class="cd-timeline cd-container m-sm ">
                    <table class="table m-t-sm font-9">
                        <tr v-for="item in historyList">
                          <td></td>
                            <td>
                              <img :src="item.company.logo  " class="img-circle size-24 m-r-xs" alt="logo">
                              <div class="tooltip">
                                <span class='text-dot w-sm  m-t-xs'>{{item.title}}<span>
                                <span class="tooltiptext">{{item.title }}</span>
                              </div>
                    </td>
                    <td class='w-xs'>{{item.suspend_date | moment "DD-MM-YYYY" }}</td>
                    <td class='w-xs'><span class="label p-xxs" :class="labelClass[item.state]">{{item.state}}</span></td>
                    <td class='w-xs'><span v-if="item.id" class="text-primary hand" @click="duplicate(item.id)"><a><i class="material-icons md-14">&#xE3E0;</i>   <span class="capital" v-ii18n="duplicate">duplicate</span></a></td>
                    <td></td>
                        </tr>
                    </table>
                </section>
            </div>
        </div>
        <section v-else class="fx-col fx-start-center placeholder">
           <i class="material-icons symbol">&#xE85F;</i>
           <p class="m-none capital">You don't have any closed joboffer</p>
       </section>
    </div>
</template>
<script>
var connector = require('services/connect.js')
var pagination = require('shared/pagination.vue')
var bus = require('services/bus.js')
module.exports = {
  data: function () {
    return {
      error: '',
      historyList: [],
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
  props: {
    reload: {
      type: Boolean,
      default: false
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
  },
  methods: {
    duplicate (id) {
      $(window.location).attr('href', '/addjoboffer.html#!/' + id)
      if (this.reload) {
         window.location.reload()
      }
    },
    loadJobOffer (result) {
      if (result) this.pagination = result
      var that = this
      connector.apiCall({
        limit: this.pagination.limit,
        page: this.pagination.currentPage
      }, '/dashboard/joboffers/history', 'GET', function (error, response, header) {
        if (!error) {
          that.historyList = response
          that.pagination.total = parseInt(connector.parse(header).total)
        }
      })
    }
  }
}
</script>
