
<style lang="less" scoped>
#eye-icon{
  top: -32px;
  position: relative;
  padding: 10px 5px;
  margin: 0;
}
.card {
  background-color: rgba(255,255,255,.9);
}
</style>
<template>
<div id="gridoverlay"></div>
  <div class="reset-container fx-col fx-center-center card m-none p-lg">
    <div class="hpanel  fx-col fx-start-center">
      <slot></slot>
      <div class="panel-body p-m">
        <h5 class="m-t-md m-b-sm capital center" v-ii18n="reset password">reset password</h5>
        <validator name="resetform">
          <form novalidate @submit.prevent="validate">
            <div class="m-r-lg input-field relative">
              <!-- <label for="password" class="required">Password</label> -->
              <input v-validate:password="{'required':true,minlength:5,maxlength:20}" placeholder="Password"  :type="showpassword ? 'text' : 'password'" class="form-control  input-box" v-model="password" name="password"  id="password">
                <div v-if="$resetform.password.invalid && showErrors" class="error-hint">
                  <i class="material-icons">error</i>
                  <span v-if="$resetform.password.minlength">password {{$resetform.password.minlength}}</span>
                  <span v-if="$resetform.password.maxlength">password {{$resetform.password.maxlength}}</span>
                </div>
                <i v-if="!showpassword" id="eye-icon" class="material-icons hand  " :title="showpassword" @click="showpassword=true">&#xE417;</i>
                <i v-if="showpassword" id="eye-icon" class="material-icons hand  " :title="showpassword" @click="showpassword=false">&#xE8F5;</i>
              </div>
            <div class="text-right row">
              <button type="submit" class="btn btn-warning2 font-light capital btn-block col s8 offset-s2 " name="save" v-ii18n="changepassword">
              Change password</button>
            </div>
          </form>
        </validator>
          <div class="text-danger capital font-1-2 m-b-xs m-t-sm  error center" v-if="error">
            <i class="material-icons red600">error</i>
            <span class="">{{error}}</span>
          </div>
          <div v-if="success" name="check" class="text-success">
            <h5 class="capital center" v-ii18n="CheckYourEmail">password changed successfully</h5>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
var connector = require('services/connect.js')
module.exports = {
  data () {
    return {
      email: null,
      error: '',
      success: false,
      token: null,
      password: null,
      showpassword: false,
      showErrors: false
    }
  },
  ready () {
    this.token = this.$root.$route.query.token
  },
  methods: {
    validate () {
      let errors = this.$resetform.errors
      if (errors && errors.length) this.showErrors = true
      else this.changePassword()
    },
    changePassword () {
      let vm = this
      let data = {
        token: this.token,
        password: this.password
      }
      connector.apiCall(data, '/auth/update', 'POST', (err, resp) => {
        if (err) {
          vm.error = err.responseJSON.msg
          return
        } else {
          vm.error = ''
          vm.success = true
          setTimeout(() => {
            $(window.location).attr('href', '/auth.html')
          }, 1000)
        }
      })
    }
  }
}
</script>
