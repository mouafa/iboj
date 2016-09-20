<style>
.main-logo{
  width: 56px;
}
</style>
<template>
<div class="fx-col fx-center-center">
  <component :is="currentView">
    <!-- <object class="logo" data="../../assets/logo.svg" type="image/svg+xml"> </object> -->
    <img class="logo main-logo" src="../../assets/jobi_logo.svg">
  </component>
  <div class="font-light capital font-9 bg-gray p-sm relative">
      <a href="/auth.html" name="reset" class="text-white"><span   v-ii18n="login">Login</span></a>
    <a href="/auth.html#!/auth/register"  name="reset" class=" right text-white"><span v-ii18n="register"></span>Register</a>
  </div>
</div>
</template>

<script>
var step1 = require('auth/slaves/reset.step1.vue')
var step2 = require('auth/slaves/reset.step2.vue')

module.exports = {
  components: {
    step1,
    step2
  },
  data () {
    return {
      currentView: ''
    }
  },
  ready () {
    this.token = this.$root.$route.query.token
    if (this.token) this.currentView = 'step2'
    else this.currentView = 'step1'
  }
}

</script>
