<style lang="less" scoped>
  li {
    border-radius: 50%;
    display: inline-block;
    height: 50px;
    width: 50px;
    position: relative;
    background-color: #9d9fa2;
    transform: scale(0.4);
   }
    .current {
       background-color: #F5F5F5;
       transform: scale(0.6);
   }
</style>
<template>
  <modal :show.sync="showModal">
    <div class="m-b-md m-t-md p-l-lg p-r-lg" slot="body">
      <div class="m-b-xs capital" v-if="step==1 || step==2">
        <div class="m-b-xs capital row">
             <div class="col s1 m-t-md"> <i class="material-icons md-20 orange600">info</i></div>
             <div  class="empty-data p-sm word-wrapper col s10">
                 <span>In order for your Application to go through, you need to have at least one experience and one education record.</span>
              </div>
          </div>
        <education :error.sync="error"  v-if="step==1"></education>
        <experience :error.sync="error"  v-if="step==2"></experience>
      </div>
      <resume :cv.sync="cv" v-if="step==3"></resume>
      <div v-if="step==4">
        <h5 class="capital font-1-5 p-t-sm p-b-lg">Matching with the requirements.</h5>
        <div v-for="requirement in requirements" trak-by="$index" class="h-max-250 p-none" v-if="requirements && requirements.length">
            <p class="input-container m-r-md border-bottom p-b-sm m-t-md">
              <input type="checkbox" id="requirement-{{$index}}" v-model="requirementsValues[$index]" />
              <label for="requirement-{{$index}}">{{requirement}}</label>
            </p>
        </div>
      </div>
      <div v-if="step==5 && questions && questions.length">
        <h5 class="capital font-1-5 p-t-sm" v-ii18n="quiz">quiz</h5>
        <div v-for="question in questions" trak-by="$index" class="h-max-250 p-none" v-if="showModal">
          <question :index="$index" :question="question" :answer.sync="answers[$index]"></question>
        </div>
      </div>
      <div v-if="error" class="empty-data m-t-lg  p-sm word-wrapper">
        <i class="material-icons md-18 m-b-xs red600">warning</i>
        <span class="text-danger capital font-light font-1-2 m-l-sm">{{error}}</span>
      </div>
    </div>
   </div>
    <div class="row" slot="footer">
      <div class="m-t-sm col s2">
        <button  @click="close" class="btn-flat btn btn-info font-light font-1-2 text-white btn btn-outline"v-ii18n="cancel">cancel</button>
      </div>
      <ul class="m-t-n-xxs col s6 offset-s2 fx-row">
          <li v-for="item in 5" class="m-r-n-md" :class="{'current':step==item + 1}"></li>
      </ul>
    <button @click="next" class="btn-floating waves-effect waves-light bay-leaf pull-right m-t-xs m-r-lg"><i class="material-icons">chevron_right</i></button>
    </div>
  </modal>
</template>

<script>
var modal = require('shared/modal.vue')
var question = require('./apply.questions.vue')
var experience = require('./apply.experience.vue')
var education = require('./apply.education.vue')
var resume = require('./apply.resume.vue')
var connector = require('services/connect.js')
var bus = require('services/bus.js')
import { loadJoboffer, resetJoboffer } from 'store/joboffer/actions.joboffer'
import { getJobofferData } from 'store/joboffer/getters.joboffer'
import {loadProfile} from 'store/profile/actions.profile'
import {profileData} from 'store/profile/getters.profile'

module.exports = {
  vuex: {
    actions: {
      loadJoboffer,
      resetJoboffer,
      setJApply: ({ dispatch }) => dispatch('SET_JOBOFFER_APPLY'),
      setTApply: ({ dispatch }, id) => dispatch('SET_TIMELINE_APPLY', id),
      loadProfile
    },
    getters: {
      joboffer: getJobofferData,
      questions: (state) => state.joboffer.data.applicationQuestions,
      requirements: (state) => state.joboffer.data.requirements,
      profile: profileData
    }
  },
  data () {
    return {
      isLoading: false,
      showModal: false,
      error: null,
      answers: [],
      requirementsValues: [],
      authorised: true,
      nextstep: false,
      step: 1,
      cv: null
    }
  },
  components: {
    modal,
    question,
    experience,
    education,
    resume
  },
  ready () {
    this.loadProfile()
    bus.$on('joboffer:apply', this.show)
  },
  destroyed () {
    bus.$off('joboffer:apply')
  },
  methods: {
    show (joboffer) {
      var vm = this
      var id = joboffer.slug ? joboffer.slug : joboffer.uuid
      this.isLoading = true
      this.reset()
      this.loadJoboffer(id)
      .then(() => {
        vm.showModal = true
      })
    },
    sendApply () {
      var application = { joboffer_id: this.joboffer.id }
      var vm = this
      if (vm.questions.length) {
        application.responses = vm.questions.map((i, j) => ({ question: i.id, content: vm.answers[j] }))
      }
      if (vm.requirements && vm.requirements.length) {
        application.requirements = vm.requirements.map((i, j) => ({ title: i, value: vm.requirementsValues[j] || false }))
      }
      if (this.cv) application.cv = this.cv
      vm.isLoading = true
      this.error = null
      connector.apiAsync('POST', '/applications', application)
      .then((res) => {
        vm.isLoading = false
        vm.setJApply()
        vm.setTApply(this.joboffer.id)
        vm.close()
      })
      .catch((err) => {
        vm.error = err.responseJSON.msg
        vm.isLoading = false
      })
    },
    reset () {
      this.resetJoboffer()
      this.isLoading = false
      this.error = null
      this.answers = []
      this.requirementsValues = []
      this.step = 1
    },
    close () {
      this.reset()
      this.showModal = false
    },
    next () {
      this.error = ''
      if (!this.profile.education.length) this.error = 'You must add at least one education.'
      else if (this.step == 2 && !this.profile.experience.length) this.error = 'You must add at least one experience.'
      else if (this.step == 4) {
        if (!this.questions.length) this.sendApply()
        else this.step++
      } else if (this.step == 5) {
        this.sendApply()
      } else this.step++
    }
  }
}

</script>
