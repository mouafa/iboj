<style lang="less" scoped>
.joboffer-container {
  padding: 5px 15px 0 15px;
  margin: 0;
  background-color: rgba(255,255,255, .7);
  width: 100%;
  .title {
    margin: 0;
  }
  .go-to {
    cursor: pointer;
  }
  .title.company {
    color: #06A2CE;
  }
  .joboffer-applications-count-container {
    position: relative;
    bottom: 3px;
    .joboffer-applications-count {
      font-size: 2.3em;
    }
  }
  .joboffer-collaborators {
    margin: auto;
  }
  .job-state-container {
    height: 100%;
    text-align: right;
    vertical-align: middle;
    .job-state {
      text-transform: uppercase;
    }
  }
  .messages-container {
    position: relative;
    .message-icon {
      cursor: pointer;
    }
    .counter {
      position: absolute;
      left: 26px;
      top: -3px;
    }
    .btn-cercle {
      border-radius: 50%;
    }
  }
  .divider {
    border-top: 1px solid #EEEEEE;
    border-bottom: none;
    border-right: none;
    border-left: none;
  }
}
</style>

<template>
<section class="joboffer-container m-b-xs p-xs hpanel">
  <div class="row  valign-wrapper  ">
    <div class="col s4 fx-column valign font-1">
      <p class="fx title company">{{job.company.name}}</p>
      <p class="fx title font-light">{{job.title}}</p>
    </div>
    <div class="col s2 font-light valign joboffer-applications-count-container">
      <span class="joboffer-applications-count">{{job.applications.length}}</span> Applications
    </div>
    <div class="col s2 font-light valign">
      <collaborators-images :collaborators="job.collaborators" class="joboffer-collaborators"></collaborators-images>
    </div>
    <div class="col m2 s2 font-light font-1 valign p-none">
      <i class="material-icons md-14">hourglass_empty</i> {{job.created_at | moment "from" "now"}}
    </div>
    <div class="col s1 m1 valign">
      <i class="material-icons message-icon m-r-sm light600" @click="goToJoboffer()">mail_outline</i>
      <div v-if="isNotif" class="btn-circle btn-s bg-red text-white counter pos-ab"></div>
      <a href="addjoboffer.html#!/{{job.id}}">Edit<a>
    </div>
    <div class="col s1 m1 font-light font-1 valign job-state-container">
      <i v-if="job.state !== 'concluded' && job.state !== 'aborted'" class="material-icons go-to" @click="goToJoboffer()">keyboard_arrow_right</i>
      <i v-else class="text-warning">Closed</i>
      <!-- <span class="job-state">{{job.state | jobType}}</span> -->
    </div>
  </div>
</section>
</template>

<script>
import collaboratorsImages from 'dashboard/slaves/recruiter/collaborators-images.dashboard.vue'

import {messagesToNotifyAbout} from 'store/messenger/getters.messenger'

import firebase from 'services/firebase-chat'

module.exports = {
  props: ['job'],
  vuex: {
    getters: {
      messagesToNotifyAbout: messagesToNotifyAbout
    }
  },
  components: {
    collaboratorsImages: collaboratorsImages
  },
  data () {
    let vm = this
    return {
      isNotif: false,
      dummy: vm.isThereChatNotif()
    }
  },
  ready () {
    let vm = this
    vm.$watch('messagesToNotifyAbout', (newVal, oldVal) => {
      vm.setNotification(newVal)
    })
  },
  methods: {
    goToJoboffer () {
      let vm = this
      window.location = window.location.origin + '/#!/myjoboffer/' + (vm.job.slug || vm.job.uuid)
    },
    isThereChatNotif () {
      let vm = this
      return firebase.getChatOfJoboffer(vm.job.id)
      .then((res) => {
        if (!res) return false
        let chats = Object.keys(res)
        if (!chats.length) return false
        chats.forEach((chat) => {
          return firebase.checkNotificationForJoboffer(chat)
          .then((res) => {
            if (!res) return false
            vm.isNotif = true
          })
        })
      })
    },
    setNotification (notifsArray) {
      let vm = this
      let messagesList = []
      vm.job.applications.forEach((application) => {
        messagesList.push('' + vm.job.id + vm.job.responsible.id + application.recommended)
      })
      let x = false
      x = messagesList.some((msg) => {
        return notifsArray.indexOf(msg) > -1
      })
      vm.isNotif = x
    }
  },
  filters: {
    jobType (val) {
      let res = val
      switch (val) {
        case 'staged':
          res = 'draft'
          break
        case 'pushed':
          res = 'open'
          break
        case 'concluded':
        case 'aborted':
          res = 'closed'
          break
      }
      return res
    }
  }
}
</script>
