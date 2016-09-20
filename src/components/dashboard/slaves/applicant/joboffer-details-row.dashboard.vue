<style lang="less" scoped>
.joboffer-container {
  padding: 5px 15px 0 15px;
  margin: 0 0 2px 0;
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
      font-size: 2em;
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
  .application-state {
    text-transform: capitalize;
    font-size: 1em;
    color: #06A2CE;
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
}
</style>

<template>
<section class="joboffer-container hpanel" >
  <div class="row  valign-wrapper">
    <div class="col s4 fx-column valign font-1">
      <p class="fx title company">{{job.joboffer.company.name}}</p>
      <p class="fx title font-light">{{job.joboffer.title}}</p>
    </div>
    <div class="col s2 font-light valign joboffer-applications-count-container">
      <span class="joboffer-applications-count">{{job.totapp}}</span> Applications
    </div>
    <div class="col s2 font-light valign">
      <span class="application-state">{{job.state}}</span>
    </div>
    <div class="col s2 font-light font-1 valign p-none">
      <i class="material-icons md-14">hourglass_empty</i> {{job.created_at | moment "from" "now"}}
    </div>
    <div class="col s1 font-light font-1 valign messages-container">
      <i class="material-icons message-icon" @click="goToMessage()">mail_outline</i>
      <div v-if="isNotif" class="btn-circle btn-s bg-red text-white counter pos-ab"></div>
    </div>
    <div class="col s1 font-light font-1 valign job-state-container">
      <i class="material-icons go-to" @click="goToJoboffer()">keyboard_arrow_right</i>
      <!-- <span class="job-state">{{job.joboffer.state | jobType}}</span> -->
    </div>
  </div>
</section>
</template>

<script>
import {messagesToNotifyAbout} from 'store/messenger/getters.messenger'

import firebase from 'services/firebase-chat'

module.exports = {
  props: ['job'],
  vuex: {
    getters: {
      messagesToNotifyAbout: messagesToNotifyAbout
    }
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
      window.location = window.location.origin + '/#!/joboffer/' + (vm.job.joboffer.slug || vm.job.joboffer.uuid || vm.job.joboffer.id)
    },
    goToMessage () {
      window.location = window.location.origin + '/messenger.html#!/'
    },
    isThereChatNotif () {
      let vm = this
      return firebase.getChatOfJoboffer(vm.job.joboffer.id)
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
      messagesList.push('' + vm.job.joboffer.id + vm.job.joboffer.profile_id + vm.job.recommended)
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
