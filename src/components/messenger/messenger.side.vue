<style lang="less" scoped>
.open>.dropdown-menu {
    display: block;
}
.slide-transition {
    transition: all .3s ease;
    overflow: hidden;
    animation: slideInRight 300ms ease;
}
.slide-enter,
.slide-leave {
    animation: slideOutRight 3000ms ease;
}
@keyframes slideInRight {
    from {
        transform: translate3d(100%, 0, 0);
        visibility: visible;
    }
    to {
        transform: translate3d(0, 0, 0);
    }
}
@keyframes slideOutRight {
    from {
        transform: translate3d(0, 0, 0);
    }
    to {
        transform: translate3d(100%, 0, 0);
        visibility: hidden;
    }
}
.close-btn {
    transform: scaleY(0.7) scaleX(0.7) ;
    padding: 0;
    position: fixed;
    right: 14px;
    top: 14px;
}
.chat-side {
    position: fixed;
    bottom: 0;
    right: 0;
    top: 0; //76px;
    z-index: 1000;
    width: 550px;
    .arrow_box{
      width: 80%;
    	border: 1px solid #CACACA;
      border-radius: 5px;
    }
    .arrow_box:before {
    	border-left-color: #CACACA;
    }
    .rc-container {
        .cs-content {
            // max-width: 1120px;
            max-width: 550px;
            width: 100%;
            background: white;
            height: 100%;
            right: 0;
            position: absolute;
            overflow-y: hidden;
            background: white;
            .close-btn {
                transform: scaleY(0.7) scaleX(0.7) ;
                padding: 0;
                position: fixed;
                right: 14px;
                top: 14px;
            }
        }
    }
    .messages-container {
        overflow-y: scroll;
        height: 90%;
        .message-time {
          float: right;
          position: relative;
          top: 24px;
        }
    }
    .message-input-block {
        min-height: 60px;
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
        display: block;
        background: white;
        .message-send-btn {
            border-radius: 0 !important;
            position: relative;
            top: 9px;
        }
    }
}
</style>

<template>
  <div v-show="showme" >
    <div class="chat-side z-depth-3" transition="slide">
      <div class="rc-container fx-row fx-space-between">
        <section class="cs-content border-left p-m">
          <a  @click="hideCard" class="btn-floating close-btn btn waves-effect waves-light red pull-right"><i class="material-icons md-18">&#xE14C;</i></a>
          <div class="messages-container">
            <div class="message m-t-lg" v-for="item in chatData.messages" track-by="$index">
              <div class="pull-right m-r-lg">
                <img :src="getUserImageLink(item.owner)  " class="user-image circle size-32">
              </div>
              <div class="arrow_box p-t-lg p-b-lg p-l-sm p-r-sm">
                 <b>{{ownerName(item.owner)}}</b>: {{item.content}}
                <span class="small-font message-time">{{item.timestamp | time}}</span>
             </div>
            </div>
          </div>
          <form class="col s12 message-input-block" v-on:submit.prevent="sendMessage()">
            <hr>
            <div class="row" flex>
              <input v-model="messageToSend" type="search" class="col s11" v-bind:disabled="chatData.state === 'locked'" v-bind:placeholder="chatData.state === 'locked' ? 'The chat islocked by the responsible :(' : 'Type your message ...'">
              <button class="btn message-send-btn col s1" type="button" v-on:keyup.enter="sendMessage()" :class="{'disabled': chatData.state === 'locked'}" v-on:click="sendMessage()">
                <i style="color: #FFFFFF" class="material-icons">&#xE163;</i>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
require('style/common/speech.bubble.css')
// var connector = require('services/connect.js')
var bus = require('services/bus')
let moment = require('moment')
// var status = require('shared/dropdown.status.vue')
// import {getRecommendationIds} from 'store/joboffer/getters.joboffer'

import {sendMsg, loadChat, unloadChat, updateMsgs, messageRead, loadChatList, setConnectedUser} from 'store/messenger/actions.messenger'
import {isReady, chatData, chatId, userId, userUUID} from 'store/messenger/getters.messenger'

module.exports = {
  vuex: {
    actions: {
      sendMsg,
      loadChat,
      unloadChat,
      updateMsgs,
      messageRead,
      loadChatList,
      setConnectedUser
    },
    getters: {
      isReady: isReady,
      chatData: chatData,
      chatId: chatId,
      userId: userId,
      userUUID: userUUID
    }
  },
  data () {
    return {
      condidate: null,
      showme: false,
      isToggled: false,
      recomId: null,
      details: null,
      jobId: null,
      editable: false,
      messageToSend: ''
    }
  },
  // props: {
  //   list: {
  //     type: Array,
  //     require: true
  //   }
  // },
  ready () {
    let vm = this
    // this.jobId = this.$route.params.jobId
    bus.$on('recommended:show-chat', this.showCard)
    // bus.$on('joboffer:rec-state-changed', (data) => this.details.historyable.$set(this.details.historyable.length, data))
    bus.$on('messenger:new-messages', vm.updateMessages)
    vm.setConnectedUser()
  },
  destroyed () {
    let vm = this
    vm.unloadChat()
    bus.$off('recommended:show-chat')
    // bus.$off('joboffer:rec-state-changed')
  },
  // components: {
  //   status: status
  // },
  filters: {
    time (timestamp) {
      let today = moment()
      let messageTime = moment(timestamp)
      if (today.diff(messageTime, 'days') > 0) return messageTime.format('ddd Do MMM YYYY, HH:mm')
      else return messageTime.format('HH:mm')
    }
  },
  methods: {
    showCard (application, chatId) {
      let vm = this
      vm.unloadChat()
      vm.loadChat(chatId)
      .catch((err) => console.error(err))
      .then((o) => {
        vm.updateMsgs(o)
        vm.updateScroll(0)
      })
      .catch((err) => console.error(err))
      .then((o) => {
        if (chatId) {
          vm.messageRead(chatId)
        }
        return 0
      })
      .catch((err) => console.error(err))
      vm.messageRead(vm.chatId)
      this.jobId = application.joboffer_id
      this.showme = true
      this.recomId = application.id
      // this.getRecommend(application.id)
      this.editable = false
      window.$('body').css('overflow', 'hidden')
    },
    hideCard (argument) {
      // this.condidate = null
      this.details = null
      this.showme = false
      window.$('body').css('overflow', '')
      // bus.$off('messenger:new-messages')
    },
    toggle () {
      this.isToggled = !this.isToggled
    },
    // getRecommend (_recomId_) {
    //   let vm = this
    //   let jobId = this.jobId
    //   connector.apiAsync('GET', '/dashboard/joboffers/' + jobId + '/recommendations/' + _recomId_)
    //   .then((res) => {
    //     vm.details = res
    //     vm.condidate = res.target
    //   })
    // },
    gotoProfile (condidate) {
      var id = condidate.slug ? condidate.slug : condidate.uuid
      this.$router.go({
        name: 'profile',
        params: {id}
      })
    },
    getUserImageLink (id) {
      let vm = this
      return vm.chatData.participants[id].img
    },
    ownerName (uuid) {
      let vm = this
      return vm.chatData.participants[uuid].name
    },
    sendMessage () {
      let vm = this
      if (!vm.messageToSend) return vm.reset()
      vm.sendMsg(vm.chatId, vm.messageToSend, vm.chatData.participants)
      vm.updateScroll(800)
      vm.loadChatList()
    },
    reset () {
      let vm = this
      vm.messageToSend = ''
    },
    updateScroll (easeTime) {
      window.$('.messages-container').animate({
        scrollTop: window.$('.messages-container')[0].scrollHeight
      }, easeTime, 'swing')
    },
    updateMessages (o) {
      let vm = this
      if (vm.showme) {
        vm.reset()
        vm.updateMsgs(o)
        vm.updateScroll(800)
        vm.messageRead(vm.chatId)
      }
    }
  }
}

</script>
