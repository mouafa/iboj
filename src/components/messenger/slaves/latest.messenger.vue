<style lang="less" scoped>
.latest-messages-container {
  min-height: 425px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  .messages-container {
    max-height: 325px;
    overflow: auto;
  }
  .section-title {
    margin: 0;
    padding: 10px 0 15px 0;
    color: #666;
    text-align: center;
  }
}
.non-read-background {
  background-color: #F0F0FF !important;
}
a:hover {
  background-color: transparent;
}
.loading-text {
  text-align: center;
  padding: 10px;
}
.message-name {
  font-size: 1em;
  color: #6CA2CE;
}
.message-time {
  color: #AAAAAA;
  padding-bottom: 2px;
}
.view-all {
  position: absolute;
  right: 10px;
  bottom: 5px;
}
.messages-container {
  border: none;
}
.message-item {
  cursor: pointer;
  padding: 10px 0 10px 8px;
  border-bottom: .25px #EEE solid;
}
.message-item:first-child {
  padding: 0 0 10px 8px;
}
</style>

<template>
<section>
  <div class="latest-messages-container">
    <p class="section-title font-1-2">Latest Messages</p>
    <ul id="messenger-menu" class="collection messages-container">
      <li v-if="!isMessagesListLoaded" class="loading-text">
        Loading ...
      </li>
      <li v-if="isMessagesListLoaded && !messagesList.length" class="loading-text">
        No Messages. Forever Alone We Stand, United We Fall ...
      </li>
      <li class="avatar message-item" :class="{'non-read-background': isMessageNonRead(item.id)}" v-for="item in messagesList | orderBy orderMessagesByTime | limit 4" track-by="$index" @click="openMessage(item)">
        <div class="message-time font-8">{{item.lastMessageTime | messageTime}}</div>
        <div class="row p-none m-none">
          <div class="col m2 p-none m-none">
            <img v-if="item.applicant.uuid != userUUID" :src="item.applicant.img  " alt="" class="circle user-image size-24">
            <img v-else :src="item.company.logo  " alt="" class="circle user-image size-24">
          </div>
          <div class="col m10 ">
            <span v-if="item.applicant.uuid != userUUID" class="message-name">{{item.applicant.name}}</span>
            <span v-else class="message-name">{{item.company.name}}</span>
            <div class="message-title">{{item.title}}</div>
          </div>
        </div>
      </li>
    </ul>
  </div>
  <a v-if="isMessagesListLoaded && messagesList.length" href="/messenger.html#!/" class="font-light center view-all">View All</a>
</section>
</template>

<script>
import {userUUID, messagesList, isMessagesListLoaded, numberOfNotifications, messagesToNotifyAbout} from 'store/messenger/getters.messenger'

let moment = require('moment')

module.exports = {
  vuex: {
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
  methods: {
    isMessageNonRead (chatId) {
      let vm = this
      let result = false
      vm.messagesToNotifyAbout.forEach((msg) => {
        if (msg === chatId) result = true
      })
      return result
    },
    openMessage (message) {
      window.location = window.location.origin + '/messenger.html#!/' + message.id
    },
    orderMessagesByTime (msg1, msg2) {
      return new Date(msg2.lastMessageTime).getTime() - new Date(msg1.lastMessageTime).getTime()
    }
  }
}
</script>
