<style lang="less" scoped>
.alert-container {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 300px;
    li {
      width:100%;
    }
}
.max-width-notife{
    max-width: 280px;
}
#notification-component {
    -moz-user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857;
    margin-bottom: 0;
    // padding: 6px 12px;

    white-space: nowrap;
    position: relative;
}
.counter {
  left: 12px;
  top: 20px;
}
.btn-cercle{
  border-radius: 50%;
}
.flesh {
  right: 10px;
}
</style>

<template>
  <div class="p-r-n pos-re" id="notification-component">
    <section @click="toggle" >
      <i class="material-icons md-22 p-t-xs">&#xE7F7;</i>
      <div v-if="counter" class="btn-circle btn-s bg-red text-white counter pos-ab">{{counter}}</div>
    </section>
    <div v-if="isShow" class="flesh"></div>
    <ul v-if="isShow" class="list-alert bg-white border">
      <div class="alert-container">
        <li v-if="alerts.length == 0" class="fx-row border-bottom p-sm fx-center-center" flex > You dont have any notification until now</li>
        <li @click="item.type != 'confirmation' && open(item)"  v-for="item in alerts | orderBy 'createdAt' -1" track-by="$index" :class="{'bg-white-smoke':!item.vu}"  class="fx-row border-bottom p-xxs fx-start-center" flex>
          <img :src="item.toast.img ? item.toast.img : ''" alt="logo" class="img-handler size-32 m-r-xs img-circle">
          <section class="fx-row fx-space-between-center" flex>
            <div :class="{'w-max-200':item.type== 'confirmation'}" class="fx-col font-8 p-xxs max-width-notife word-wrapper sans-serif" flex>
              <span>{{{item.toast.msg}}}</span>
              <!-- <span class="text-light ">{{item.createdAt | moment "from" "now"}}</span> -->
              <span v-from-now="item.createdAt" class="text-light"></span>
            </div>
            <div v-if="item.type== 'confirmation'" class="fx-row pull-right">
              <button @click="accept(item)" class="font-light font-1-2 btn-cercle size-32 border p-t-xxs m-xxs"><i class="fa fa-check"></i></button>
              <button @click="reject(item)" class="font-light font-1-2 btn-cercle size-32 border p-t-xxs m-xxs m-r-sm"><i class="fa fa-close"></i></button>
            </div>
        </section>
        </li>
      </div>
      <!--<li>
                <span class="font-8 p-sm"> Show all</span>
            </li>
            <li v-for="item in alerts" :class="{'bg-white-smoke':!item.vu}" class="fx-row border-bottom p-xs fx-space-between" @click="redirect">
                <img :src="item.toast.img ? item.toast.img : '/assets/images/clouds.svg' " class="size-32"></img>
                <a class="font-9">{{item.toast.msg}} {{item.createdAt}}</a>
            </li> -->
    </ul>
  </div>
</template>

<script>
require('style/notifications.less')
var appConfig = require('webpack-config-loader!src/main.config.js')
var connector = require('services/connect.js')
var io = require('socket.io-client')
var socket = io.connect(appConfig.toasterUrl)
var audio = new Audio('http://img.tunpixel.tn/assets/notif.mp3')
module.exports = {
  data: function () {
    return {
      alerts: [],
      isShow: false,
      counter: 0,
      client: null,
      user: null,
      token: null,
      clickOut: function () {}
    }
  },
  methods: {
    toggle: function () {
      // if (this.alerts.length == 0) return
      this.isShow = !this.isShow
      if (!this.isShow) return $(document).unbind('click', this.clickOut)
      this.counter = 0
      $(document).bind('click', this.clickOut)
      socket.emit('vu', this.alerts.map((e) => e._id))
      socket.emit('open', this.alerts.filter((e) => (e.type == 'confirmation')).map((e) => e._id))
    },
    open: function (item) {
      if (!item.toast.link) return
      $(window.location).attr('href', item.toast.link)
      // else if (item.toast.link.indexOf('#') >= 0) {
      //   let link = item.toast.link.split('#')[1]
      //   // this.$router.go(link)
      //   $(window.location).attr('href', window.location.origin + link)
      // } else {
      //   $(window.location).attr('href', item.toast.link || '')
      // }
    },
    accept: function (item) {
      var vm = this
      connector.apiAsync(item.toast.method, item.toast.accept.link, item.toast.accept.data || null)
      .then((res) => {
        socket.emit('open', [item._id])
        vm.alerts.$remove(item)
        if (vm.alerts.length == 0) vm.isShow = false
      })
      .catch(() => {})
    },
    reject: function (item) {
      var vm = this
      connector.apiAsync(item.toast.method, item.toast.reject.link, item.toast.reject.data || null)
      .then((res) => {
        socket.emit('open', [item._id])
        vm.alerts.$remove(item)
        if (vm.alerts.length == 0) vm.isShow = false
      })
      .catch(() => {})
    }
  },
  created: function () {
    var vm = this
    this.clickOut = function (event) {
      if ($(event.target).closest('#notification-component').length) return true
      vm.toggle()
    }
    connector.apiAsync('GET', '/connexion', '')
    .then((res) => {
      vm.token = res.token
      socket.emit('login', {
        token: res.token
      })
    })
    .catch(() => {})
    socket.on('push', function (notife) {
      audio.play()
      vm.alerts.unshift(notife)
      vm.counter = vm.counter + 1
      // console.log(notife)
    })
    socket.on('init', function (notifes) {
      notifes.map(function (e) {
        vm.alerts.unshift(e)
        if (!e.vu) vm.counter = vm.counter + 1
      })
    })
    socket.on('update', function (notifes) {
      setTimeout(function () {
        vm.alerts.map(function (e) {
          e.vu = true
        })
      }, 1000)
    })
  }
}

</script>
