<style lang="less" scoped>
.latest-messages-container {
  min-height: 425px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  .section-title {
    margin: 0;
    padding: 10px 0 15px 0;
    color: #666;
    font-size: 1.2em;
    text-align: center;
  }
  .chart-container {
    min-height: 160px;
  }
  .checkboxes-container {
    padding: 0 20px 20px 20px;
    [type="checkbox"]:not(:checked):disabled+label:before {
      background-color: rgba(0, 0, 0, 0);
      border: 2px solid #5A5A5A;
    }
    [type="checkbox"]:not(:checked):disabled+label:hover:before {
      /*cursor: auto;*/
    }
    label {
      font-size: .9em;
    }
    div{
      margin-bottom: 5px;
    }
  }
  .appear-transition {
    transition: all .3s ease;
  }
  .appear-enter, .appear-leave {
    opacity: 0;
    transform: scale(0.2);
  }
}
</style>

<template>
<section>
  <div class="latest-messages-container">
    <p class="section-title">Profile Completion</p>
    <div id="profileCompletionGauge" class="chart-container" transition="appear"></div>
    <div class="checkboxes-container">
      <form>
        <div @click="openModal('img')">
          <input type="checkbox" id="profile-picture" :checked="haveImage" disabled="disabled" />
          <label for="profile-picture">Profile Picture</label>
        </div>
        <div @click="openModal('abt')">
          <input type="checkbox" id="about" :checked="haveAbout" disabled="disabled" />
          <label for="about" >About</label>
        </div>
        <div @click="openModal('exp')">
          <input type="checkbox" id="experience" :checked="haveExperience" disabled="disabled" />
          <label for="experience">Experience</label>
        </div>
        <div @click="openModal('edu')">
          <input type="checkbox" id="education" :checked="haveEducation" disabled="disabled" />
          <label for="education">Education</label>
        </div>
        <div @click="openModal('cus')">
          <input type="checkbox" id="custom-section" :checked="haveCustomSections" disabled="disabled" />
          <label for="custom-section">Custom Section</label>
        </div>
      </form>
    </div>
  </div>
  <modal :show.sync="showModal">
    <div class="m-b-md m-t-md p-l-lg p-r-lg" slot="body">
      <div class="m-b-xs capital" v-if="modalType === 'edu' || modalType === 'exp'">
        <education v-if="modalType === 'edu'"></education>
        <experience v-if="modalType === 'exp'"></experience>
      </div>
      <div v-if="modalType === 'cus'" class="m-none p-none p-l-xs m-t-xs">
        <custom-section :editmode="editmode" :categories="customsectionscategories" :profile-id='profileId'></custom-section>
      </div>
      <div v-if="modalType === 'img'" class="m-t-lg p-t-lg p-l-xs m-t-xs fx">
        <div @click="uploadImage" :class="{'progres' : loading}" class="m-r-sm fx-row fx-center-center">
          <div class="size-64 uploader">
            <img :src="aboutData.img  " class="user-image circle size-64" alt="logo">
          </div>
        </div>
      </div>
    </div>
    <div class="row" slot="footer">
      <button @click="closeModal" class="btn waves-effect waves-light pull-right m-t-sm m-r-sm">
        Close
      </button>
    </div>
  </modal>
  <about-modal v-ref:modal-about></about-modal>
</section>
</template>

<script>
let modal = require('shared/modal.vue')
var resume = require('home/slaves/apply.resume.vue')
let education = require('home/slaves/apply.education.vue')
let experience = require('home/slaves/apply.experience.vue')
var aboutModal = require('profile/slaves/about/about.modal.vue')
var customSection = require('profile/slaves/custom-section/custom-section.container.vue')

require('amcharts/amcharts/amcharts')
require('amcharts/amcharts/gauge')
require('amcharts/amcharts/serial')
require('amcharts/amcharts/themes/light')

import {profileAbout} from 'store/profile/getters.profile'
import {loadProfile, setProfileImg} from 'store/profile/actions.profile'

module.exports = {
  vuex: {
    actions: {
      loadProfile,
      setProfileImg
    },
    getters: {
      aboutData: profileAbout
    }
  },
  data () {
    return {
      profile: {},
      showModal: false,
      modalType: '',
      completion: 0,
      chart: {}
    }
  },
  computed: {
    percentMargin () {
      let vm = this
      if (vm.completion === 100) return -47
      if (vm.completion < 10) return -20
      return -35
    },
    haveImage () {
      let vm = this
      return vm.aboutData.img
    },
    haveAbout () {
      let vm = this
      if (!vm.aboutData.about) return false
      return vm.aboutData.about.length > 0
    },
    haveExperience () {
      let vm = this
      return vm.profile.experience && vm.profile.experience.length > 0
    },
    haveEducation () {
      let vm = this
      return vm.profile.education && vm.profile.education.length > 0
    },
    haveCustomSections () {
      let vm = this
      let custom = false
      if (vm.profile.customsectionscategories && vm.profile.customsectionscategories.length > 0) {
        vm.profile.customsectionscategories.map((category) => {
          if (category.customsections && category.customsections.length > 0) custom = true
        })
      }
      return custom
    }
  },
  ready () {
    let vm = this
    vm.loadProfile()
    .then((res) => {
      vm.profile = res
      vm.profileCompletion()
      vm.onAmchartsReady()
    })
    vm.$watch('profile', () => {
      vm.profileCompletion()
    }, {deep: true})
    vm.$watch('account', () => {
      vm.profileCompletion()
    }, {deep: true})
    vm.$watch('aboutData', () => {
      vm.profileCompletion()
    }, {deep: true})
  },
  components: {
    modal,
    resume,
    education,
    experience,
    aboutModal,
    customSection
  },
  methods: {
    toggle () {
      this.isToggled = !this.isToggled
    },
    profileCompletion () {
      let vm = this
      let item = 0
      let custom = false
      if (vm.profile) {
        if (vm.aboutData.img) item++
        if (vm.aboutData.about && vm.aboutData.about !== '') item++
        if (vm.profile.customsectionscategories && vm.profile.customsectionscategories.length > 0) {
          vm.profile.customsectionscategories.map((category) => {
            if (category.customsections && category.customsections.length > 0) custom = true
          })
          if (custom) item++
        }
        if (vm.profile.experience && vm.profile.experience.length > 0) item++
        if (vm.profile.education && vm.profile.education.length > 0) item++
      }
      vm.completion = item * 20
      if (vm.chart.validateNow) {
        vm.buildProfileCompletionGauge()
      }
    },
    openModal (type) {
      let vm = this
      switch (type) {
        case 'abt':
          vm.$refs.modalAbout.show(vm.aboutData)
          return
        case 'exp':
          vm.modalType = 'exp'
          break
        case 'img':
          vm.modalType = 'img'
          break
        case 'edu':
          vm.modalType = 'edu'
          break
        case 'cus':
          vm.modalType = 'cus'
          break
        default:
          vm.modalType = ''
      }
      vm.showModal = true
    },
    closeModal () {
      let vm = this
      vm.showModal = false
    },
    uploadImage () {
      var vm = this
      vm.loading = true
      window. photolia.openDialog(null, {
        imagesOnly: true,
        crop: '300x300'
      })
      .done((file) => file.done((fileInfo) => vm.upload(fileInfo))
                          .fail((error, fileInfo) => vm.upload(null, error)))
      .fail(() => (vm.loading = false))
    },
    upload (fileInfo, error) {
      let vm = this
      if (fileInfo) vm.setProfileImg(fileInfo.cdnUrl)
      else console.warn(error)
      vm.loading = false
    },
    onAmchartsReady () {
      let vm = this
      if (!window.AmCharts) return setTimeout(() => vm.onAmchartsReady(), 500)
      vm.buildProfileCompletionGauge()
    },
    onChartInit (event) {
      let $ = window.jQuery
      $(`#${event.chart.div.id}`).find('a').toggle()
    },
    buildProfileCompletionGauge () {
      let vm = this
      vm.chart = window.AmCharts.makeChart('profileCompletionGauge', { // eslint-disable-line no-unused-vars
        'type': 'gauge',
        'fontFamily': 'Roboto',
        'fontWeight': '300',
        'theme': 'light',
        'marginLeft': 17,
        'marginRight': 17,
        'axes': [{
          'axisAlpha': 0,
          'tickAlpha': 0,
          'labelsEnabled': false,
          'startValue': 0,
          'endValue': 100,
          'startAngle': 0,
          'endAngle': 360,
          'labelOffset': 45,
          'bands': [{
            'color': '#eee',
            'startValue': 0,
            'endValue': 100,
            'radius': '100%',
            'innerRadius': '98%'
          }, {
            'color': '#06a2c4',
            'startValue': 0,
            'endValue': vm.completion,
            'radius': '100%',
            'innerRadius': '98%'
          }]
        }],
        'allLabels': [ {
          'text': vm.completion,
          'size': 50,
          'bold': false,
          'color': '#BBBBBB',
          'align': 'center',
          'y': 45,
          'x': 5
        }, {
          'text': '%',
          'size': 24,
          'bold': false,
          'color': '#BBBBBB',
          'align': 'center',
          'y': 70,
          'x': vm.percentMargin
        }],
        'listeners': [{'event': 'drawn', 'method': vm.onChartInit}]
      })
    }
  }
}
</script>
