<template>
<div v-show="loaded" transition="fade-in" class="row" >
<!--   <kudos-editor></kudos-editor>
  <kudosrecord></kudosrecord> -->
    <div class=" profile-details col s7 p-none m-t-lg ">
        <!-- <router-view keep-alive transition-mode="out-in"></router-view> -->
        <exp-Section></exp-Section>
        <edu-Section></edu-Section>
        <section v-if="editmode" @click="importLinkedin"  class="fx-row fx-center-center m-b-lg hand">

            <img class="social-image size-32" src="../../assets/linkedin.png">
            <span class="capital p-t-xs p-l-sm" v-ii18n="importNow">Import Linkedin data</span>

        </section>
    </div>
    <div class="col s5  m-t-lg p-none">
        <about-Section  ></about-Section>
        <div class="m-none p-none p-l-xs m-t-xs">
            <cv-Section></cv-Section>
        </div>
        <div class="m-none p-none p-l-xs m-t-xs">
            <custom-section :editmode="editmode" :categories="customsectionscategories" :profile-id='profileId'></custom-section>
        </div>
    </div>
</div>

</template>

<script>
var appConfig = require('webpack-config-loader!src/main.config.js')
var aboutSection = require('./slaves/about/about.container.vue')
var expSection = require('./slaves/experience/experience.container.vue')
var eduSection = require('./slaves/education/education.container.vue')
var customSection = require('./slaves/custom-section/custom-section.container.vue')
var cvSection = require('./slaves/cvs/cvs.container.vue')

var {loadProfile, unloadProfile} = require('store/profile/actions.profile')
var {isMine, isReady} = require('store/profile/getters.profile')
module.exports = {
  vuex: {
    actions: {
      loadProfile,
      unloadProfile
    },
    getters: {
      editmode: isMine,
      loaded: isReady
    }
  },
  data: function () {
    return {
      loading: false
    }
  },
  components: {
    aboutSection,
    expSection,
    eduSection,
    customSection,
    cvSection
  },
  route: {
    data ({to: to}) {
      var vm = this
      let _id = to.params.id
      if (this.loaded == _id) return
      this.unloadProfile()
      this.loadProfile(_id)
      .then(() => {})
      .catch(() => vm.$router.go('/404'))
    }
  },
  methods: {
    importLinkedin () {
      window.location.href = appConfig.apiBaseUrl + '/import/linkedin/auth'
    }
  }
}

</script>
