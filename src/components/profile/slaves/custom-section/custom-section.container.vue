<template>
<section>
  <category-editor></category-editor>

  <category-list></category-list>
  <div v-if="editmode" class="hpanel m-t-md">
    <div class=" panel-body border m-b-xs p-xs p-r-sm p-l-xs  center">

        <span @click="newCategory" class="hand m-t-sm font-9  ">
          <i class="material-icons md-14">&#xE147;</i>
          <span class="uppercase" v-ii18n="addNewSection">add new section</span>
        </span>
        <div v-if ="!categories.length" class="empty-data m-t-lg  p-sm word-wrapper">
          <span v-ii18n="yourPotentialText">Sections could be spoken languages, hobbies, publications, certifications, patents, etc.</span>
        </div>
    </div>
  </div>
 <section-editor></section-editor>

</section>
</template>
<script>
var categoryList = require('./s-category.list.vue')
var categoryEditor = require('./s-category.editor.vue')
var sectionEditor = require('./section.editor.vue')
var bus = require('services/bus.js')

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
    categoryList,
    categoryEditor,
    sectionEditor
  },
  data: function () {
    return {}
  },
  methods: {
    newCategory () {
      bus.$emit('custom-section:category-editor')
    }
  }
}

</script>
