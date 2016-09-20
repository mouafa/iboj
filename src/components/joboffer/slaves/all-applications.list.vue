<style lang="less" scoped>
.messages-container {
  position: relative;
  .counter {
    position: absolute;
    left: 10px;
    top: -3px;
    width: 10px;
    min-width: 10px;
    height: 10px;
    border-radius: 5px;
  }
}
</style>

<template>
<section>
  <div v-if="applicationList.length" class="table-responsive recomm-list jd-rec-list">
          <div v-for="item in filtredList" class="border m-b-sm ">
            <div class="row m-t-xxs bg-light" >

                <div class="col m7 row p-sm bg-light fx-row fx-start-center" >
                  <div class="col m3">
                    <img  @click="gotoProfile(item.target)" :src="item.target.img  " class=" hand m-t-n-sm  user-image circle size-48 hand">
                  </div>
                  <div class="col m9 p-none m-t-n-sm">
                    <span @click="gotoProfile(item.target)"  class="m-none text-info font-1-2 font-light hand">{{item.target.firstname}} {{item.target.lastname}}</span>
                    <div class="m-none">{{item.target.title}}</div>
                  </div>
                </div>

                <div class="pull-right m-t-xs m-r-xs">
                  <status class=" border" :recom-id="item.id" :recommendation="item" ></status>
                </div>
            </div>
                <div class="row  m-t-sm p-sm bg-light-soft" >
                  <span @click="showChat(item.target)" class="hand col m3 messages-container">
                      <i class="material-icons md-18 blue600">&#xE0B7;</i>
                      <span class="capital" v-ii18n="addNewSection">Chat</span>
                      <div v-if="item.notif" class="btn-circle btn-s bg-red text-white counter pos-ab"></div>
                   </span>

                   <span @click="showCard(item)" class="hand font-1-1 col m4">
                       <i class="material-icons md-18 blue600">&#xE8B8;</i>
                       <span class="capital" v-ii18n="addNewSection">Manage Application</span>
                    </span>
                </div>
          </div>
    </div>
    <section v-else class="fx-col fx-start-center placeholder m-t-sm">
      <i  class="material-icons symbol">&#xE85F;</i>
      <p  class="m-none capital" v-ii18n="">No one applied yet</p>
    </section>
</section>
</template>

<script>
var bus = require('services/bus')
var status = require('shared/dropdown.status.vue')
import {getJobofferData, isReady, getApplicationList} from 'store/joboffer/getters.joboffer'
import {updateStatus, addNewMessagesNotifications} from 'store/joboffer/actions.joboffer'
import {messagesToNotifyAbout} from 'store/messenger/getters.messenger'

import firebase from 'services/firebase-chat'

module.exports = {
  vuex: {
    actions: {
      updateStatus,
      addNewMessagesNotifications
    },
    getters: {
      isReady,
      getJobofferData: getJobofferData,
      messagesToNotifyAbout: messagesToNotifyAbout,
      applicationList: getApplicationList
    }
  },
  props: {
    filterBy: String
  },
  components: {
    status: status
  },
  computed: {
    filtredList () {
      var vm = this
      if (vm.filterBy) return vm.applicationList.filter((i) => i.state === vm.filterBy)
      else return vm.applicationList
    },
    noapplicants () {
      return this.isReady && this.applicationList.length == 0
    }
  },
  ready () {
    let vm = this
    let jobofferData = JSON.parse(JSON.stringify(vm.getJobofferData))
    let query = this.$route.query
    if (query.apply) {
      bus.$emit('recommended:show-side', {'joboffer_id': jobofferData.id, 'id': query.apply})
    }
    bus.$on('application:status-update', vm.updateStatus)
    vm.$watch('messagesToNotifyAbout', (newVal, oldVal) => {
      vm.setNotifications(newVal)
    })
  },
  methods: {
    showCard (application) {
      bus.$emit('recommended:show-side', application)
    },
    // showApplication (application) {
    //   bus.$emit('application:show-side', application)
    // },
    showChat (application) {
      let vm = this
      let jobofferData = JSON.parse(JSON.stringify(vm.getJobofferData))
      let candidate = JSON.parse(JSON.stringify(application))
      firebase.findOrCreateGroupChat(jobofferData, candidate)
      .then((res) => {
        let chatId = res
        bus.$emit('recommended:show-chat', application, chatId)
      })
      .catch((err) => console.error(err))
    },
    gotoProfile (condidate) {
      let id = condidate.slug ? condidate.slug : condidate.uuid
      window.location = window.location.origin + '/profile.html#!/' + id
    },
    setNotifications (notifsArray) {
      let vm = this
      let a = notifsArray.map((notif) => {
        let t = null
        vm.applicationList.forEach((application) => {
          if ('' + application.joboffer_id + vm.getJobofferData.responsible.id + application.recommended === notif) {
            t = application.recommended
          }
        })
        return t
      })
      vm.addNewMessagesNotifications(a)
    }
  }
}

</script>
