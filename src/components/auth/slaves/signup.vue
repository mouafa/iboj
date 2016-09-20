<style lang="less" scoped>
#eye-icon {
  position: absolute;
  top: 15px;
  right:-30px;
}
.social-logo{
  width: 40px;
  opacity: .5;
  margin-left: 8px;
}

.main-logo{
  width: 56px;
}
*{
  font-weight: 300;
}
.card {
  background-color: rgba(255,255,255,.9);
}
.border-top-none {
  border-top: none !important;
}
.password-container{
  position: relative;
}

.pwd-icon{
  position: absolute;
  left: 2px;
  top: 15px;
}
.email-icon{
  position: absolute;
  left: 4px;
  top: 15px;
}
</style>

<template>
<div id="gridoverlay"></div>
<div class="fx-col fx-center-center  ">
  <div class="register-container">
    <div class="fx-col fx-start-center card p-none m-none ">
      <slot></slot>

      <img class="main-logo m-t-lg" src="../../../assets/jobi_logo.svg">
      <div class="panel-body w-min-400 p-l-lg p-r-lg">
        <validator name="sigupform">
          <form novalidate @submit.prevent="validate">
            <div class="m-r-lg m-t-lg row">
              <div class="relative ">
                <!-- <label :class="{'active': firstname}"  for="firstname" class="required">First Name</label> -->
                <input v-validate:firstname="{required:true, minlength: 3, maxlength: 32}" placeholder="First Name*"  name="firstname" class="form-control input-box"  v-model="firstname" id="firstname">
                <div v-if="$sigupform.firstname.invalid && showErrors" class="error-hint">
                  <i class="material-icons">error</i>
                  <!-- <span v-if="$sigupform.firstname.required">firstname {{$sigupform.firstname.required}}</span> -->
                  <span v-if="$sigupform.firstname.minlength">firstname {{$sigupform.firstname.minlength}}</span>
                  <span v-if="$sigupform.firstname.maxlength">firstname {{$sigupform.firstname.maxlength}}</span>
                </div>
              </div>
              <div class="relative ">
                <!-- <label :class="{'active': lastname}"  for="lastname" class="required">Last Name</label> -->
                <input v-validate:lastname="{required:true, minlength: 3, maxlength: 32}"   id="lastname" name="lastname" placeholder="Last Name*" class="form-control input-box border-top-none" v-model="lastname">
                <div v-if="$sigupform.lastname.invalid && showErrors" class="error-hint">
                  <i class="material-icons">error</i>
                  <!-- <span v-if="$sigupform.lastname.required">lastname {{$sigupform.lastname.required}}</span> -->
                  <span v-if="$sigupform.lastname.minlength">lastname {{$sigupform.lastname.minlength}}</span>
                  <span v-if="$sigupform.lastname.maxlength">lastname {{$sigupform.lastname.maxlength}}</span>
                </div>
              </div>
            </div>
            <div class="m-r-lg relative ">
              <!-- <label :class="{'active': email}"  for="email" class="required">Email</label> -->
              <input v-validate:email="['required','email']" type="email" id="email" placeholder="Email*" name="email-register" class="form-control input-box border-top-none p-l-lg" v-model="email">

              <i class="material-icons email-icon md-18 orange600">&#xE0E1;</i>
              <div v-if="$sigupform.email.invalid && showErrors" class="error-hint">
                <i class="material-icons">error</i>
                <span v-if="$sigupform.email.email">email {{$sigupform.email.email}}</span>
              </div>
            </div>
            <div class="m-r-lg ">
              <div class="relative ">
                <!-- <label :class="{'active': password}"  for="password" class="required">Password</label> -->
                <input v-validate:password="{'required':true, minlength:6, maxlength:20}"  :type="showpassword ? 'text' : 'password'" placeholder="Password" value="" id="" name="password-register" class="form-control input-box border-top-none p-l-lg" v-model="password">
                <i class="material-icons pwd-icon md-18 orange600">&#xE899;</i>
                <i v-if="!showpassword" id="eye-icon" class="material-icons hand  " :title="showpassword" @click="showpassword=true">&#xE417;</i>
                <i v-if="showpassword" id="eye-icon" class="material-icons hand  " :title="showpassword" @click="showpassword=false">&#xE8F5;</i>
                <div v-if="$sigupform.password.invalid && showErrors" class="error-hint">
                  <i class="material-icons">error</i>
                  <span v-if="$sigupform.password.minlength">password {{$sigupform.password.minlength}}</span>
                  <span v-if="$sigupform.password.maxlength">password {{$sigupform.password.maxlength}}</span>
                </div>
              </div>
            </div>
            <div class="row">
            <button type="submit" class="btn  btn-warning2  btn-block col s8 offset-s2 m-t-sm" :class="{ 'disabled': isLoading }" name="register">Register</button>
          </div>
          </form>
        </validator>
         <div class="text-danger capital font-1-2 m-b-xs m-t-md  error center" v-if="error">
            <i class="material-icons red600">error</i>
            <span class="">{{error}}</span>
        </div>
        <div class="m-r-sm m-t-md center m-b-md">
          <span class="hand" @click="twitterSinup"><img class="social-logo" src="../../../assets/twitter.svg"></span>
          <span class="hand" @click="facebookSinup" ><img class="social-logo" src="../../../assets/facebook.svg"></span>
          <span  class="hand" @click="googleSinup" ><img class="social-logo" src="../../../assets/google-plus.svg"></span>
        </div>

      </div>
    </div>
    <div class="font-light capital font-9 bg-gray p-sm relative">
        <a href="/auth.html#!/auth/reset" name="reset" class="text-white"><span   v-ii18n="forgotPassword">Forgot Password ?</span></a>
      <a href="/auth.html"  name="reset" class=" right text-white"><span v-ii18n="haveaccountlogin"></span>Have Account? Click to login</a>
    </div>
  </div>

</div>
</template>

<script>
var connector = require('services/connect.js')
// import notify from 'services/notifs-center'
import {loadConnexion} from 'store/account/actions.account'
var appConfig = require('webpack-config-loader!src/main.config.js')
module.exports = {
  vuex: {
    actions: {
      loadConnexion
    }
  },
  data () {
    return {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      showpassword: false,
      error: '',
      showErrors: false,
      isLoading: false
    }
  },
  // created () {
  //   this.loadConnexion()
  //   .then(() => {
  //     window.location = window.location.origin
  //   })
  // },
  methods: {
    validate () {
      let errors = this.$sigupform.errors
      if (errors && errors.length) this.showErrors = true
      else this.signup()
    },
    signup () {
      this.isLoading = true
      var vm = this
      var data = {
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        password: this.password
      }
      vm.error = ''
      connector.apiCall(data, '/auth/local/register', 'POST', (err, response) => {
        vm.isLoading = false
        if (err) {
          vm.error = err.responseJSON.msg
          return
        }
        window.localStorage.setItem('auth', true)
        $(window.location).attr('href', window.location.origin + '/welcome.html')
      })
    },
    twitterSinup () {
      window.location.href = appConfig.apiBaseUrl + '/auth/twitter'
    },
    facebookSinup () {
      window.location.href = appConfig.apiBaseUrl + '/auth/facebook'
    },
    googleSinup () {
      window.location.href = appConfig.apiBaseUrl + '/auth/google'
    }
  }
}

</script>
