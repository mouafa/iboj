<style lang="less" scoped>
.edit-section{
  opacity: 0;
  transition: 200ms all;
  &:hover{
      opacity: 1
  }
}
</style>

<template>
  <div>


    <ul class="fx-col p-none m-t-md m-l-sm m-r-sm word-wrapper ul-none">
      <li v-for="sec in section.customsections" class="section-item">
        <div class="font-9 fx-row fx-space-between-center" >
          <a v-if="sec.url" :href="sec.url">{{sec.title}}</a>
          <span v-else>{{sec.title}}</span>
          <div v-if="editmode" @click="editSection(sec)" class="edit-section hand">
              <i class="material-icons">&#xE254;</i>
          </div>
        </div>
        <div class="font-light font-8 m-t-sm ">{{sec.description}}</div>
      </li>
    </ul>
    <div v-if="editmode" class="row center">
      <span @click="newSection" type="button" class="hand  m-t-sm m-b-sm font-9  ">
        <i class="material-icons md-14 orange600">&#xE147;</i>
        <span class="capital" v-ii18n="addNewItem">add new item</span>
      </span>
    </div>
  </div>
</template>

<script>
var bus = require('services/bus.js')
import {isMine} from 'store/profile/getters.profile'
import {setActiveSec} from 'store/profile/actions.profile'

module.exports = {
  vuex: {
    actions: {
      setActiveSec
    },
    getters: {
      editmode: isMine
    }
  },
  props: {
    section: {
      type: Object,
      require: true
    }
  },
  methods: {
    newSection () {
      this.setActiveSec(this.section)
      bus.$emit('custom-section:editor')
    },
    editSection (item) {
      this.setActiveSec(this.section)
      bus.$emit('custom-section:editor', item)
    }
  }
}

</script>
