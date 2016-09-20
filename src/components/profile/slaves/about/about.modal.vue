<template>
    <div>
        <modal :show.sync="showModal">
            <div slot="header" class="p-sm panel-heading">
                <i class="material-icons">&#xE7FD;</i><span class="m-l-sm capital" v-ii18n="about">about</span>
            </div>
            <div slot="body" class="row p-l-sm p-r-sm m-b-md m-t-md">
                <div class="row">
                    <div class="m-r-lg input-field col s12">
                      <label v-ii18n="firstNameLbl" class="required" for="firstname" :class="{'active': aboutData.firstname}">first name</label>
                        <input type="search" maxlength="20" v-model="aboutData.firstname" name="firstname" id="firstname">
                    </div>
                </div>
                <div class="row">
                    <div class="m-r-lg input-field col s12">
                        <label v-ii18n="lastNameLbl"  class="required"  :class="{'active': aboutData.lastname}" for="firstname">lastname name</label>
                        <input type="search" maxlength="20" v-model="aboutData.lastname" name="lastname" id="lastname">
                    </div>
                </div>
                <div class="row">
                    <div class="m-r-lg input-field col s12">
                        <label v-ii18n="titleLbl" for="title" :class="{'active': aboutData.title}">title</label>
                        <input type="search" maxlength="32" v-model="aboutData.title" name="title" id="title">
                    </div>
                </div>
                <div class="row">
                    <div class="input-field col s12">
                        <label for="about" :class="{'active': aboutData.about}">about</label>
                        <textarea id="about" class="materialize-textarea" v-model="aboutData.about | substring" name="about"></textarea>
                    </div>
                </div>
            </div>
            <div slot="footer" class="pull-right m-r-md m-t-sm row ">
                <button @click="cancel" class="btn-flat btn btn-info text-white btn btn-outline border font-light font-8" name="cancel">CANCEL</button>
                <button @click="save" :class="{ 'disabled': isLoading }" class="w-xs font-light btn btn-success m-l-md font-8" name="save">SAVE</button>
            </div>
        </modal>
    </div>
</template>
<script>
var modal = require('shared/modal.vue')
import {updateAbout} from 'store/profile/actions.profile'
import notify from 'services/notifs-center'
module.exports = {
  components: {
    modal
  },
  vuex: {
    actions: {
      updateAbout
    }
  },
  data () {
    return {
      showModal: false,
      aboutData: {
        firstname: '',
        lastname: '',
        title: '',
        about: ''
      }
    }
  },
  methods: {
    show (data) {
      this.aboutData = Object.assign({}, data)
      this.showModal = true
    },
    cancel () {
      this.reset()
    },
    save () {
      let data = this.aboutData
      if (!data.firstname || !data.lastname) return notify.error('first name and last name are required')
      let newAbout = {
        firstname: data.firstname,
        lastname: data.lastname,
        title: data.title,
        about: data.about
      }
      this.updateAbout(newAbout)
      .then(this.reset, this.reset)
    },
    reset () {
      this.showModal = false
      this.aboutData.firstname = ''
      this.aboutData.lastname = ''
      this.aboutData.title = ''
      this.aboutData.about = ''
    }
  }
}
</script>