<template>
<div v-show="isReady" transition="fade-in" transition-mode="out-in">
  <section class="col s8 font-9 m-b-lg">

      <form class="form-container bg-white m-b-md z-depth-1">
        <h6 class="form-head font-light">Required General Information</h6>
        <section class="row field-group m-t-md">
          <div class="col s3">
            <label class="required capital">Company</label>
          </div>
          <div class="col s9 fx-col fx-start-start">
            <div class="dropDown input-box p-none w-all">
              <div class="company-menu-button hand" data-activates="company-menu">
                <i class="material-icons right m-t-xs">arrow_drop_down</i>
                <div class="row p-xxs  bg-white-smoke sticker" v-if="joboffer.company">
                  <img :src="joboffer.company.logo" alt="logo" class="size-32 m-l-xs col s2" v-if="joboffer.company.logo">
                  <div class="size-32 inline-block col s2" v-if="!joboffer.company.logo"></div>
                  <span class="font-1-2 col s8 m-t-xs">{{joboffer.company.name}}</span>
                </div>
                <div class="row p-xxs" v-else></div>
              </div>
              <ul class="dropdown-content capital m-r-lg" id="company-menu">
                <li @click="joboffer.company = item" v-for="item in companies">
                  <div class="border-top fx-row fx-start-center ">
                    <img :src="item.logo" alt="logo" class="img-handler img-rounded size-32 m-t-sm m-b-sm m-l-sm">
                    <span class="wrrap p-l-sm">{{item.name}}</span>
                  </div>
                </li>
              </ul>
            </div>
            <span class="pull-right m-r-lg m-t-xs">
              <i class="material-icons md-14">info</i>
              <span class="text-light">You can only select companies from your profile</span>
            </span>
          </div>
        </section>

        <section class="row field-group fx-row fx-start-center">
          <div class="col s3 p-b-md">
            <label class="required capital">title</label>
          </div>
          <div class="col s9">
            <input class="input-box" id="title" maxlength="50" v-model="joboffer.title | string">
            <span class="m-b-sm font-8 text-warning pull-right">{{remainChars(joboffer.title, 50)}}</span>
          </div>

        </section>

        <section class="row field-group fx-row fx-start-center m-t-n-md">
          <div class="col s3">
            <label class="required capital">job category</label>
          </div>
          <div class="col s9">
            <select class="browser-default input-box" v-model="joboffer.category_id">
              <option  v-for="item in jobCategories" value="{{item.id}}">{{item.name}}</option>
            </select>
          </div>
        </section>

        <section class="row field-group fx-row fx-start-center">
          <div class="col s3">
            <label class="required capital">Location</label>
          </div>
          <div class="col s9">
            <selector :endpoint="'/location'" :free='false' :label="'location'" :max="100" :name="locationName" :value.sync="joboffer.location"></selector>
          </div>
        </section>

      </form>

      <form class="form-container bg-white m-b-md z-depth-1">
        <h6 class="form-head font-light">Optional</h6>
        <section class="row field-group fx-row fx-start-center">
          <div class="col s3">
            <label class="capital">degree</label>
          </div>
          <div class="col s9">
            <select class="browser-default input-box" v-model="joboffer.degree_id">
              <option  v-for="item in degrees" value="{{item.id}}">{{item.name}}</option>
            </select>
          </div>
        </section>

        <section class="row field-group fx-row fx-start-center">
          <div class="col s3">
            <label class="capital">job type</label>
          </div>
          <div class="col s9">
            <select class="browser-default input-box" v-model="joboffer.jobtype_id">
              <option v-for="item in jobTypes" value="{{item.id}}">{{item.name}}</option>
            </select>
          </div>
        </section>

        <section class="row field-group fx-row fx-start-center">
          <div class="col s3">
            <label class="capital">years of experience</label>
          </div>
          <div class="col s9">
            <select class="browser-default input-box" v-model="joboffer.experience_id">
              <option  v-for="item in yearExperience" value="{{item.id}}">{{item.value}}</option>
            </select>
          </div>
        </section>

        <section class="row field-group fx-row fx-start-center">
          <div class="col s3">
            <label class="capital">salary</label>
          </div>
          <div class="col s3">
            <input class="input-box" placeholder="From" id="salary_min" v-model="joboffer.salary_min | numeric">
          </div>
          <div class="col s3">
            <input class="input-box" placeholder="To" id="salary_max" v-model="joboffer.salary_max | numeric">
          </div>
          <div flex>
            <label class="capital">/month </label>
          </div>
        </section>


      </form>

      <div class="fx-row fx-space-between-center">
        <button @click="save(false)" class="btn-flat waves-effect waves-teal font-1-2 bg-none teal-text" name="save-draft">Save as Draft</button>
        <button @click="save('next')" class="btn-floating btn-large waves-effect waves-light bay-leaf"><i class="material-icons">chevron_right</i></button>
      </div>
  </section>
  <section class="col s4">
    <div class="bg-white p-sm m-b-md">
      <h6 class="center">Drafts</h6>
      <joboffer-draft></joboffer-draft>
    </div>

    <div class="bg-white p-sm">
      <h6 class="center">Previous Job Offers</h6>
      <joboffer-closed></joboffer-closed>
    </div>
  </section>
</div>
</template>

<script>
import {loadjobCategories, loadjobTypes, loadYearOfExperience, loadDegrees} from 'store/joboffer/actions.joboffer'
import {jobofferCategories, jobofferTypes, yearsOfExperience, jobofferdegrees} from 'store/joboffer/getters.joboffer'
import {isReady} from 'store/account/getters.account'
var connect = require('services/connect')
var jobofferClosed = require('./slaves/joboffer-closed.list.vue')
var jobofferDraft = require('./slaves/joboffer-draft.list.vue')
require('tagmanager/tagmanager.min.js')
require('tagmanager/tagmanager.css')
var Pikaday = require('datepiker/datepiker.min.js')
var selector = require('shared/selector.vue')
require('datepiker/datepiker.css')
import notify from 'services/notifs-center'

var model = {
  title: '',
  category_id: 0,
  tags: [],
  degree_id: 0,
  type: 'Public',
  experience_id: 0,
  salary_min: null,
  salary_max: null,
  release_date: '',
  city_id: 0,
  company_id: 0,
  jobtype_id: 0,
  incentive: 10,
  company: null
}
module.exports = {
  vuex: {
    actions: {
      loadjobCategories,
      loadjobTypes,
      loadYearOfExperience,
      loadDegrees
    },
    getters: {
      jobCategories: jobofferCategories,
      jobTypes: jobofferTypes,
      yearExperience: yearsOfExperience,
      isReady,
      degrees: jobofferdegrees
    }
  },
  data () {
    return {
      isReady: false,
      id: 0,
      joboffer: Object.assign({}, model),
      error: '',
      companies: [],
      tags: [],
      companyName: (e) => e.name + " \n <span class='font-8'>" + ' ' + (e.region || '') + ' ' + (e.country || '') + '</span>',
      locationName: (e) => (e.name || '') + ', ' + (e.country || '')
    }
  },
  components: {
    jobofferClosed,
    jobofferDraft,
    selector
  },
  route: {
    data ({to}) {
      let jobId = to.params.jobId
      if (Number(jobId)) this.id = jobId
    }
  },
  ready () {
    var vm = this
    $(function () {
      $('.company-menu-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: true,
        hover: false,
        gutter: 0,
        belowOrigin: true,
        alignment: 'left'
      })
    })
    vm.loadjobCategories()
    vm.loadjobTypes()
    vm.loadYearOfExperience()
    vm.loadDegrees()
    vm.loadcompanies()
    vm.$on('addcompany:added', (comp) => (vm.joboffer.company = comp))
    if (vm.id) {
      vm.loadJoboffer(vm.id)
      .then(vm.init)
      .catch(() => {
        vm.isReady = true
        vm.$router.go('/')
      })
    } else vm.init()
  },
  methods: {
    loadcompanies () {
      var vm = this
      connect.apiAsync('GET', '/mycompanies', null)
      .then(function (res) {
        vm.companies = res
      })
    },
    init () {
      var vm = this
      var $ = window.jQuery
      vm.isReady = true
      $('#tags').tagsManager({
        initialCap: true,
        backspaceChars: [8],
        delimiterChars: [9, 13, 44],
        maxTags: 8,
        prefilled: vm.joboffer.tags
      })
      $('#tags').on('tm:pushed', (e, tag) => {
        if (tag && tag.length > 15 || /[^A-Za-z0-9 .:]/.test(tag)) $('#tags').tagsManager('popTag')
        else vm.joboffer.tags.$set(vm.joboffer.tags.length, tag)
      })
      $('#tags').on('tm:popped', (e, tag) => vm.joboffer.tags.$remove(tag))
      $('#tags').on('tm:spliced', (e, tag) => vm.joboffer.tags.$remove(tag))
      this.pickday = new Pikaday({
        field: document.getElementById('datepicker'),
        firstDay: 1,
        minDate: new Date(),
        maxDate: new Date(2020, 12, 31),
        yearRange: [2000, 2020]
      })
    },
    loadJoboffer (id) {
      var vm = this
      return connect.apiAsync('GET', '/dashboard/joboffers/' + id)
      .then(function (res) {
        vm.joboffer = res
        if (vm.joboffer.state == 'aborted') delete this.id
        if (res.tags.length) vm.joboffer.tags = res.tags.map((i) => i.name)
      })
    },
    remainChars (field, size = 600) {
      if (field && field.length) {
        if (field.length > size) return 0
        return (size - field.split('\n').join('  ').length)
      } else return size
    },
    save (next) {
      if (!this.joboffer.company || !this.joboffer.title || !this.joboffer.location) {
        return notify.warn('Missing Required Fields')
      }
      let vm = this.joboffer
      let router = this
      let data = {
        html: true,
        title: vm.title,
        category_id: vm.category_id,
        summary: '',
        tags: vm.tags,
        degree_id: vm.degree_id,
        type: vm.type || 'Public',
        experience_id: vm.experience_id,
        salary_min: vm.salary_min || null,
        salary_max: vm.salary_max || null,
        release_date: vm.release_date,
        city_id: vm.location.id,
        company_id: vm.company.id,
        jobtype_id: vm.jobtype_id,
        incentive: vm.incentive || 10
      }
      if (vm.type == 'Private') delete data.type
      if (vm.release_date == '') delete data.release_date
      if (vm.state == 'aborted') {
        data.description = vm.description || ''
        data.expectations = vm.expectations || ''
        data.benefits = vm.benefits || ''
        if (vm.applicationQuestions && vm.applicationQuestions.length) {
          data.questions = [{
            type: vm.applicationQuestions[0].type,
            subject: vm.applicationQuestions[0].subject,
            target: 'application'
          }]
        }
        delete this.id
      }
      let url = this.id ? '/joboffers/' + this.id : '/joboffers'
      let method = this.id ? 'PUT' : 'POST'
      connect.apiAsync(method, url, data)
      .then((res) => {
        if (next) router.$router.go({ name: 'job-description', params: {jobId: res.id} })
        else window.location = window.location.origin
      })
    }
  }
}
</script>
