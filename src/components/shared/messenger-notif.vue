<style lang="less" scoped>
.counter {
  left: 10px;
  top: 18px;
  line-height: 12px;
}
.btn-cercle {
  border-radius: 50%;
}
.flesh {
  right: 10px;
}
.non-read-background {
  background-color: #F0F0FF !important;
}
a:hover {
  background-color: transparent;
}
#messenger-menu {
  min-width: 350px;
}
.loading-text {
  text-align: center;
  padding: 10px;
}
.message-name {
  font-size: 16px;
  padding-top: 0px;
  padding-bottom: 0px;
}
.message-title {
  padding-left: 16px;
}
.message-time {
  color: #AAAAAA;
  padding-left: 16px;
}
</style>

<template>
  <!-- Dropdown Structure -->
  <ul id="messenger-menu" class="dropdown-content capital collection">
    <li v-if="!isMessagesListLoaded" class="loading-text">
      Loading ...
    </li>
    <li v-if="isMessagesListLoaded && !messagesList.length" class="loading-text">
      No Messages. Forever Alone We Stand ...
    </li>
    <li class="collection-item avatar" :class="{'non-read-background': isMessageNonRead(item.id)}" v-for="item in messagesList | orderBy orderMessagesByTime | limit 5" track-by="$index" @click="openMessage(item)">
      <img v-if="item.applicant.uuid != userUUID" :src="item.applicant.img  " alt="" class="circle user-image">
      <img v-else :src="item.company.logo  " alt="" class="circle user-image">
      <span v-if="item.applicant.uuid != userUUID" class="message-name">{{item.applicant.name}}</span>
      <span v-else class="message-name">{{item.company.name}}</span>
      <p class="message-title">{{item.title}}</p>
      <p class="message-time">{{item.lastMessageTime | messageTime}}</p>
    </li>
    <li class="divider"></li>
    <li>
      <a href="/messenger.html" class="font-light center">View All</a>
    </li>
  </ul>

  <div class="p-r-n pos-re">
    <!-- <a v-link="'/messenger'" data-activates="messenger-menu"> -->
    <a data-activates="messenger-menu" class="dropdown-button">
      <i class="material-icons md-22 p-t-xs">&#xE0BE;</i>
      <div v-if="numberOfNotifications" class="btn-circle btn-s bg-red text-white counter pos-ab">{{numberOfNotifications}}</div>
    </a>
  </div>
</template>

<script>
import {loadChatList, setNotificationsNumber, setMessagesToNotifyAbout, checkNewNotifications, setConnectedUser} from 'store/messenger/actions.messenger'
import {userUUID, messagesList, isMessagesListLoaded, numberOfNotifications, messagesToNotifyAbout} from 'store/messenger/getters.messenger'

var bus = require('services/bus')
let moment = require('moment')

module.exports = {
  vuex: {
    actions: {
      loadChatList,
      setConnectedUser,
      checkNewNotifications,
      setNotificationsNumber,
      setMessagesToNotifyAbout
    },
    getters: {
      userUUID: userUUID,
      messagesList: messagesList,
      isMessagesListLoaded: isMessagesListLoaded,
      numberOfNotifications: numberOfNotifications,
      messagesToNotifyAbout: messagesToNotifyAbout
    }
  },
  filters: {
    limit: function (arr, limit) {
      return arr.slice(0, Number(limit))
    },
    messageTime (val) {
      return moment(val).format('ddd Do MMM YYYY, HH:mm')
    }
  },
  ready () {
    let vm = this
    vm.initDropDown()
    vm.setConnectedUser()
    vm.loadChatList()
    vm.checkNewNotifications()
    bus.$on('messenger:new-message-notification', vm.addNotification)
  },
  methods: {
    addNotification ({messages}) {
      let vm = this
      vm.loadChatList()
      vm.setMessagesToNotifyAbout(messages)
      if (vm.numberOfNotifications === '∞') return
      if (vm.numberOfNotifications > 9) vm.setNotificationsNumber('∞')
    },
    isMessageNonRead (chatId) {
      let vm = this
      let result = false
      vm.messagesToNotifyAbout.forEach((msg) => {
        if (msg === chatId) result = true
      })
      return result
    },
    openMessage (message) {
      window.location.replace(window.location.origin + '/messenger.html#!/' + message.id)
    },
    initDropDown () {
      $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: true, // Displays dropdown below the button
        alignment: 'left' // Displays dropdown with edge aligned to the left of button
      })
    },
    orderMessagesByTime (msg1, msg2) {
      return new Date(msg2.lastMessageTime).getTime() - new Date(msg1.lastMessageTime).getTime()
    }
  }
}
</script>
