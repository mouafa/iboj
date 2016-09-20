<style lang="less" scoped>
#eye-icon {
  position: absolute;
  top: 15px;
  right: -30px;
}
.main-logo{
  width: 56px;
}
.input-field {
  position: relative;
}
.error-hint{
  margin-bottom: 20px;
  .material-icons {
    position: absolute;
    top: 12px;
    right: 10px;
    color: red;
  }
  span {
    display: block;
    text-transform: capitalize;
    // color: red;
  }
}
*{
  font-weight: 300;
}
.card {
  background-color: rgba(255,255,255,.9);
}
</style>

<template>
<div class="fx-col fx-center-center">
  <div class="register-container">
    <div class="fx-col fx-start-center card p-lg">
      <slot></slot>
      <img class="main-logo" src="../../assets/jobi_logo.svg">
      <div class="panel-body w-min-300">
        <validator name="sigupform">
          <form novalidate @submit.prevent="validate">
            <div class="m-r-lg row">
              <div class="input-field" v-if="!query.firstname">
                <label :class="{'active': firstname}"  for="firstname" class="required">First Name</label>
                <input v-validate:firstname="{required:true, minlength: 3, maxlength: 32}" type="text"  name="firstname" class="form-control " v-model="firstname" id="firstname">
                <div v-if="$sigupform.firstname.invalid && showErrors" class="error-hint">
                  <i class="material-icons">error</i>
                  <!-- <span v-if="$sigupform.firstname.required">firstname {{$sigupform.firstname.required}}</span> -->
                  <span v-if="$sigupform.firstname.minlength">firstname {{$sigupform.firstname.minlength}}</span>
                  <span v-if="$sigupform.firstname.maxlength">firstname {{$sigupform.firstname.maxlength}}</span>
                </div>
              </div>
              <div class="input-field" v-if="!query.lastname">
                <label :class="{'active': lastname}"  for="lastname" class="required">Last Name</label>
                <input v-validate:lastname="{required:true, minlength: 3, maxlength: 32}" type="text" id="lastname" name="lastname" class="form-control " v-model="lastname">
                <div v-if="$sigupform.lastname.invalid && showErrors" class="error-hint">
                  <i class="material-icons">error</i>
                  <!-- <span v-if="$sigupform.lastname.required">lastname {{$sigupform.lastname.required}}</span> -->
                  <span v-if="$sigupform.lastname.minlength">lastname {{$sigupform.lastname.minlength}}</span>
                  <span v-if="$sigupform.lastname.maxlength">lastname {{$sigupform.lastname.maxlength}}</span>
                </div>
              </div>
            </div>
            <div class="m-r-lg input-field" v-if="!query.email">
              <label :class="{'active': email}"  for="email" class="required">Email</label>
              <input v-validate:email="['required','email']" type="email" id="email"  name="email-register" class="form-control" v-model="email">
              <div v-if="$sigupform.email.invalid && showErrors" class="error-hint">
                <i class="material-icons">error</i>
                <span v-if="$sigupform.email.email">email {{$sigupform.email.email}}</span>
              </div>
            </div>
            <div class="row">
            <button type="submit" class="btn btn-success btn-block col s8 offset-s2" :class="{ 'disabled': isLoading }" name="register">Register</button>
          </div>
          </form>
        </validator>
        <div class="text-danger capital font-1-2 m-b-xs m-t-md  error center" v-if="error">
          <i class="material-icons red600">error</i>
          <span class="">{{error}}</span>
        </div>
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
      firstname: '',
      lastname: '',
      email: '',
      query: {
        'firstname': '',
        'lastname': '',
        'email': ''
      },
      showpassword: false,
      error: '',
      showErrors: false,
      isLoading: false
    }
  },
  ready () {
    this.query.identifier = this.$route.query.identifier
    connector.apiCall('', '/auth/complet/' + this.query.identifier, 'GET', (err, response) => {
      if (err) {
        window.location = window.location.origin + '/auth.html'
      }
      this.query.email = response.email
      this.query.firstname = response.firstname
      this.query.lastname = response.lastname
    })
  },
  methods: {
    validate () {
      if (this.isLoading == false) {
        let errors = this.$sigupform.errors
        if (errors && errors.length) this.showErrors = true
        else this.signup()
      }
    },
    signup () {
      this.isLoading = true
      var vm = this
      var data = {
        identifier: this.query.identifier,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email
      }
      vm.error = ''
      connector.apiCall(data, '/auth/complet', 'POST', (err, response) => {
        vm.isLoading = false
        if (err) {
          vm.error = err.responseJSON.msg
          return
        }
        window.localStorage.setItem('auth', true)
        $(window.location).attr('href', window.location.origin + '/welcome.html')
      })
    }
  }
}

</script>
