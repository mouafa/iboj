<template>
<section class="row">
  <div class="col m2">
    Advanced Filter
    <advanced-filter></advanced-filter>
  </div>

  <div class="col m8">
    <apply></apply>
    <share></share>
    <div class="p-none p-r-xs hpanel  p-b-lg">
        <joboffer class="m-b-sm" v-for="item in joboffers" :data="item" :current="profile"></joboffer>
    </div>
  </div>
  <div class="col m2"></div>
</section>
</template>

<script>
var joboffer = require('shared/joboffer-preview.vue')
var advancedFilter = require('shared/layout/advanced-filter.vue')
var share = require('./slaves/share.vue')
var apply = require('./slaves/apply.container.vue')

import {loadJoboffers} from 'store/timeline/actions.timeline'
import {timelineData, isReady} from 'store/timeline/getters.timeline'
module.exports = {
  vuex: {
    actions: {
      loadJoboffers
    },
    getters: {
      joboffers: timelineData,
      isReady
    }
  },
  data () {
    return {
      type: ['public', 'private'],
      data: null,
      source: 'self',
      total: null
    }
  },
  components: {
    joboffer,
    share,
    apply,
    advancedFilter
  },
  ready () {
    var vm = this
    if (!vm.isReady) this.getJobOffer()
    $(window).scroll(() => {
      // console.info('here')
      if (($(window).scrollTop() + $(window).height() + 1) >= $(document).height()) {
        // console.info('here 2')
        vm.getJobOffer()
      }
    })
  },
  methods: {
    getJobOffer () {
      this.loadJoboffers(this.type)
    }
  }
}

</script>
