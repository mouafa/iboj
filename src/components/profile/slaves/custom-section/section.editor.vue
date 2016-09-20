
<template>
  <div>
    <modal :show.sync="showModal">
      <div class="p-sm panel-heading capital" slot="header">
        <i class="material-icons md-14">&#xE53B;</i>
        <span v-ii18n="customSectionEditor">custom section editor</span>
      </div>
      <div class="p-l-sm p-r-sm m-b-md capital" slot="body">
        <!-- <p class="text-danger m-b-xs error" v-if="error">
          <span>{{error}}</span>
        </p> -->
        <div class="row">
          <div class="m-r-lg input-field col s12">
            <label  for="title" class="required" :class="{'active': title}" v-ii18n="titleLbl">title</label>
            <input type="search"  id="title" name="title" v-model="title" maxlength="20">
          </div>
        </div>
        <div class="row">
           <div class="m-r-lg input-field col s12">
             <label for="link" v-ii18n="titleLbl" :class="{'active': url}">url </label>
             <input type="search"  id="link" name="link" v-model="url | url" maxlength="100">
           </div>
        </div>
           <div class="row">
              <div class="input-field col s12">
                <label for="description" :class="{'active': description}">description</label>
                 <textarea id="description" class="materialize-textarea" v-model="description" maxlength="400" name="description"></textarea>
              </div>
            <div class=" font-8 text-warning pull-right">{{remainChars}}</div>
        </div>
      </div>
      <div class="m-r-md m-t-sm row p-xs " slot="footer">
        <button v-if="iseditmode" :disabled="isLoading" @click="delete" class="m-l-lg font-light btn red text-white font-8 uppercase"  name="delete" v-if="iseditmode" v-ii18n="deleteLbl">delete</button>
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
var bus = require('services/bus')
import {addToActiveSec, saveActiveSec, cancelActiveSec, deleteFromActiveSec} from 'store/profile/actions.profile'

module.exports = {
  vuex: {
    actions: {
      saveActiveSec,
      addToActiveSec,
      cancelActiveSec,
      deleteFromActiveSec
    }
  },
  data () {
    return {
      lastcategory: '',
      error: '',
      isLoading: false,
      iseditmode: false,
      url: '',
      description: '',
      title: '',
      itemData: null,
      showModal: false
    }
  },
  components: {
    modal: modal
  },
  ready () {
    bus.$on('custom-section:editor', this.edit)
  },
  destroyed () {
    bus.$off('custom-section:editor')
  },
  computed: {
    remainChars () {
      if (this.description && this.description.length) {
        if (this.description.length > 400) return 0
        return (400 - this.description.split('\n').join('  ').length)
      } else return 400
    }
  },
  methods: {
    edit (item) {
      this.iseditmode = !!item
      this.title = item ? item.title : ''
      this.url = item ? item.url : ''
      this.description = item ? item.description : ''
      this.showModal = true
      this.itemData = item
    },
    save () {
      let vm = this
      if (!this.title) {
        console.log('Missing Required Fields')
        return (this.error = 'Missing Required Fields')
      }
      vm.isLoading = true
      let data = { title: vm.title, description: vm.description, url: vm.url }

      if (vm.iseditmode) {
        let sectionId = vm.itemData.id
        this.saveActiveSec(data, sectionId)
        .then(() => vm.reset())
      } else {
        this.addToActiveSec(data)
        .then(() => vm.reset())
      }
    },
    cancel () {
      this.reset()
    },
    delete () {
      let vm = this
      let sectionId = vm.itemData.id
      this.deleteFromActiveSec(sectionId)
      .then(() => vm.reset())
    },
    reset () {
      this.itemData = null
      this.cancelActiveSec()
      this.title = this.description = this.error = this.url = ''
      this.iseditmode = false
      this.id = null
      this.error = ''
      this.showModal = false
      this.isLoading = false
    }
  }
}

</script>
