<style lang="less" scoped>
@import "../../style/common/colors.less";

nav{
  position: fixed;
  width: 100%;
  left: 0;
  top:0;
  z-index: 99;
  background-color: #FFF;
  ul a {
    font-size: 1rem;
  }
}


.loader {
  height: 3px;
  width: 100%;
  position: fixed;
  overflow: hidden;
  z-index: 99999;
  top: 0;
  left: 0;
  right: 0;
  // background-color: #ddd;
}
.loader:before{
  display: block;
  position: fixed;
  content: "";
  z-index: 99999;
  left: -200px;
  width: 200px;
  height: 3px;
  background-color: @color-orange;
  animation: loading 1s linear infinite;
  // animation-delay: 300ms;
}

.btn-menu {
  transition: .2s;
  border-bottom: 2px transparent solid;
  &:hover {
    border-radius: 0;
    border-bottom: 2px @color-blue solid;

  }
}

@keyframes loading {
    from {left: -200px; width: 10%;}
    50% {width: 30%;}
    70% {width: 50%;}
    80% { left: 50%;}
    95% {left: 120%;}
    to {left: 100%;  width: 100%;}
}
.top-top-nav{
  position: fixed;
  height: 8px;
  width: 100%;
  background-color: rgba(70,70,70,.9)
}

.logo{
  width: 48px;
}
.beta{
  font-size: 10px;
  color: #999;
}
// .searchbox{
//   margin-top: 76px;
//   margin-left: 25px;
// }

</style>

<template>
  <section>
    <!-- Dropdown Structure -->

    <!-- Dropdown Structure -->
    <ul id="user-menu" class="dropdown-content capital m-t-n-xs">
      <li><a href="/profile.html" class="font-light">My Profile</a></li>
      <li><a href="/dashboard.html" class="font-light">My Dashboard</a></li>
      <li><a href="/#!/settings" class="font-light">Settings</a></li>
      <li class="divider"></li>
      <li><a href="/auth.html#!/logout">Logout</a></li>
    </ul>

    <nav  v-show="isReady" class="">
      <div class="top-top-nav"></div>
      <div class="nav-wrapper" >

        <a href="/" class="brand-logo m-l-lg m-t-sm"><img class="logo" src="../../assets/jobi_logo.svg" /> <span class="beta font-thin">BETA</span></a>


        <ul class="right hide-on-med-and-down">
          <li  class="m-b-sm m-r-lg"><a href="/index.html" class="  m-t-xs   text-grey font-uppercase  font-light ">Jobs</a></li>
          <li v-if="isAuthed" class="m-b-sm m-r-lg"><a href="/addjoboffer.html" class=" m-t-xs    font-light text-grey  font-uppercase font-light"> post a job </a></li>
          <li v-if="isAuthed"><messenger></messenger></li>
          <li v-if="isAuthed"><notification  class="m-r-sm"></notification></li>

          <!-- Dropdown Trigger -->
          <li >
            <a class="user-menu-button fx-row" href="#!" data-activates="user-menu">
              <i v-if="isAuthed" class="material-icons right m-t-xs m-l-n-xs">arrow_drop_down</i>
              <img v-if="isAuthed" :src="profile.img  " class="user-image circle m-none size-32 m-t-md " alt="logo">
            </a>
          </li>

          <li v-if="!isAuthed" class="p-t-xs"><a href="/auth.html" class="m-r-sm w-min-100 text-info font-light  m-r-lg">Login</a></li>

        </ul>
      </div>
    </nav>
    <div class="row m-none p-none">
      <!-- <searchbox-container class="searchbox col s8 offset-s2 p-none  "></searchbox-container> -->
    </div>

      <div v-if="isLoading" transition="fade-in" class="loader"></div>
  </section>
</template>

<script>
// var searchboxContainer = require('../filter/slaves/searchbox.container')
// var searchBar = require('./searchbar.vue')
var notification = require('shared/toaster.vue')
var messenger = require('shared/messenger-notif.vue')
// var userMenu = require('shared/layout/user-menu.vue')
// var requestInvitation = require('shared/request-invitations.vue')
var bus = require('services/bus')
import {loadAccount} from 'store/account/actions.account'
import {isAuthed, isReady, accountData} from 'store/account/getters.account'

module.exports = {
  data () {
    return {
      isLoading: 0
    }
  },
  vuex: {
    actions: {
      loadAccount
    },
    getters: {
      isAuthed,
      isReady,
      profile: accountData
    }
  },
  components: {
    // requestInvitation,
    notification,
    messenger
    // searchBar
    // userMenu
    // searchboxContainer
  },
  ready () {
    var params = {
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: true, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: true, // Displays dropdown below the button
      alignment: 'left' // Displays dropdown with edge aligned to the left of button
    }

    $(function () {
      $('.button-collapse').sideNav()
      $('.user-menu-button').dropdown(params)
    })
    this.loadAccount().catch(() => {})
    bus.$on('connect:start', this.showLoader)
    bus.$on('connect:end', this.hideLoader)
  },
  destroyed () {
    bus.$off('connect:start')
    bus.$off('connect:end')
  },
  methods: {
    showLoader () {
      this.isLoading ++
    },
    hideLoader () {
      if (!this.isLoading) return
      this.isLoading --
    }
  }
}

</script>
