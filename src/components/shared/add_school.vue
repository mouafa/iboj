<template>
    <modal v-if="showModal" :show.sync="showModal">
        <div class="p-sm panel-heading" slot="header">
            <i class="material-icons">&#xE80C;</i><span class="m-l-sm capital" >Add school</span>
        </div>
        <div class="p-l-sm p-r-sm m-b-md row" slot="body">
            <div class="col s2">
                <div @click="uploadImage" title="Logo Of school" class="cd-timeline-img cd-picture size-64 hand uploader" :class="{'progres' : isImageLoading}">
                    <img :src="school.logo  " class="uploader size-64 school-logo" alt="school logo" />
                </div>
            </div>
              <div class="row col s10">
                <div class="col s6">
                  <div class="m-r-lg input-field">
                    <label class="required capital" for="name">school name</label>
                    <input type="search"  id="name" v-model="school.name"  maxlength="64"  name="title">
                  </div>
                  <div class="m-r-lg input-field">
                    <input type="search"  id="school" v-model="school.url"  maxlength="64" name="url">
                    <label for="school" class="capital">school url </label>
                  </div>
                  <div class="m-r-lg input-field">
                    <input type="search"  id="email" v-model="school.email"  maxlength="64" name="email">
                    <label for="email" class="capital">school email </label>
                  </div>
                  <div class="m-r-lg input-field">
                    <input type="search"  id="phone" v-model="school.phone"  maxlength="16" name="Phone">
                    <label for="phone" class="capital">school phone </label>
                  </div>
                </div>
                <div class="col s6">
                   <div class="m-r-lg input-field">
                    <label for="country" class="required capital">Country</label>
                    <input type="search"  id="country" v-model="school.country"  maxlength="32" name="country">
                  </div>
                  <div class="m-r-lg input-field">
                    <input type="search"  id="address" v-model="school.address" maxlength="32" name="address">
                    <label for="address" class="capital">Address </label>
                  </div>
                  <div class="m-r-lg input-field">
                    <input type="search"  id="city" v-model="school.city"  maxlength="32" name="city">
                    <label for="city" class="capital">City </label>
                  </div>
                  <div class="m-r-lg input-field">
                    <input type="search"  id="region" v-model="school.region"  maxlength="32" name="region">
                    <label for="region" class="capital">Region </label>
                  </div>
                  <div class="m-r-lg input-field">
                    <input type="search"  id="zipcode" v-model="school.zipcode" maxlength="16" name="zipcode">
                    <label for="zipcode" class="capital">zipcode </label>
                  </div>
                </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <textarea id="description" class="materialize-textarea" v-model="school.description" maxlength="4000" name="description"></textarea>
                <label for="description">Description</label>
              </div>
              <div class=" font-8 text-warning pull-right">{{remainChars}}</div>
           </div>
        </div>
        <div slot="footer" class="m-r-md m-t-sm row p-xs ">
            <div class="pull-right">
                <button @click="cancel" :disabled="isLoading" class="btn-flat btn btn-info text-white btn btn-outline border font-light font-8" name="cancel" v-ii18n="cancel">cancel</button>
                <button @click="save" :disabled="isLoading" class="w-xs font-light btn btn-success m-l-md font-8 uppercase" name="save"  v-ii18n="save">save</button>
            </div>
        </div>
    </modal>
</template>
<script>
var connector = require('services/connect.js')
var modal = require('shared/modal.vue')

import notify from 'services/notifs-center'

module.exports = {
  data: function () {
    return {
      school: new School(),
      isLoading: false,
      showModal: false,
      isImageLoading: false
    }
  },
  components: {
    modal: modal
  },
  computed: {
    remainChars () {
      if (this.school.description && this.school.description.length) {
        if (this.school.description.length > 4000) return 0
        return (4000 - this.school.description.split('\n').join('  ').length)
      } else return 4000
    }
  },
  methods: {
    showme: function () {
      this.showModal = true
    },
    reset: function () {
      this.school = new School()
      this.isLoading = false
    },
    save: function () {
      var that = this
      this.isLoading = true
      this.school.save()
      .then(function (School) {
        that.isLoading = false
        that.$dispatch('addschool:added', School)
        that.reset()
        that.showModal = false
      })
      .catch(function (err) {
        notify.error(err)
        that.isLoading = false
      })
    },
    cancel: function () {
      this.reset()
      this.showModal = false
    },
    uploadImage: function () {
      var that = this
      this.isImageLoading = true
      var dialog = window. photolia.openDialog(null, {
        imagesOnly: true,
        crop: '300x300'
      }).done(function (file) {
        file.done(function (fileInfo) {
          that.school.logo = fileInfo.cdnUrl
          that.isImageLoading = false
        }).fail(function (error, fileInfo) {
          that.isImageLoading = false
          console.warn('Failed upload', error)
        })
      })
      dialog.fail(function (result) {
        that.isImageLoading = false
      })
    }
  }
}

var School = function () {
  this.id = null
  this.name = ''
  this.url = ''
  this.logo = ''
  this.description = ''

  this.address = ''
  this.city = ''
  this.country = ''
  this.zipcode = ''
  this.region = ''

  this.phone = ''
  this.email = ''

  var self = this

  this.toJSON = function () {
    var object = {
      name: self.name,
      url: self.url,
      logo: self.logo,
      description: self.description,
      address: self.address,
      city: self.city,
      country: self.country,
      zipcode: self.zipcode,
      region: self.region,
      phone: self.phone,
      email: self.email
    }
    if (self.id) {
      object['id'] = self.id
    }
    return object
  }
  this.validate = function () {
    return new Promise(function (resolve, reject) {
      if (!self.name) {
        reject('Name missing')
      } else if (!self.country) {
        reject('Country missing')
      } else if (self.name.length < 3) {
        reject('Name is too short')
      } else if (self.country.length < 3) {
        reject('Country is too short')
      } else if (!self.validEmail()) {
        reject('Invalid email')
      } else if (!self.validPhone()) {
        reject('Invalid phone')
      } else {
        resolve()
      }
    })
  }
  this.validEmail = function () {
    if (!self.email) return true
    var re = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(self.email)
  }
  this.validPhone = function () {
    if (!self.phone) return true
    var re = /^[\d\-\(\)\+\s]*$/g
    return re.test(self.phone) && self.phone.length > 6
  }
  this.save = function () {
    return new Promise(function (resolve, reject) {
      self.validate().then(function () {
        connector.apiAsync('POST', '/schools', self.toJSON())
        .then(resolve)
        .catch(({responseJSON}) => reject(responseJSON.msg))
      }).catch(function (err) {
        reject(err)
      })
    })
  }
}

</script>
