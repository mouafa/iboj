<style>
.hpanel {
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05),0 1px 5px 0 rgba(0,0,0,0.05);
    border-radius: 2px;
    overflow: hidden;

}
</style>

<template>
<div class="page-container">
  <topnav>
  </topnav>
  <div class=" main row ">
    <div class="p-none m-none ">
      <router-view transition="fade" transition-mode="out-in"></router-view>
    </div>
  </div>
  <bottomfooter></bottomfooter>
</div>
</template>

<script>
var topnav = require('shared/top_nav.vue')
var bottomfooter = require('shared/footer.vue')
require('style/common/panel.less')
module.exports = {
  components: {
    topnav: topnav,
    bottomfooter: bottomfooter
  }
}
</script>
