<template>
<div v-if="showContainer" class="hpanel profile-panel p-none m-b-sm m-l-xs">
  <div  class="panel-body m-none p-none">
    <div class="panel-heading">
      <!-- <addkudo v-ref:addkudo></addkudo> -->
      <!-- <endorsements v-ref:endorsementsmodal></endorsements> -->
      <div class="panel-tools" v-if="editmode">
        <span @click="newExp" class="hand m-r-xs pull-right" name="addexperience"><i class="material-icons">&#xE145;</i></span>
          <experience-editor v-ref:editor></experience-editor>
      </div>
      <div class="m-none p-none p-l-md capital">
          <i class="material-icons">&#xEB3F;</i>
          <span class="m-l-sm" v-ii18n="experience">experience</span>
      </div>
    </div>

    <experience-list></experience-list>

  </div>
</div>
</template>

<script>
var experienceEditor = require('./experience.editor.vue')
var experienceList = require('./experience.record.list.vue')
import {isMine, hasProfileExps} from 'store/profile/getters.profile'

    // var addexperience = require('./experience.record.editor.vue')
    // var addkudo = require('./experience.record.add.kudo.vue')
    // var endorsements = require('../../common/endorsements.vue')
require('style/timeline.less')
module.exports = {
  components: {
    experienceList,
    experienceEditor
    // addexperience: addexperience,
    // addkudo: addkudo,
    // endorsements: endorsements
  },
  vuex: {
    getters: {
      editmode: isMine,
      hasProfileExps
    }
  },
  computed: {
    showContainer () {
      return this.hasProfileExps || this.editmode
    }
  },
  events: {
    'experience_record:edit': function (data) {
      this.$refs.editor.edit(data)
    }
  },
  methods: {
    newExp () {
      this.$refs.editor.new()
    }
  }
}

</script>
