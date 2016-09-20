<template>

<div class="page-container">
  <topnav>
  </topnav>
  <div class="main ">
<!--     <div class=" col-md-2 p-r-xs ">
      <leftmenu></leftmenu>
    </div> -->
    <div class="p-none m-none ">
      <router-view transition="fade" transition-mode="out-in"></router-view>
    </div>
  </div>
  <bottomfooter></bottomfooter>
  <!-- <fbinit></fbinit> -->
</div>

</template>

<script>
require('style/common/panel.less')
require('style/common/speech.bubble.css')
var bottomfooter = require('shared/footer.vue')
// import leftmenu from 'shared/left_menu.vue'
import topnav from 'shared/top_nav.vue'
// var fbinit from 'shared/social/fb/fb_init.vue'

import {loadCompany} from 'store/company/actions.company'

module.exports = {
  vuex: {
    actions: {
      loadCompany
    }
  },
  components: {
    // leftmenu: leftmenu,
    topnav: topnav,
    bottomfooter: bottomfooter
    // fbinit: fbinit
  },
  route: {
    data () {
      this.check()
    }
  },
  methods: {
    check () {
      if (this.$route.params.id) return
      this.loadCompany().then((res) => {
        var id = res.slug ? res.slug : res.uuid
        this.$route.router.replace({
          name: 'company',
          params: {id}
        })
      })
    }
  }
}

</script>
