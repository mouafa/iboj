<style>

#app {
  height: 100%;
  background-image: url('../../assets/cover-4.jpg');
  background-repeat: no-repeat;
  background-size: cover !important;
  min-height: 500px;
  min-width: 100%;
}

body {
  height: 100%;
}

</style>
<template>
    <div class="welcome-container fx-col fx-center-center">
      <div id="gridoverlay"></div>
        <div class="main-view">
            <div class="row m-none p-none m-t-n-lg col s12 m12 border  ">
                <div class="col m3 s3 left-container bg-gray relative">
                    <ul class="uppercase font-light text-white m-l-xs">
                        <li class="fx-row">
                            <div class="stepper-circle" :class="{'active-step': step.class=='step-1'}"><span>1</span></div>
                            <span class="m-l-sm stepper-title" :class="{'font-trans': step.class!=='step-1'}">general info</span>
                        </li>
                        <li>
                            <div class="stepper-bar"></div>
                        </li>
                        <li class="fx-row">
                            <div class="stepper-circle" :class="{'active-step': step.class=='step-2'}"><span>2</span></div>
                            <span class="m-l-sm stepper-title" :class="{'font-trans': step.class!=='step-2'}">education</span>
                        </li>
                        <li>
                            <div class="stepper-bar"></div>
                        </li>
                        <li class="fx-row">
                            <div class="stepper-circle" :class="{'active-step': step.class=='step-3'}"><span>3</span></div>
                            <span class="m-l-sm stepper-title" :class="{'font-trans': step.class!=='step-3'}">experience</span>
                        </li>
                        <li>
                          <div class=" m-t-lg center bg-gray importer">
                             <span class="text-white center font-light uppercase font-8">import resume</span>
                            <div class="m-r-sm m-t-sm center">
                               <span class="hand" @click="importData('linkedin')" ><img class="social-image" src="../../assets/linkedin.png"></span>
                                <span class="hand" @click="importData('facebook')"><img class="social-image" src="../../assets/facebook.png"></span>
                             </div>
                          </div>
                        </li>
                    </ul>

                </div>
                <div class="col m9  s9 main-body bg-white">
                    <router-view v-ref:innercomp></router-view>
                </div>
            </div>
            <div class="pull-right m-t-sm m-r-sm ">
              <button @click="next" class="btn-floating btn-large waves-effect font-8 waves-light bay-leaf">Next<i class="material-icons">chevron_right</i></button>
            </div>
        </div>
    </div>
</template>

<script>
require('./welcome.less')
var appConfig = require('webpack-config-loader!src/main.config.js')
import {loadProfile} from 'store/profile/actions.profile'

module.exports = {
  vuex: {
    actions: {
      loadProfile
    }
  },
  data () {
    return {
      step: {
        index: 1,
        class: 'step-1'
      },
      routes: ['about', 'education', 'work']
    }
  },
  ready () {
    this.stepIndication()
    this.loadProfile()
    $(function () {
      var x = $('.main-body').height()
      $('.left-container').height(x)
    })
  },
  route: {
    data () {
      this.stepIndication()
    }
  },
  methods: {
    next () {
      let vm = this
      this.$refs.innercomp.next().then((res) => {
        vm.nextPage()
      }, (err) => console.log(err))
    },
    nextPage: function () {
      let _i = this.step.index

      if (_i > this.routes.length - 1) window.location.replace(window.location.origin + '/profile.html')
      else {
        let _nextPage = this.routes[_i]
        this.$route.router.go({name: _nextPage})
      }
    },
    stepIndication: function (_i_) {
      let newIndex = _i_ || this.routes.indexOf(this.$route.name) + 1
      this.step.index = newIndex
      this.step.class = 'step-' + newIndex
    },
    importData (field) {
      window.location.href = appConfig.apiBaseUrl + '/import/' + field + '/auth'
    }
  }
}

</script>
