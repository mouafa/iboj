<style lang="less" scoped>
.fixed {
  position: fixed;
  top: 134px;
  bottom: 150px;
  left: 150px;
  right: 100px;
}
.full-height {
  height: 100%;
}
.enlcosing {
  min-width: 895px;
}
.from-right {
  float: right;
  text-align: right;
}
.chat-block {
  // background-color: #FFFFFF;
  padding-top: 5px;
  .scrollable-block {
    background-color: rgba(255, 255, 255, 0.4);
    height: 90%;
  }
}
.scrollable-block {
  overflow-y: auto;
  overflow-x: auto;
  padding-right: 5px;
}
.clearfix {
  display: inline-block;
  width: 100%;
}
.chat-text {
  padding: 10px;
  border-radius: 15px;
  max-width: 550px;
  display: inline-block;
}
.self-chat-text-color {
  background-color: #00BCD4;
  color: #FFFFFF;
}
.other-chat-text-color {
  background-color: #EEEEEE;
  color: #000000;
}
.applicant-chat-text-color {
  background-color: #F5F5F5;
  color: #000000;
}
.chat-image-with-name {
  position: relative;
  top: 20px;
}
.small-margin {
  margin: 0 5px;
}

.message-send-btn {
	border-radius: 0 !important;
	position: relative;
  top: 9px;
}
.collection.col.s3 {
  margin: 0 !important;
  border-right: 1px solid #E0E0E0;
  padding: 0;
}
.non-read-background {
  background-color: #F0F0FF !important;
}
.collection-item.avatar:hover {
  cursor: pointer;
}
.small-font {
  font-size: 11px;
}
.lock-icon {
  position: absolute;
  right: 5px;
  top: 10px;
  :hover {
    color: #FF530D;
  };
  .lock-icon-locked {
    color: #FF530D;
  }
}
.open-job-offer {
  position: absolute;
  right: 5px;
  bottom: 10px;
  :active {
    color: #FF530D;
  };
}
.message-name {
  color: #26a69a;
  font-size: 16px;
  padding-top: 0px;
  padding-bottom: 0px;
}
.message-title {
  /*padding-left: 16px;*/
}
.message-time {
  color: #AAAAAA;
  /*padding-left: 16px;*/
}
.input-message{
  broder:none;
}
</style>

<template>
<section transition="fade-in" class="row fixed">
    <loading v-if="loading"></loading>
    <div class="row full-height enlcosing" v-else>
      <no-messages v-if="!messagesList.length"></no-messages>
      <div class="row full-height" v-else>
        <ul class="collection col s3 full-height scrollable-block">
          <li class="collection-item avatar" :class="{'non-read-background': isMessageNonRead(item.id)}" v-for="item in messagesList | orderBy orderMessagesByTime" track-by="$index" @click="openMessage(item)">
            <img v-if="item.applicant.uuid != userUUID" :src="item.applicant.img ? item.applicant.img   : ''" alt="" class="user-image circle">
            <img v-else :src="item.company.logo ? item.company.logo   : ''" alt="" class="user-image circle">
            <span v-if="item.applicant.uuid != userUUID" class="message-name">{{item.applicant.name}}</span>
            <span v-else class="message-name">{{item.company.name}}</span>
            <p class="message-title">{{item.title}}</p>
            <p class="message-time">{{item.lastMessageTime | messageTime}}</p>
            <span class="lock-icon" v-if="isResponsible(item.responsible.uuid)" @click="toggleLockChat(item)" v-show="isReady">
              <i v-if="item.state === 'open'" class="material-icons md-14">&#xE898;</i>
              <i v-else class="material-icons lock-icon-locked md-14">&#xE899;</i>
            </span>
            <a class="open-job-offer" :href="item.jobofferURL" target="_blank" v-show="isReady">
              <i class="material-icons md-14">&#xE89E;</i>
            </a>
          </li>
        </ul>
        <div class="col s9 chat-block full-height" v-show="!isReady">
            <loading></loading>
        </div>
        <div class="col s8 chat-block full-height m-l-sm" v-show="isReady">
            <div class="scrollable-block" id="messages-block">
                <div class="clearfix" v-for="item in chatData.messages" track-by="$index">
                    <div v-if="item.owner == userUUID" class="fx-row from-right">
                        <div class="row fx">
                            <span class="small-font col s12 from-right" v-if="isDifferentOwner(item.owner, $index)">{{ownerName(item.owner)}}</span>
                            <p class="m-none text-right self-chat-text-color chat-text">{{item.content}}</p>
                            <span class="small-font col s12">{{item.timestamp | time}}</span>
                        </div>
                        <img :src="getUserImageLink(item.owner) ? getUserImageLink(item.owner)   : ''" class="user-image circle size-32 fx-end small-margin chat-image-with-name" v-if="isDifferentOwner(item.owner, $index)">
                        <img :src="getUserImageLink(item.owner) ? getUserImageLink(item.owner)   : ''" class="user-image circle size-32 fx-end small-margin" v-else>
                    </div>
                    <div v-else class="fx-row">
                        <img :src="getUserImageLink(item.owner) ? getUserImageLink(item.owner)   : ''" class="user-image circle size-32 fx small-margin chat-image-with-name" v-if="isDifferentOwner(item.owner, $index)">
                        <img :src="getUserImageLink(item.owner) ? getUserImageLink(item.owner)   : ''" class="user-image circle size-32 fx small-margin" v-else>
                        <div class="row fx-end">
                            <span class="small-font col s12" v-if="isDifferentOwner(item.owner, $index)">{{ownerName(item.owner)}}</span>
                            <p v-if="isApplicant(item.owner)" class="m-none chat-text applicant-chat-text-color">{{item.content}}</p>
                            <p v-else class="m-none chat-text other-chat-text-color">{{item.content}}</p>
                            <span class="small-font col s12">{{item.timestamp | time}}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col s12 m-t-sm " v-on:submit.prevent="sendMessage()">
              <input class="input-message input-box" v-on:keyup.enter="sendMessage()" v-model="messageToSend"  v-bind:disabled="chatData.state === 'locked'" v-bind:placeholder="chatData.state === 'locked' ? 'The chat is locked by the responsible :(' : 'Type your message ...'">

            </div>
        </div>
      </div>
    </div>
</section>
</template>

<script>
var loading = require('./slaves/loading.messenger.vue')
var noMessages = require('./slaves/no-messages.messenger.vue')
var recomSide = require('../joboffer/slaves/recommended.side.vue')

import {loadChat, loadChatList, unloadChat, sendMsg, updateMsgs, setConnectedUser, messageRead, toggleLockChat} from 'store/messenger/actions.messenger'
import {isReady, chatData, messagesList, chatId, userId, userUUID, messagesToNotifyAbout} from 'store/messenger/getters.messenger'

var bus = require('services/bus')
let moment = require('moment')

module.exports = {
  vuex: {
    actions: {
      sendMsg,
      loadChat,
      toggleLockChat,
      unloadChat,
      updateMsgs,
      messageRead,
      loadChatList,
      setConnectedUser
    },
    getters: {
      isReady: isReady,
      chatData: chatData,
      messagesList: messagesList,
      chatId: chatId,
      userId: userId,
      userUUID: userUUID,
      messagesToNotifyAbout: messagesToNotifyAbout
    }
  },
  components: {
    loading: loading,
    noMessages: noMessages,
    recomSide: recomSide
  },
  data () {
    return {
      messageToSend: '',
      loading: true
    }
  },
  filters: {
    time (timestamp) {
      let today = moment()
      let messageTime = moment(timestamp)
      if (today.diff(messageTime, 'days') > 0) return messageTime.format('ddd Do MMM YYYY, HH:mm')
      else return messageTime.format('HH:mm')
    },
    messageTime (val) {
      return moment(val).format('ddd Do MMM YYYY, HH:mm')
    }
  },
  computed: {},
  ready () {
    let vm = this
    vm.loading = true
    bus.$on('messenger:new-messages', vm.updateMessages)
    vm.setConnectedUser()
    if (window.$('#app').hasClass('container')) window.$('#app').toggleClass('container')
  },
  methods: {
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
    updateMessages (o) {
      let vm = this
      vm.reset()
      vm.updateMsgs(o)
      vm.updateScroll(800)
      vm.messageRead(vm.chatId)
    },
    openMessage (message) {
      let vm = this
      vm.$router.go('/' + message.id)
    },
    getUserImageLink (id) {
      let vm = this
      return vm.chatData.participants[id].img
    },
    updateScroll (easeTime) {
      window.$('#messages-block').animate({
        scrollTop: window.$('#messages-block')[0].scrollHeight
      }, easeTime, 'swing')
    },
    isApplicant (uuid) {
      let vm = this
      return vm.chatData.applicant.uuid === uuid
    },
    isResponsible (uuid) {
      let vm = this
      return vm.userUUID === uuid
    },
    isMessageNonRead (chatId) {
      let vm = this
      return vm.messagesToNotifyAbout.indexOf(chatId) > -1
    },
    ownerName (uuid) {
      let vm = this
      return vm.chatData.participants[uuid].name
    },
    isDifferentOwner (uuid, index) {
      let vm = this
      let keys = Object.keys(vm.chatData.messages)
      if (index === 0) return true
      return vm.chatData.messages[keys[index - 1]].owner !== uuid
    },
    orderMessagesByTime (msg1, msg2) {
      return new Date(msg2.lastMessageTime).getTime() - new Date(msg1.lastMessageTime).getTime()
    }
  },
  route: {
    data ({to: to}) {
      let vm = this
      let _id = Number(to.params.id)
      vm.unloadChat()
      vm.loadChatList()
      .then((chatList) => {
        vm.loading = false
        if (_id) {
          return vm.loadChat(_id)
        } else {
          return 0
        }
      })
      .catch(() => vm.$router.go('/'))
      .then((o) => {
        let vm = this
        vm.updateMsgs(o)
        vm.updateScroll(0)
      })
      .catch(() => vm.$router.go('/'))
      .then((o) => {
        if (_id) {
          vm.messageRead(_id)
        }
        return 0
      })
      .catch(() => vm.$router.go('/'))
    }
  }
}

</script>
