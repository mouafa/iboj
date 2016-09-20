<template>
<div  class="page-container">
    <topnav></topnav>
    <div class="main">
        <div class="p-none to-animate p-r-sm">
            <router-view transition-mode="out-in"></router-view>
        </div>
    </div>
  <bottomfooter></bottomfooter>
</div>
</template>

<script>
var rightSide = require('shared/layout/right-side.vue')
var topnav = require('shared/top_nav.vue')
var bottomfooter = require('shared/footer.vue')
// var fb = require('shared/social/index.fb.js')
// var firebase = require('services/firebase-chat')
var firebase = window.firebase

module.exports = {
  components: {
    topnav,
    rightSide,
    bottomfooter
  },
  ready () {
    // fb()
    // firebase.init()
  }
}

</script>
