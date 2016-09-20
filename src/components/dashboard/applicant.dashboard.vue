<style>

.number {
  font-size: 14px;
}
</style>

<template>
<div  transition="fade-in"  >

  <div class="row m-none p-none m-t-lg col s12 m12 font-light">
    <div class="col s12 m12">
      <div class="col s12 m3 p-none ">
        <div class="card">
          <latest-messages></latest-messages>
        </div>
      </div>

      <div class="col s12 m3 p-none p-l-sm">
        <div class="card">
          <profile-views></profile-views>
        </div>
      </div>



      <div class="col s12 m3 p-none p-l-sm">
        <div class="card">
          <traffic-sources></traffic-sources>
        </div>
      </div>

      <div class="col s12 m3 p-none p-l-sm">
        <div class="card">
        <joboffer-views></joboffer-views>
        </div>
      </div>

    </div>





  </div>
  <div class="col s12 m12 p-none">
    <div  >
      <div class="center">
        <h4 class="m-xs p-none font-1-5">View Your Jobs As</h4>
        <div class="switch">
            <label>
              <span class="font-1-5 font-light">Applicant</span>
              <input v-model="isRecuiter" type="checkbox">
              <span class="lever"></span>
              <span class="font-1-5 font-light">Recruiter</span>
            </label>
          </div>
      </div>
      <applicant-joboffers v-if="!isRecuiter"></applicant-joboffers>
      <recruiter-joboffers v-if="isRecuiter"></recruiter-joboffers>
    </div>
  </div>

</div>
</template>

<script>
import latestMessages from 'messenger/slaves/latest.messenger.vue'
import profileViews from 'statistics/slaves/profile.statistics.vue'
import jobofferViews from 'statistics/slaves/joboffers.statistics.vue'
import trafficSources from 'statistics/slaves/traffic-sources.statistics.vue'
import applicantJoboffers from 'dashboard/slaves/applicant/joboffers.dashboard.vue'
import recruiterJoboffers from 'dashboard/slaves/recruiter/joboffers.dashboard.vue'
var Cookies = require('services/cookie')

module.exports = {
  data () {
    return {
      isRecuiter: false
    }
  },
  components: {
    latestMessages: latestMessages,
    trafficSources: trafficSources,
    profileViews: profileViews,
    jobofferViews: jobofferViews,
    applicantJoboffers: applicantJoboffers,
    recruiterJoboffers: recruiterJoboffers,
    Cookies: Cookies
  },
  ready () {
    let vm = this
    this.isRecuiter = Cookies.get('isrecuiter') == 'true'
    vm.$watch('isRecuiter', (oldVal, newVal) => {
      Cookies.set('isrecuiter', vm.isRecuiter)
      // if (vm.isRecuiter === true) vm.$router.go('/recruiter')
    })
  }
}
</script>
