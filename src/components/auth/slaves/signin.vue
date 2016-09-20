<style lang="less" scoped>
.social-logo{
  width: 40px;
  opacity: .5;
  margin-left: 8px;
}

.card {
  background-color: rgba(255,255,255,.9);
}

.btn-warning2{
  width: 80%;
}
.main-logo{
  width: 56px;
}
.email-error-icon{
  margin-top: 15px !important;
}
.password-input{
  border-top: none !important;
}
</style>

<template>
  <div class="login-container card">
    <div class=" fx-col fx-start-center p-lg p-b-none">
      <slot></slot>
      <div class="panel-body m-t-md w-min-300 ">
        <validator name="siginform">
          <form novalidate @submit.prevent="validate" >

          <div class="center m-b-md ">
                <span class="left font-light" v-if="($siginform.email.invalid && showErrors)  ">Email {{$siginform.email.email}}</span>
                <div class="m-none p-none  input-field font-light">
                  <!-- <label :class="{'active': email}" for="email" class="required" >Email</label> -->

                  <input v-validate:email="['required','email']" type="email" placeholder="Email*" v-model="email" name="email" id="email" class="form-control input-box">
                  <div v-if="$siginform.email.invalid && showErrors" class="error-hint">
                    <i class="material-icons email-error-icon">error</i>
                  </div>
                </div>
                <div class="m-none p-none input-field font-light">
                  <!-- <label for="password" :class="{'active': password}"  class="required">Password</label> -->
                  <input v-validate:password="{'required':true}" type="password" placeholder="Password*"  required="" v-model="password" name="password" id="password" class="form-control input-box password-input">
                   <div v-if="$siginform.password.invalid && showErrors" class="error-hint">
                      <i class="material-icons">error</i>
                      <span class="left" v-if="$siginform.password.required">password {{$siginform.password.required}}</span>
                    </div>
                </div>
          </div>
            <!-- <div class="text-danger m-b-xs error fx-col">
              <span class="m-b-xs">{{error}}</span>
              <validator-errors :component="'errors-list'" :validation="$siginform"></validator-errors>
            </div> -->
            <div class="row">
              <span class="">
                 <input type="checkbox" class="filled-in" v-model="remember" name="remember" id="remember" />
                 <label class="font-light font-9" for="remember">Remember me</label>
               </span>

            </div>
            <div class="row center m-t-sm m-b-sm">
              <button type="submit" :class="{ 'disabled': isLoading }" class="btn btn-warning2 capital " name="login" v-ii18n="login">Login</button>
            </div>
          </form>
        </validator>
        <div class="text-danger capital font-1-2 m-b-xs m-t-sm m-r-lg error center" v-if="error">
            <i class="material-icons red600">error</i>
            <span class="">{{error}}</span>
        </div>

          <div class="m-t-md center" >
            <span class="hand" @click="twitterSinup"><img class="social-logo" src="../../../assets/twitter.svg"></span>
            <span class="hand" @click="facebookSinup" ><img class="social-logo" src="../../../assets/facebook.svg"></span>
            <span  class="hand" @click="googleSinup" ><img class="social-logo" src="../../../assets/google-plus.svg"></span>
          </div>


      </div>
      <!-- <i class="fa fa-2x fa-twitter-square hand m-t-sm"></i> -->
    </div>
    <div class="font-light capital font-9 bg-gray p-sm">
      <a v-link="'auth/reset'" name="reset" class="text-white"><span   v-ii18n="forgotPassword">Forgot Password ?</span></a>
      <a v-link="'auth/register'" name="reset" class="right text-white"><span v-ii18n="register"></span>Register</a>
    </div>
  </div>
</template>

<script>
var connector = require('services/connect.js')
var appConfig = require('webpack-config-loader!src/main.config.js')
// import notify from 'services/notifs-center'
import {loadConnexion} from 'store/account/actions.account'
module.exports = {
  vuex: {
    actions: {
      loadConnexion
    }
  },
  data () {
    return {
      email: '',
      password: '',
      remember: true,
      isLoading: false,
      error: '',
      showErrors: false
    }
  },
  created () {
    this.loadConnexion()
    .then(() => {
      window.location = window.location.origin
    })
  },
  methods: {
    validate () {
      this.showErrors = false
      let errors = this.$siginform.errors
      if (errors && errors.length) this.showErrors = true
      else this.login()
    },
    login () {
      this.isLoading = true
      var Cookies = require('services/cookie')
      var vm = this
      var data = {
        identifier: vm.email,
        password: vm.password
      }
      if (vm.remember) data.remember = vm.remember
      connector.apiCall(data, '/auth/local', 'POST', (err, response) => {
        vm.isLoading = false
        if (err) {
          vm.error = err.responseJSON.msg
          return
        }
        if (vm.remember) Cookies.set('token', response.token, { expires: 365 })
        window.localStorage.setItem('auth', true)
        vm.redirect()
      })
    },
    redirect () {
      this.redirect = this.$root.$route.query.redirect
      if (this.redirect) {
        $(window.location).attr('href', this.redirect)
      } else $(window.location).attr('href', window.location.origin)
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
