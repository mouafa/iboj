<style>
.card {
  background-color: rgba(255,255,255,.9);
}

</style>
<template>
<div id="gridoverlay"></div>
    <div class="reset-container fx-col fx-center-center card m-none p-lg">
      <div class="hpanel fx-col fx-start-center">
          <slot></slot>
          <div class="panel-body p-m">
            <h6 class="m-t-sm m-b-sm capital center" v-ii18n="reset password">reset password</h6>
              <validator name="resetform">
                <form novalidate @submit.prevent="validate">
                  <div class="m-r-lg input-field">
                    <!-- <label for="email" class="required">Email address</label> -->
                    <input v-validate:email="['email','required']" type="email" class="form-control input-box" placeholder="Email*" v-model="email" name="email" id="email">
                      <div v-if="$resetform.email.invalid && showErrors" class="error-hint">
                       <i class="material-icons">error</i>
                       <span v-if="$resetform.email.email">email {{$resetform.email.email}}</span>
                      </div>
                    <div class="g-recaptcha" data-sitekey="6Lf2WCATAAAAALHLQK1jaSMfmst8QxCQrS76scZo"></div>
                  </div>
                  <div class="text-right row">
                    <button type="submit" :class="{ 'disabled': isLoading }" class="btn btn-warning2 font-light capital btn-block col s8 offset-s2 m-t-sm" name="reset" v-ii18n="resetPassword">reset password</button>
                  </div>
                </form>
              </validator>
​              <div class="text-danger capital font-1-2 m-b-xs m-t-sm  error center" v-if="error">
                <i class="material-icons red600">error</i>
                <span class="">{{error}}</span>
              </div>
              <div v-if="success" name="check" class="text-success">
                <h5 class="capital center" v-ii18n="CheckYourEmail">please check your email</h5>
              </div>
          </div>
      </div>
    </div>
</template>
​
<script>
var connect = require('services/connect.js')

module.exports = {
  data () {
    return {
      email: null,
      error: '',
      success: false,
      token: null,
      password: null,
      showpassword: false,
      isLoading: false,
      successMsg: '',
      showErrors: false
    }
  },
  ready () {
    connect.script('https://www.google.com/recaptcha/api.js')
    .done(() => console.log('tadam'))
  },
  methods: {
    validate () {
      let errors = this.$resetform.errors
      if (errors && errors.length) this.showErrors = true
      else this.reset()
    },
    reset () {
      this.isLoading = true
      let vm = this
      let data = {
        email: vm.email,
        captcha: $('#g-recaptcha-response').val()
      }
      connect.apiCall(data, '/auth/reset', 'POST', (err, resp) => {
        vm.isLoading = false
        if (err) {
          vm.error = err.responseJSON.msg
          return
        } else {
          vm.success = true
          vm.error = ''
        }
      })
    }
  }
}
</script>
