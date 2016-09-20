<style lang="less" scoped>
 @import '../../../welcome/welcome.less';
 .inner-border-container{
   border: 1px #DDD solid;
   border-top:none;
 }
</style>
<template>
  <modal :show.sync="showModal">
      <div class="p-sm panel-heading capital" slot="header">
        <i class="material-icons">&#xE80C;</i>
        <span class="m-l-sm" v-ii18n="educationRecord">education record</span>
      </div>
     <div class="p-md row" slot="body">
           <div v-if="error" class="empty-data p-sm word-wrapper">
              <i class="material-icons md-18 m-b-xs red600">warning</i>
             <span class="text-danger capital font-light font-1-2 m-l-sm">{{error}}</span>
            </div>
               <div class="welcome-editor m-t-sm font-9">
                     <addschool v-ref:schooleditor></addschool>
                     <selector :endpoint="'/schools'" :free='false' :img="'logo'" :insert="addSchool" :insertable="true" :max="5" :value.sync="school" :label="'School Name *'"></selector>
               <div class="inner-border-container">
                     <select class="browser-default welcome-input " v-model="degree_id">
                           <option value='' disabled selected>Degree *</option>
                           <option v-for="item in degrees" value="{{item.id}}">{{item.name}}</option>
                     </select>
                     <div class="border-top border-bottom">
                       <input class="welcome-input" placeholder="Major" id="major" maxlength="100" v-model="description | string" required>
                     </div>
                     <div class="row  ">
                         <div class="border-right  col m6">
                           <select v-model="sinceMonth" class="browser-default welcome-input">
                             <option value='' disabled selected>Started Month *</option>
                               <option v-for="option in 12">{{option + 1}}</option>
                           </select>
                         </div>
                         <div class=" col m6">
                          <select v-model="sinceYear" class="browser-default welcome-input">
                           <option value='' disabled selected>Started Year *</option>
                             <option v-for="option in year">{{option + 1960}}</option>
                          </select>
                        </div>
                       </div>
                       <div class="border-top"></div>
                       <div class="row">
                         <div class="border-right  col m6">
                           <select v-model="untilMonth" class="browser-default welcome-input  ">
                             <option value='' disabled selected>Ended Month *</option>
                               <option v-for="option in 12">{{option + 1}}</option>
                           </select>
                         </div>
                         <div class=" col m6">
                           <select v-model="untilYear" class="browser-default welcome-input  ">
                             <option value='' disabled selected>Ended Year *</option>
                               <option v-for="option in year">{{option + 1960}}</option>
                           </select>
                         </div>
                       </div>

                       <div class="border-top"></div>
                       <input  class="welcome-input" name="skills" placeholder="Add Skills" id="skillsEducation" maxlength="30">
                  </div>
                 </div>
      </div>
      <div class="m-r-md m-t-sm row p-xs " slot="footer">
        <button  v-if="iseditmode" @click="delete" :disabled="isLoading" class="m-l-lg font-light btn red text-white font-8 uppercase" name="delete" v-ii18n="deleteLbl">delete</button>
        <div class="pull-right">
          <button @click="cancel" :disabled="isLoading"  class="btn-flat btn btn-info text-white btn btn-outline border font-light font-8" name="cancel" v-ii18n="cancel">cancel</button>
          <button  @click="save" :disabled="isLoading" class="w-xs font-light btn btn-success m-l-md font-8 uppercase" name="save" v-ii18n="save">save</button>
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
var addschool = require('shared/add_school.vue')
import notify from 'services/notifs-center'

import {saveActiveEdu, addNewEdu, deleteActiveEdu, cancelActiveEdu, loadDegrees} from 'store/profile/actions.profile'
import {profileDegrees} from 'store/profile/getters.profile'

module.exports = {
  mixins: require('shared/add.education.experience.mixin.js'),
  vuex: {
    getters: {
      degrees: profileDegrees
    },
    actions: {
      saveActiveEdu,
      deleteActiveEdu,
      addNewEdu,
      cancelActiveEdu,
      loadDegrees
    }
  },
  data () {
    return {
      school: null,
      degree_id: null,
      isLoading: false,
      showModal: false,
      iseditmode: false,
      isCurrent: false,
      untilMonth: null,
      untilYear: null,
      sinceMonth: null,
      sinceYear: null,
      description: null,
      error: '',
      tags: [],
      year: (new Date().getFullYear()) - 1959
    }
  },
  components: {
    modal: modal,
    selector: selector,
    addschool: addschool
  },
  computed: {
    until: {
      // getter
      get () {
        var _date = new Date()
        _date.setFullYear(this.untilYear)
        _date.setMonth(this.untilMonth - 1)
        _date.setDate(1)
        return _date.toISOString().slice(0, 10)
      },
      // setter
      set (newValue) {
        if (newValue) {
          var until = new Date(newValue)
          this.untilMonth = until ? until.getMonth() + 1 : ''
          this.untilYear = until ? until.getFullYear() : ''
        }
      }
    },
    since: {
      // getter
      get () {
        var _date = new Date()
        _date.setFullYear(this.sinceYear)
        _date.setMonth(this.sinceMonth - 1)
        _date.setDate(1)
        return _date.toISOString().slice(0, 10)
      },
      // setter
      set (newValue) {
        var since = newValue ? new Date(newValue) : null
        this.sinceMonth = since ? since.getMonth() + 1 : ''
        this.sinceYear = since ? since.getFullYear() : ''
      }
    },
    skills: {
      get () {
        return this.tags ? this.tags.join(',') : ''
      }
    }
  },
  ready () {
    this.loadDegrees()
    var vm = this
    $('#skillsEducation').tagsManager({
      initialCap: true,
      backspaceChars: [8],
      delimiterChars: [13, 44, 188]
    })
    $('#skillsEducation').on('tm:pushed', function (e, tag) {
      vm.tags.push(tag)
    })
    $('#skillsEducation').on('tm:popped', function (e, tag) {
      vm.tags.$remove(tag)
    })
    $('#skillsEducation').on('tm:spliced', function (e, tag) {
      vm.tags.$remove(tag)
    })
    this.$on('addschool:added', function (school) {
      vm.school = school
    })
  },
  methods: {
    new () {
      this.reset()
      this.showModal = true
    },
    addSchool () {
      this.$refs.schooleditor.showme()
    },
    reset () {
      var $ = window.jQuery
      this.description = this.error = this.untilYear = this.untilMonth = this.sinceMonth = this.sinceYear = ''
      this.school = this.degree_id = null
      this.iseditmode = false
      this.id = null
      this.isLoading = false
      this.iseditmode = false
      this.tags = []
      this.id = null
      $('#skillsEducation').tagsManager('empty')
    },
    save () {
      var vm = this
      var invalidUntil = (this.untilMonth && !this.untilYear) || (!this.untilMonth && this.untilYear)

      if (!this.school || !this.degree_id || !this.sinceYear || !this.sinceMonth || invalidUntil) {
        return notify.warn('Missing Required Fields')
      }

      if (this.since >= this.until) {
        return notify.warn('The dates you entered are off')
      }

      this.isLoading = true

      // var data = _.pick(this, 'id', 'degree', 'since', 'until', 'description', 'skills')
      var data = {}
      ;['id', 'degree_id', 'since', 'until', 'description', 'skills'].forEach((i) => (data[i] = vm[i]))

      if ((typeof this.school) == 'object') data.school_id = this.school.id
      else data.school_name = this.school
      // saving
      this.isLoading = true
      if (this.iseditmode) {
        this.saveActiveEdu(data)
        .then(function () {
          vm.isLoading = false
          vm.showModal = false
          vm.reset()
        })
        .catch(() => {
          vm.isLoading = false
        })
      } else {
        this.addNewEdu(data)
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
    cancel () {
      this.cancelActiveEdu()
      this.reset()
      this.showModal = false
    },
    edit (record) {
      // var $ = window.jQuery
      for (var k in record) {
        if (typeof (record[k]) == 'string') this[k] = record[k]
      }
      this.id = record.id
      this.iseditmode = true
      this.school = record.school

      // _.map(record.skills, function (skill) {
      //   $('#skillsEducation').tagsManager('pushTag', skill.name.trim())
      // })
      this.degree_id = record.degree_id
      record.skills.map(function (skill) {
        $('#skillsEducation').tagsManager('pushTag', skill.name.trim())
      })
      this.showModal = true
    },
    delete () {
      var vm = this
      this.deleteActiveEdu()
      .then(function () {
        vm.isLoading = false
        vm.showModal = false
        vm.reset()
      })
    }
  }
}

</script>
