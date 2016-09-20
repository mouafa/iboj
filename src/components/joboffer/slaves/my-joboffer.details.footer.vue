<style lang="less" scoped>
// .jd-rec-list{
//    max-height: 430px;
//    min-height: 200px;
//    overflow: hidden;
//    position: relative;
//    padding-bottom: 40px;
//    transition: 300ms;
//
//    &.__expand{
//      max-height: 1000px;
//    }
// }
.-show-more{
 position: relative;
 span{
   position: absolute;
   right: 0;
   bottom: -20px;
 }
}
</style>
<template>
  <div class="job-detail jd-section p-xs">

    <section class="fx-row m-b-sm fx-start-center">
      <div class="capital w-min-50">
          <span class="font-1-2 font-uppercase font-light" v-ii18n="applications">applications</span>
          <span v-show="appliedIds.length" class="bg-blue circle p-xs   p-t-xs p-b-xs m-l-sm">
            <span class="text-white">{{filtredIds.length}}</span>
          </span>
      </div>

      <div v-if="appliedIds.length" class="p-none capital fx-row fx-start-center" flex>
  			 <label class="m-r-sm">Filter by</label>
          <select v-model="filterBy" class="browser-default capital" flex>
              <option v-for="option in filterOptions" :value="option.value">{{option.name}}</option>
          </select>
      </div>

    </section>

    <section class="jd-rec-list">
      <div v-show="activetab=='app'"><applications :filter-by="filterBy" v-ref:applicationscomp></applications></div>
    </section>
    <div  v-if="page <= numberOfPage" @click="showMore" class="hand -show-more">
      <span transition="fadeIn"><i class="material-icons">&#xE313;</i>show more</span>
    </div>
  </div>
</template>

<script>
var applications = require('./all-applications.list.vue')
import {getAppliedIds, numberOfApplication} from 'store/joboffer/getters.joboffer'
import {loadJobofferApplications} from 'store/joboffer/actions.joboffer'

module.exports = {
  vuex: {
    actions: {
      loadJobofferApplications
    },
    getters: {
      appliedIds: getAppliedIds,
      total: numberOfApplication
    }
  },
  components: {
    applications
  },
  props: {
    jobId: {
      type: Number
    }
  },
  data () {
    return {
      activetab: 'app',
      page: 2,
      filterBy: '',
      filterOptions: [{ name: 'all', value: '' },
                      { name: 'pending', value: 'pending' },
                      { name: 'pushed', value: 'pushed' },
                      { name: 'rejected', value: 'rejected' },
                      { name: 'hired', value: 'hired' },
                      { name: 'phone interview', value: 'phone interview' },
                      { name: 'office interview', value: 'office interview' }]
    }
  },
  computed: {
    filtredIds () {
      if (this.$refs.applicationscomp) return this.$refs.applicationscomp.filtredList
    },
    numberOfPage () {
      return this.total % 100 == 0 ? Math.trunc(this.total / 100) : Math.trunc(this.total / 100) + 1
    }
  },
  methods: {
    showMore () {
      console.log(this.numberOfPage)
      let vm = this
      this.loadJobofferApplications(this.jobId, {page: this.page, limit: 100})
      .then((res) => {
        vm.page++
      })
    }
  }
}

</script>
