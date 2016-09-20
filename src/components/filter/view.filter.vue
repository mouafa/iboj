<style lang="less" scoped>
  .main-view{
    /* margin-top: 140px */
  }
</style>
<template>
  <section class="row main-view">

    <div class="col m3">
      <filter-container></filter-container>
    </div>

    <div class="col m7">
      <searchbox-container></searchbox-container>
      <infobar-container></infobar-container>
      <result-container></result-container>
      <pagination-container class="p-b-lg"></pagination-container>
    </div>
    <div v-if="isAuthed" class="col m2">
      <stats></stats>
    </div>
    <div v-if="!cond" class="col m2">
      <non-authed-stats></non-authed-stats>
    </div>

  </section>
</template>

<script>
var filterContainer = require('./slaves/filter.container')
var resultContainer = require('./slaves/result.container')
var searchboxContainer = require('./slaves/searchbox.container')
var infobarContainer = require('./slaves/infobar.container')
var paginationContainer = require('./slaves/pagination.container')
var nonAuthedStats = require('statistics/not-authed-stats.sidebar')
var stats = require('statistics/stats.sidebar')

import {loadAccount} from 'store/account/actions.account'
import {isAuthed} from 'store/account/getters.account'
import {loadJoboffers, loadFiltredJoboffers, watchUrlFilter} from 'store/filter/actions.filter'

module.exports = {
  vuex: {
    actions: {
      loadJoboffers,
      loadAccount,
      loadFiltredJoboffers,
      watchUrlFilter
    },
    getters: {
      isAuthed
    }
  },
  components: {
    stats,
    nonAuthedStats,
    filterContainer,
    searchboxContainer,
    resultContainer,
    infobarContainer,
    paginationContainer
  },
  data () {
    return {
      init: false,
      cond: false
    }
  },
  ready () {
    this.cond = true
    this.loadAccount().catch(() => (this.cond = false))
    this.getJobOffer()
    this.watchUrlFilter()
  },
  // route: {
  //   data () {
  //     console.info('route change')
  //     this.getJobOffer()
  //   }
  // },
  methods: {
    getJobOffer () {
      var vm = this
      var url = window.location.hash
      if (url.indexOf('#!/?q=') > -1) {
        if (!vm.init) {
          vm.loadJoboffers(undefined, 'ignoreResult').then(() => {
          vm.loadFiltredJoboffers()
          vm.init = true
          })
        } else {
          vm.loadFiltredJoboffers()
        }
      } else {
       vm.loadJoboffers().then(() => (vm.init = true))
     }
    }
  }
}
</script>
