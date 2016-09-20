<template>
  <div v-if="showContainer" class="hpanel hblue profile-panel p-none m-b-lg m-l-xs" id="education">
    <div class="panel-body m-none p-none">
      <div class="panel-heading">
        <!-- <addkudo v-ref:addkudo></addkudo> -->
        <!-- <endorsements v-ref:endorsementsmodal></endorsements> -->
        <div class="panel-tools" v-if="editmode">
          <span @click="newEdu" class="hand m-r-xs pull-right" name="addeducation"><i class="material-icons">&#xE145;</i></span>
            <education-editor v-ref:editor></education-editor>
        </div>
        <div class="m-none p-none p-l-md capital">
          <i class="material-icons">&#xE80C;</i>
          <span v-ii18n="education" class="m-l-sm capital">education</span>
        </div>
      </div>
      <education-list></education-list>
    </div>
  </div>
</template>
<script>// var _ = require('underscore')

var educationEditor = require('./education.editor.vue')

// var addkudo = require('./education.record.add.kudo.vue')
// var endorsements = require('../../common/endorsements.vue')
var educationList = require('./education.record.list.vue')

import {isMine, hasprofileEdus} from 'store/profile/getters.profile'

module.exports = {
  events: {
    'education_record:edit': function (data) {
      this.$refs.editor.edit(data)
    }
  },

  components: {
    educationList,
    educationEditor
    // educationrecord: educationrecord,
    // addkudo: addkudo,
    // endorsements: endorsements
  },
  vuex: {
    getters: {
      editmode: isMine,
      hasprofileEdus
    }
  },
  computed: {
    showContainer () {
      return this.hasprofileEdus || this.editmode
    }
  },
  methods: {
    newEdu () {
      this.$refs.editor.new()
    }
  }
}

</script>
