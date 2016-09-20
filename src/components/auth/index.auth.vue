<style lang="less">
#app {
  height: 100%;
  background-image: url('../../assets/cover-1.jpg');
  background-repeat: no-repeat;
  background-size: cover !important;
  min-height: 500px;
  min-width: 100%;
}

body {
  height: 100%;
}
.auth-view {
    height: 100%;

    footer {
      position: relative;
      background-color: rgba(255, 255,255, .8);;
      max-height: 40px;
    }
    a {
      font-size: 14px;
       text-decoration: none !important;
       color: #337ab7;
    }
    a:hover {
      text-decoration: underline !important;
      color: #23527c;
    }
    .input-field {
      position: relative;
    }
   .error-hint{
     .material-icons {
        position: absolute;
        top: 12px;
        right: 10px;
        color: red;
      }
    span {
      display: block;
      text-transform: capitalize;
    }
  }
}

</style>

<template>
  <div class="auth-view fx-col font-9">
    <div class="row main m-none fx-row fx-center-start" flex>
      <router-view ></router-view>
    </div>
    <footer>
      <div class="container ">
        <p class="text-muted">
          <strong>JOBI </strong>
          <span class="capital" v-ii18n="millionsOfRecruiters"></span>
          <span class="pull-right"> 2016 TunpiXel</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import {isAuthed} from 'store/account/getters.account'

module.exports = {
  vuex: {
    getters: {
      isAuthed
    }
  },
  data () {
    return {
      currentView: ''
    }
  }
}

</script>
