<style scoped>
.right-side {
  position: fixed;
  width: 280px;
}
</style>
<template>
<aside v-if="isAuthed" class="right-side">
  <!-- <pendding-recommendation></pendding-recommendation>
  <invitations></invitations> -->
</aside>

</template>

<script>
// var penddingRecommendation = require('./pendding-recommendation.vue')
// var invitations = require('./invitations.vue')

import {isAuthed} from 'store/account/getters.account'

module.exports = {
  vuex: {
    getters: {
      isAuthed
    }
  },
  components: {
    // invitations,
    // penddingRecommendation
  }
}

</script>
