<template>

<div>
  <topnav>
  </topnav>
  <div class="">
    <router-view transition="fade" transition-mode="out-in"></router-view>
  </div>
  <bottomfooter></bottomfooter>
</div>

</template>

<script>
import topnav from 'shared/top_nav.vue'
var bottomfooter = require('shared/footer.vue')
module.exports = {
  components: {
    topnav: topnav,
    bottomfooter: bottomfooter
  }
}
</script>
