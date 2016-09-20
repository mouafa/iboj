<template>

<div class="page-container row">
  <topnav></topnav>
    <div class=" profile-details col s7 p-none m-t-lg offset-s2">
      <div class="hpanel hblue profile-panel p-none m-b-sm m-l-xs">
         <div  class="panel-body m-none p-sm">
            <div class="m-none p-none p-l-md capital">
                <i class="material-icons">&#xE8B8;</i>
                 <span class="m-l-sm" v-ii18n="experience">Account Settings</span>
            </div>
              <div class="font-light p-xs m-t-md p-t-md border-top">
                     <span class="capital font-1-2 text-orange">your current email address</span>
                      <span class="font-1-2 m-l-md"> {{account.email}}</span>
            </div>
           <div class="row">
            <div class="m-r-lg input-field col s12">
             <label for="email" class="capital">New Email</label>
              <input type="email" v-model="email" name="email" id="email">
            </div>
          </div>
          <div class="row">
            <div class="m-r-lg input-field col s12">
               <label for="currentpassword" class="required capital">current password</label>
               <input type="password"  v-model="currentpassword" id="currentpassword">
            </div>
          </div>
          <div class="row">
            <div class="m-r-lg input-field col s12">
               <label for="newpassword" class="capital">new password </label>
               <input type="password" v-model="newpassword"  id="newpassword">
            </div>
          </div>
          <div class="row">
            <div class="m-r-lg col s12">
              <div class="pull-right">
              <button  @click="save"  class="w-sm font-light btn btn-primary m-l-md font-8 uppercase">save changes</button>
          </div>
            </div>
          </div>
      </div>
  </div>
 </div>
  <bottomfooter></bottomfooter>
</div>

</template>

<script>
require('style/common/panel.less')
var topnav = require('shared/top_nav.vue')
var bottomfooter = require('shared/footer.vue')
var connector = require('services/connect.js')
import {notify} from 'store/notifs/actions.notifs'
var {accountData} = require('store/account/getters.account')

module.exports = {
  vuex: {
    actions: {
      notify
    },
    getters: {
      account: accountData
    }
  },
  data () {
    return {
      email: '',
      currentpassword: '',
      newpassword: '',
      error: ''
    }
  },
  components: {
    topnav: topnav,
    bottomfooter: bottomfooter
  },
  methods: {
    save () {
      if (this.email) this.checkEmail()
      else this.saveChange()
    },
    checkEmail () {
      var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
      if (emailPattern.test(this.email.toLowerCase().trim())) this.saveChange()
      else this.notify('error', 'email invalid.')
    },
    saveChange () {
      var vm = this
      if (!this.email && !this.newpassword) return vm.notify('error', 'you must set email or password to change it')
      if (this.newpassword && this.newpassword.length < 6) return vm.notify('error', 'password must be longer than 6 letters')
      if (this.newpassword && this.newpassword.length > 20) return vm.notify('error', 'password must be under 20 letters')
      var data = {
        newpassword: this.newpassword,
        password: this.currentpassword,
        email: this.email
      }
      connector.apiCall(data, '/auth/change', 'POST', (err, resp) => {
        if (err) {
          vm.error = err.responseJSON.msg
          vm.notify('error', vm.error)
          return
        } else {
          vm.notify('success', 'your changes have been saved successfully')
        }
      })
    }
  }
}

</script>
