<template>
<div  class="page-container">
    <topnav></topnav>
    <div class="main">
        <!-- <div class=" col-md-2 p-r-xs ">
            <leftmenu></leftmenu>
        </div> -->
        <div class="p-none to-animate p-r-sm">
            <router-view transition-mode="out-in"></router-view>
        </div>
       <!-- <div class="col-md-2 m-none p-none p-l-xs to-animate">
           <right-side></right-side>
        </div> -->
    </div>
  <bottomfooter></bottomfooter>
</div>
</template>

<script>
// var leftmenu = require('shared/left_menu.vue')
var rightSide = require('shared/layout/right-side.vue')
var topnav = require('shared/top_nav.vue')
var bottomfooter = require('shared/footer.vue')

module.exports = {
  components: {
    // leftmenu,
    topnav,
    rightSide,
    bottomfooter
  },
  ready () {
  }
}

</script>
