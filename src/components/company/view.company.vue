<template>

<div v-show="loaded" class="row" transition="fade-in" >

    <div class="m-none p-none col m5 ">
      <div class="m-l-xs" >
        <div class="hpanel profile-panel " id="custom-1">
          <div class="panel-body m-none p-none">
            <div class="panel-heading fx-row fx-space-between-center">
              <div class="m-l-md">

              </div>
            </div>

            <section class="p-sm">
              <div class="fx-row p-b-sm fx-start-center">
                  <div @click="uploadImage" :class="{'uploader' : isMine, 'progres' : loading}" class="cd-timeline-img size-64 company-logo">
                    <img :src="data.logo  " class="size-64 company-logo" alt="company logo"/>
                  </div>
                <div flex>
                  <span class="font-light font-1-5 p-l-sm text-light font-uppercase ">{{data.name}}</span>
                  <div v-if="data.url" class="font-8 m-t-xs m-l-sm"><a href="{{data.url}}" target="_blank"><i class="material-icons md-14">&#xE80B;</i> Website</a></div>
                </div>
              </div>

              <div class="p-b-sm fx-start-start" v-if="data.country || data.address || data.city || data.region || data.phone">
                <div v-if="data.country || data.address || data.city || data.region">
                    <i class="material-icons md-14">&#xE0C8;</i>
                    <span class="m-r-xs capital" v-if="data.address">{{data.address}},</span>
                    <span class="m-r-xs capital" v-if="data.city">{{data.city}},</span>
                    <span class="m-r-xs capital" v-if="data.zipcode">{{data.zipcode}},</span>
                    <span class="m-r-xs capital" v-if="data.region">{{data.region}},</span>
                    <span class="m-r-xs capital" v-if="data.country">{{data.country}}.</span>
                </div>
                <div v-if="data.phone">
                    <i class="material-icons md-14">&#xE0CD;</i>
                    <span class="m-r-xs capital" >{{data.phone}}</span>
                </div>
              </div>

              <div class="font-9 font-light word-wrapper">
                {{{data.description}}}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    <div class="profile-details p-l-sm col m7 p-none m-none p-b-lg">
      <div class="p-none p-r-xs hpanel p-b-lg">
        <h6 class="font-light font-1-2">Jobs By {{data.name}}</h6>
        <joboffer v-if="joboffers.length" class="m-b-sm" v-for="item in joboffers" :data="item" :current="profile"></joboffer>
        <div v-if="!joboffers.length" class="panel-body p-sm capital">no available jobs offers.</div>
      </div>
    </div>
</div>

</template>

<script>
import joboffer from 'shared/joboffer-preview.vue'

import {loadCompany, loadCompanyJoboffers, unloadCompany, updateCompanyImg} from 'store/company/actions.company'
import {isReady, companyData, companyJoboffers} from 'store/company/getters.company'
import {accountData} from 'store/account/getters.account'

module.exports = {
  vuex: {
    actions: {
      loadCompany,
      loadCompanyJoboffers,
      unloadCompany,
      updateCompanyImg
    },
    getters: {
      loaded: isReady,
      data: companyData,
      joboffers: companyJoboffers,
      account: accountData
    }
  },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    isMine () {
      if (this.account.id === this.data.created_by) return true
      else return false
    }
   },
  components: {
    joboffer
  },
  route: {
    data ({to: to}) {
      var vm = this
      let _id = to.params.id
      if (this.loaded == _id) return
      this.unloadCompany()
      this.loadCompany(_id)
      .then((res) => {
        this.loadCompanyJoboffers(res.id)
        .then(() => {})
      })
      .catch(() => vm.$router.go('/404'))
    }
  },
  methods: {
    uploadImage () {
      if (!this.isMine) return
      var vm = this
      vm.loading = true
      window. photolia.openDialog(null, {
        imagesOnly: true,
        crop: '300x300'
      })
      .done((file) => file.done((fileInfo) => vm.upload(fileInfo))
                          .fail((error, fileInfo) => vm.upload(null, error)))
      .fail(() => (vm.loading = false))
    },
    upload (fileInfo, error) {
      let vm = this
      if (fileInfo) {
        vm.updateCompanyImg(fileInfo.cdnUrl, vm.data.id)
      }
      vm.loading = false
    }
  }
}

</script>
