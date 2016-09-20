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
require('style/common/panel.less')
require('style/common/speech.bubble.css')
var bottomfooter = require('shared/footer.vue')
var topnav = require('shared/top_nav.vue')

var {loadAccount} = require('store/account/actions.account')

module.exports = {
  vuex: {
    actions: {
      loadAccount
    }
  },
  components: {
    topnav: topnav,
    bottomfooter: bottomfooter
  },
  route: {
    data () {
      this.check()
    }
  },
  methods: {
    check () {
      if (this.$route.params.id) return
      this.loadAccount().then((res) => {
        var id = res.slug ? res.slug : res.uuid
        this.$route.router.replace({
          name: 'profile',
          params: {id}
        })
      })
    }
  }
}

</script>
