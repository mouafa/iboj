<template>
  <div>
    <div class=" p-none font-9">
      <apply></apply>
      <confirm></confirm>
      <job-detail>
        <!-- component changes when vm.currentview changes! -->
      </job-detail>
    </div>
  </div>
</template>

<script>
var jobDetail = require('./slaves/joboffer.details.container.vue')
var myjobDetail = require('./slaves/my.joboffer.details.container.vue')
var apply = require('../home/slaves/apply.container.vue')
import {getJobofferData, isReady, isMine} from 'store/joboffer/getters.joboffer'
var confirm = require('shared/popup.confirm.vue')
import {loadJoboffer, resetJoboffer, setReferrer, loadJobofferApplications} from 'store/joboffer/actions.joboffer'
import {loadCompany, loadCompanyJoboffers, unloadCompany} from 'store/company/actions.company'

module.exports = {
  vuex: {
    getters: {
      isMine,
      isReady
    },
    actions: {
      loadJoboffer,
      resetJoboffer,
      setReferrer,
      loadJobofferApplications,
      loadCompany,
      loadCompanyJoboffers,
      unloadCompany
    }
  },
  components: {
    joboffer: getJobofferData,
    jobDetail,
    apply,
    confirm,
    myjobDetail
  },
  route: {
    data ({ to }) {
      var vm = this
      // if (!jobId) return vm.$router.go('/404')
      this.resetJoboffer(true) // force flushing
      this.setReferrer(document.referrer)
      this.loadJoboffer(to.params.jobId, true) // block normal flushing
      .then((res) => {
        if (res.state == 'aborted') vm.$router.go('/404')
        var id = res.company.slug ? res.company.slug : res.company.uuid
        vm.loadCompany(id)
        vm.loadCompanyJoboffers(res.company.id)
        // vm.loadJobofferApplications(res.id, {page: 1, limit: 100})
      })
      .catch(() => vm.$router.go('/404'))
    }
  },
  computed: {
  },
  destroyed () {
    this.resetJoboffer(true) // force flushing
    this.unloadCompany()
  },
  data: function () {
    return {
      title: this.joboffer ? this.joboffer.title : 'Job Offer details'
    }
  },
  head: {
    title: function () {
      return {
        // To use "this" in the component, it is necessary to return the object through a function
        inner: this.title
      }
    },
    // Examples of link tags
    link: {
      canonical: {
        href: 'http://example.com/#!/contact/'
      }
    }
  }
}

</script>
