<template>
<section>
<div class="hpanel profile-panel">
  <div v-for="section in categories" class="panel-body m-none m-b-xs p-none p-b-xs word-wrapper">
    <div class="panel-heading p-l-sm p-r-sm fx-row fx-space-between-center">
        <!-- <i class="fa fa-graduation-cap m-r-sm "></i> -->
        <span class="capital">{{section.title }}</span>
        <span v-if="editmode" @click="editCategory(section)"  type="button" class="p-r-xs hand">
              <i class="material-icons md-14">&#xE254;</i>
        </span>
    </div>
    <section-list :section="section" track-by="id"></section-list>
  </div>
</div>
</section>
</template>

<script>
// var editor = require('./custom-section.editor.vue')
var sectionList = require('./section.list.vue')
var bus = require('services/bus')

import {isMine, customSecs} from 'store/profile/getters.profile'
import {setActiveSec} from 'store/profile/actions.profile'

module.exports = {
  vuex: {
    actions: {
      setActiveSec
    },
    getters: {
      editmode: isMine,
      categories: customSecs
    }
  },
  components: {
    sectionList
  },
  methods: {
    editCategory (data) {
      this.setActiveSec(data)
      bus.$emit('custom-section:category-editor', data)
    }
  }
}

</script>
