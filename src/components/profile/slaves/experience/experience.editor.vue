<style lang="less" scoped>
 @import '../../../welcome/welcome.less';
 .inner-border-container{
   border: 1px #DDD solid;
   border-top:none;
   border-bottom: none
 }
</style>
<template>
  <modal :show.sync="showModal">
      <div class="p-sm panel-heading capital" slot="header">
          <i class="material-icons">&#xEB3F;</i>
          <span class="m-l-sm" v-ii18n="experienceRecord">experience record</sapn>
      </div>

      <section class="p-md" slot="body">
          <div v-if="error" class="empty-data p-sm word-wrapper">
             <i class="material-icons md-18 m-b-xs red600">warning</i>
            <span class="text-danger capital font-light font-1-2 m-l-sm">{{error}}</span>
           </div>
                <div class="welcome-editor m-t-sm font-9">
                      <addcompany v-ref:companyeditor></addcompany>
                        <selector :value.sync="company" :endpoint="'/companies'" :img="'logo'" :max="5"  :free='false' :insertable="true" :insert="addCompany" :label="'Company Name *'"></selector>
                       <div class="inner-border-container">
                         <input class="welcome-input " id="title" placeholder="Title *" v-model="title | string" title="title" name="title" maxlength="32">
                       <div class="border-top"></div>
                        <div class="row">
                          <div class="col m6 border-right">
                              <select v-model="sinceMonth" class="browser-default welcome-input">
                                <option value='' disabled selected>Started Month *</option>
                                  <option v-for="option in 12">{{option + 1}}</option>
                              </select>
                            </div>
                            <div class="col m6">
                             <select v-model="sinceYear" class="browser-default  welcome-input">
                              <option value='' disabled selected>Started Year *</option>
                                <option v-for="option in year">{{option + 1960}}</option>
                             </select>
                           </div>
                       </div>
                       <div class="border-top"></div>
                        <p class="  m-l-sm font-light ">
                             <input class="m-l-md" type="checkbox" checked="checked"  v-model="current" name="current" id="current"/>
                             <label for="current">I currently work here</label>
                        </p>

                        <div class="border-top"></div>
                        <div v-show="!current">
                          <div class="row">
                            <div class="border-right  col m6">
                              <select v-model="untilMonth" class="browser-default welcome-input">
                                <option value='' disabled selected>Ended Month *</option>
                                  <option v-for="option in 12">{{option + 1}}</option>
                              </select>
                            </div>
                            <div class=" col m6">
                              <select v-model="untilYear" class="browser-default welcome-input">
                                <option value='' disabled selected>Ended Year *</option>
                                  <option v-for="option in year">{{option + 1960}}</option>
                              </select>
                            </div>
                          </div>
                            <div class="border-top"></div>
                        </div>

                        <input name="skills" placeholder="Tags (Skills)" id="skillsExperience" maxlength="20" class=" welcome-input">
                        <div class="border-top"></div>
                        <div class="textarea-box border-bottom">
                           <textarea  id="description"  maxlength="1000" placeholder="Role Description" v-model="description | substring 1000"></textarea>
                           <span class="font-8 text-warning pull-right m-t-n-md">{{remainChars}}</span>
                        </div>
                      </div>
                </div>
      </section>

      <div class="m-r-md m-t-sm row p-xs " slot="footer">
        <button  v-if="iseditmode" :disabled="isLoading" @click="delete" class="m-l-lg font-light btn red text-white font-8 uppercase" name="delete" v-ii18n="deleteLbl">delete</button>
        <div class="pull-right">
          <button :disabled="isLoading" @click="cancel" class="btn-flat btn btn-info text-white btn btn-outline border font-light font-8" name="cancel" v-ii18n="cancel">cancel</button>
          <button :disabled="isLoading" @click="save" class="w-xs font-light btn btn-success m-l-md font-8 uppercase" name="save" v-ii18n="save">save</button>
        </div>
      </div>

    </modal>
</template>
<script>
var $ = window.jQuery
require('tagmanager/tagmanager.min.js')
require('tagmanager/tagmanager.css')
var modal = require('shared/modal.vue')
var selector = require('shared/selector.vue')
var addcompany = require('shared/add_company.vue')
import notify from 'services/notifs-center'

import {saveActiveExp, addNewExp, deleteActiveExp, cancelActiveExp} from 'store/profile/actions.profile'

module.exports = {
  mixins: require('shared/add.education.experience.mixin.js'),
  vuex: {
    actions: {
      saveActiveExp,
      deleteActiveExp,
      addNewExp,
      cancelActiveExp
    }
  },
  data: function () {
    return {
      title: null,
      isLoading: false,
      showModal: false,
      iseditmode: false,
      current: null,
      untilMonth: null,
      untilYear: null,
      sinceMonth: null,
      sinceYear: null,
      description: null,
      error: '',
      tags: [],
      company: null,
      year: (new Date().getFullYear()) - 1959
    }
  },
  components: {
    modal: modal,
    selector: selector,
    addcompany: addcompany
  },
  computed: {
    until: {
      // getter
      get: function () {
        var _date = new Date()
        _date.setFullYear(this.untilYear)
        _date.setMonth(this.untilMonth - 1)
        _date.setDate(1)
        return _date.toISOString().slice(0, 10)
      },
      // setter
      set: function (newValue) {
        if (newValue) {
          var until = new Date(newValue)
          this.untilMonth = until ? until.getMonth() + 1 : ''
          this.untilYear = until ? until.getFullYear() : ''
        }
      }
    },
    since: {
      // getter
      get: function () {
        var _date = new Date()
        _date.setFullYear(this.sinceYear)
        _date.setMonth(this.sinceMonth - 1)
        _date.setDate(1)
        return _date.toISOString().slice(0, 10)
      },
      // setter
      set: function (newValue) {
        var since = newValue ? new Date(newValue) : null
        this.sinceMonth = since ? since.getMonth() + 1 : ''
        this.sinceYear = since ? since.getFullYear() : ''
      }
    },
    skills: {
      get: function () {
        return this.tags ? this.tags.join(',') : ''
      }
    },
    remainChars () {
      if (this.description && this.description.length <= 1000) return (1000 - this.description.split('\n').join('  ').length)
      else if (this.description && this.description.length > 1000) return 0
      else return 1000
    }
  },
  ready: function () {
    var vm = this
    $('#skillsExperience').tagsManager({
      initialCap: true,
      backspaceChars: [8],
      delimiterChars: [13, 44, 188]
    })
    $('#skillsExperience').on('tm:pushed', function (e, tag) {
      vm.tags.push(tag)
    })
    $('#skillsExperience').on('tm:popped', function (e, tag) {
      vm.tags.$remove(tag)
    })
    $('#skillsExperience').on('tm:spliced', function (e, tag) {
      vm.tags.$remove(tag)
    })
    this.$on('addcompany:added', function (comp) {
      vm.company = comp
    })
  },
  methods: {
    new () {
      this.reset()
      this.showModal = true
    },
    addCompany: function () {
      this.$refs.companyeditor.showme()
    },
    reset: function () {
      var $ = window.jQuery
      if (this.tags.length) $('#skillsExperience').tagsManager('empty')
      this.title = this.description = this.error = this.untilYear = this.untilMonth = this.sinceMonth = this.sinceYear = ''
      this.company = null
      this.iseditmode = false
      this.id = null
      this.current = true
      this.isLoading = false
      this.tags = []
      this.id = null
    },
    save: function () {
      var vm = this
      if (!this.current && this.since >= this.until) {
        return (notify.warn('Please set since and until dates correctly!'))
      }
      if (!this.company || !this.title || !this.sinceYear || !this.sinceMonth || (!this.current && (!this.untilMonth || !this.untilYear))) {
        notify.warn('Missing Required Fields')
        return
      }
      // var data = _.pick(this, 'id', 'title', 'since', 'until', 'description', 'skills')
      var data = {}
      ;['id', 'title', 'since', 'until', 'description', 'skills'].forEach((i) => (data[i] = vm[i]))
      if ((typeof this.company) == 'object') data.company_id = this.company.id
      else data.company_name = this.company
      if (this.current) {
        data.until = null
      }

      // saving
      this.isLoading = true
      if (this.iseditmode) {
        this.saveActiveExp(data)
        .then(function () {
          vm.isLoading = false
          vm.showModal = false
          vm.reset()
        })
        .catch(() => {
          vm.isLoading = false
        })
      } else {
        this.addNewExp(data)
        .then(function () {
          vm.isLoading = false
          vm.showModal = false
          vm.reset()
        })
        .catch(() => {
          vm.isLoading = false
        })
      }
    },
    cancel: function () {
      this.cancelActiveExp()
      this.reset()
      this.showModal = false
    },
    edit: function (record) {
      for (var k in record) {
        if (typeof (record[k]) == 'string') this[k] = record[k]
      }
      this.iseditmode = true
      this.id = record.id
      this.company = record.company

      if (record.until) this.current = false
      else this.current = true
      console.log('wooork', this.untilMonth)
      var $ = window.jQuery
      record.skills.map(function (skill) {
        $('#skillsExperience').tagsManager('pushTag', skill.name.trim())
      })
      this.showModal = true
    },
    delete: function () {
      var vm = this
      vm.isLoading = true

      this.deleteActiveExp()
      .then(function () {
        vm.isLoading = false
        vm.showModal = false
        vm.reset()
      })
    }
  }
}
</script>
