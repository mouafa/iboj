<template>
  <section class="cd-timeline cd-container m-t-md p-none ">
      <!-- <div class="empty-data" v-if="editmode && data && data.length == 0" v-ii18n="experienceIndexTxt"></div> -->
      <experience keep-alive v-for="item in data | orderBy 'since' -1" :record="item" track-by="id" class="cd-timeline-block-container"></experience>
      <section v-if="data && !data.length" class="fx-col fx-start-center placeholder">
        <i class="material-icons symbol">&#xEB3F;</i>
        <h4 class="m-none font-1-5 capital" v-ii18n="addExperienceText">add your first experience</h4>
        <p class="m-none capital" v-ii18n="addExperienceText2">add your work experience to enhance your profile</p>
      </section>
  </section>
</template>
<script>
import {profileExps} from 'store/profile/getters.profile'
// var addexperience = require('./experience.record.editor.vue')
var experience = require('./experience.record.vue')
// var addkudo = require('./experience.record.add.kudo.vue')
// var endorsements = require('../../common/endorsements.vue')
require('style/timeline.less')
module.exports = {
  components: {
    experience: experience
  },
  vuex: {
    getters: {
      data: profileExps
    }
  }
}

</script>
