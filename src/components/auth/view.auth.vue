<style lang="less">
.login-container {
  .panel-body{
    border: none !important
  }
  .main-logo{
    width: 56px;
  }
}
 
</style>
<template>
<div id="gridoverlay"></div>
<div class="fx-col fx-center-center">
  <signin>
    <!-- <object class="logo" data="../../assets/logo.svg" type="image/svg+xml"> </object> -->
    <img class="main-logo " src="../../assets/jobi_logo.svg">
  </signin>
</div>
</template>

<script>
var signin = require('auth/slaves/signin.vue')
// var signup = require('auth/slaves/signup.vue')

module.exports = {
  components: {
    signin: signin
    // signup: signup
  }
}

</script>
