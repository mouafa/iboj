<template>
  <section class="cd-timeline cd-container m-t-md m-xs ">
    <!-- <div class="empty-data" v-if="editmode && data && data.length == 0" v-ii18n="educationIndexTxt">You may provide here more information about your education history. It doesn\'t take too long and can attract more attention to your profile.</div> -->
    <education keep-alive  v-for="item in data | orderBy 'since' -1" track-by="id" :record="item" class="cd-timeline-block-container" ></education>
    <section v-if="data && !data.length" class="fx-col fx-start-center placeholder">
      <i class="material-icons symbol">&#xE80C;</i>
      <h4 class="m-none font-1-5 capital" v-ii18n="addEducationText">add your first education</h4>
      <p class="m-none capital" v-ii18n="addEducationText2">add your education to enhance your profile</p>
    </section>
  </section>
</template>

<script>
import {profileEdus} from 'store/profile/getters.profile'
// var addexperience = require('./experience.record.editor.vue')
var education = require('./education.record.vue')
// var addkudo = require('./experience.record.add.kudo.vue')
// var endorsements = require('../../common/endorsements.vue')
require('style/timeline.less')
module.exports = {
  components: {
    education: education
  },
  vuex: {
    getters: {
      data: profileEdus
    }
  }
}

</script>
