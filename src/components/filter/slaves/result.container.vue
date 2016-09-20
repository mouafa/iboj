<template>
  <section class="row">
    <apply></apply>
    <share></share>
    <div class="p-none hpanel">
        <joboffer class="m-b-sm" v-for="item in joboffers" :data="item" :current="profile"></joboffer>
    </div>
  </section>
</template>

<script>
var joboffer = require('shared/joboffer-preview.vue')
var advancedFilter = require('shared/layout/advanced-filter.vue')
var share = require('home/slaves/share.vue')
var apply = require('home/slaves/apply.container.vue')

import {filterResult, isReady} from 'store/filter/getters.filter'
module.exports = {
  vuex: {
    getters: {
      joboffers: filterResult,
      isReady
    }
  },
  // data () {
  //   return {
  //     data: null,
  //     source: 'self',
  //     total: null
  //   }
  // },
  components: {
    joboffer,
    share,
    apply,
    advancedFilter
  }
}

</script>
