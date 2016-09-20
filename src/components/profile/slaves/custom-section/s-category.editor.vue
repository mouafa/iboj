<template>
  <div>
    <slot></slot>
    <modal :show.sync="showModal">
      <div class="p-sm panel-heading capital" slot="header">
        <i class="material-icons">&#xE53B;</i>
        <span v-ii18n="customSectionEditor">custom section editor</span>
      </div>
      <div class="p-l-sm p-r-sm m-b-md" slot="body">
        <!-- <p class="text-danger m-b-xs error" v-if="error">
          <span>{{error}}</span>
        </p> -->
      <div class="row">
        <div class="m-r-lg input-field col s12">
          <label  for="sectionName" class="required" :class="{'active': title}" v-ii18n="sectionName">section name</label>
          <input type="search"  id="sectionName" name="title" v-model="title" maxlength="20">
        </div>
      </div>
      </div>
      <div class="m-r-md m-t-sm row p-xs " slot="footer">
        <button v-if="iseditmode" :disabled="isLoading" @click="deleteSection" class="m-l-lg font-light btn red text-white font-8 uppercase"  name="delete" v-ii18n="deleteLbl">delete</button>
        <div class="pull-right">
          <button :disabled="isLoading" @click="cancel" class="btn-flat btn btn-info text-white btn btn-outline border font-light font-8" name="cancel" v-ii18n="cancel">cancel</button>
          <button :disabled="isLoading" @click="save" class="w-xs font-light btn btn-success m-l-md font-8 uppercase" name="save" v-ii18n="save">save</button>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
var modal = require('shared/modal.vue')
var bus = require('services/bus.js')

import {addNewSec, saveActiveSecCat, deleteActiveSec, cancelActiveSec} from 'store/profile/actions.profile'

module.exports = {
  vuex: {
    actions: {
      cancelActiveSec,
      addNewSec,
      saveActiveSecCat,
      deleteActiveSec
    }
  },
  data: function () {
    return {
      error: '',
      isLoading: false,
      showModal: false,
      iseditmode: false,
      title: ''
    }
  },
  components: {
    modal: modal
  },
  ready () {
    bus.$on('custom-section:category-editor', this.edit)
  },
  destroyed () {
    bus.$off('custom-section:category-editor')
  },
  methods: {
    edit: function (record) {
      this.iseditmode = !!record
      this.title = record ? record.title : ''
      this.id = record ? record.id : ''
      this.showModal = true
    },
    save: function () {
      var vm = this
      if (!this.title) {
        console.warn('Missing Required Fields')
        return (this.error = 'Missing Required Fields')
      }
      this.isLoading = true

      let data = { title: vm.title }

      if (vm.iseditmode) {
        this.saveActiveSecCat(data)
        .then(() => vm.reset())
        .catch(() => vm.reset())
      } else {
        this.addNewSec(data)
        .then(() => vm.reset())
        .catch(() => vm.reset())
      }
    },
    cancel: function () {
      this.reset()
    },
    deleteSection: function () {
      var vm = this
      this.deleteActiveSec()
      .then(() => vm.reset())
      .catch(() => vm.reset())
    },
    reset: function () {
      this.cancelActiveSec()
      this.showModal = false
      this.isLoading = false
      this.title = ''
      this.iseditmode = false
      this.id = null
      this.error = ''
    }
  }
}

</script>
