<style>
.inner-border-container{
  border: 1px #DDD solid;
  border-top:none;
}
select {
  border: none !important;
}

.autocomplete-input {
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;

}
.bg-white2{
  background-color: #FFF;
}
</style>
<template>
    <div class="p-l-sm  m-b-md m-t-md">
        <h6><i class="material-icons">&#xE80C;</i>  Optional : Add Education records to your Profile</h6>
        <span class="font-light font-9"><i class="material-icons md-14">&#xE88F;</i> You can always do this later from your profile or when you apply for a job</span>

        <div v-if="error" class="empty-data font-light  word-wrapper">
           <i class="material-icons md-14 m-b-xs red600">warning</i>
          <span class="text-danger capital font-light  ">{{error}}</span>
         </div>
            <div class="welcome-editor m-t-sm font-9  ">
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
               <div class="row bg-white ">
                  <div class="col m1 m-t-sm p-t-xs p-r-sm text-orange">
                    From
                  </div>
                  <div class="col m5 row bg-white  ">
                      <div class="border-right  col m6">
                        <select v-model="sinceMonth" class="browser-default welcome-input">
                        	<option value='' disabled selected>Month *</option>
                            <option v-for="option in 12">{{option + 1}}</option>
                        </select>
                      </div>
                      <div class=" col m6">
                       <select v-model="sinceYear" class="browser-default welcome-input">
                       	<option value='' disabled selected>Year *</option>
                          <option v-for="option in year">{{2017 - option}}</option>
                       </select>
                     </div>
                    </div>
                    <div class="col m1 m-t-sm text-orange p-t-xs ">
                      To
                    </div>

                    <div class="col m5 row border-left">
                      <div class="border-right  col m6">
                        <select v-model="untilMonth" class="browser-default welcome-input  ">
                        	<option value='' disabled selected>Month *</option>
                            <option v-for="option in 12">{{option + 1}}</option>
                        </select>
                      </div>
                      <div class=" col m6">
                        <select v-model="untilYear" class="browser-default welcome-input  ">
                        	<option value='' disabled selected>Year *</option>
                            <option v-for="option in year">{{2020 - option}}</option>
                        </select>
                      </div>
                    </div>

</div>
                    <div class="border-top"></div>

                    <div class="border-top"></div>
                    <div class="bg-white2">
                      <input   class="welcome-input" name="skills" placeholder="Add Skills" id="skillsEducation" maxlength="30">
                    </div>
</div>
                	<div class="hand bay-leaf add-btn p-xxs" :disabled="isLoading" @click="save">
                		<div class="center m-t-sm m-b-sm">
                           <i class="material-icons">&#xE145;</i>
                    </div>
                 </div>
              </div>
  </div>
  </template>
<script>
var $ = window.jQuery
require('tagmanager/tagmanager.min.js')
require('tagmanager/tagmanager.css')
var modal = require('shared/modal.vue')
var selector = require('shared/selector.vue')
var addschool = require('shared/add_school.vue')
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
    $(function () {
      vm.updateLeftMenuHeight()
    })
    $('#skillsEducation').tagsManager({
      initialCap: true,
      backspaceChars: [8],
      delimiterChars: [13, 44, 188]
    })
    $('#skillsEducation').on('tm:pushed', function (e, tag) {
      vm.tags.push(tag)
      vm.updateLeftMenuHeight()
    })
    $('#skillsEducation').on('tm:popped', function (e, tag) {
      vm.tags.$remove(tag)
      vm.updateLeftMenuHeight()
    })
    $('#skillsEducation').on('tm:spliced', function (e, tag) {
      vm.tags.$remove(tag)
      vm.updateLeftMenuHeight()
    })
    this.$on('addschool:added', function (school) {
      vm.school = school
      vm.updateLeftMenuHeight()
    })
  },
  methods: {
    new () {
      this.reset()
      this.showModal = true
    },
    updateLeftMenuHeight () {
      setTimeout(function () {
        $('.left-container').height($('.main-body').height())
      }, 100)
    },
    addSchool () {
      this.$refs.schooleditor.showme()
    },
    reset () {
      var $ = window.jQuery
      this.description = this.error = this.untilYear = this.untilMonth = this.sinceMonth = this.sinceYear = this.degree_id = ''
      this.school = null
      this.iseditmode = false
      this.id = null
      this.isLoading = false
      this.iseditmode = false
      this.tags = []
      this.id = null
      $('#skillsEducation').tagsManager('empty')
      setTimeout(this.updateLeftMenuHeight(), 100)
    },
    save () {
      var vm = this
      var invalidUntil = (this.untilMonth && !this.untilYear) || (!this.untilMonth && this.untilYear)

      if (!this.school || !this.degree_id || !this.sinceYear || !this.sinceMonth || invalidUntil) {
         this.error = 'Missing Required Fields'
         return
      }

      if (this.since >= this.until) {
         this.error = 'Please set since and until dates correctly!'
         return
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
          vm.reset()
        })
        .catch(() => {
          vm.isLoading = false
        })
      } else {
        this.addNewEdu(data)
        .then(function () {
          vm.isLoading = false
          vm.reset()
        })
        .catch(() => {
          vm.isLoading = false
        })
      }
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
    },
    delete () {
      var vm = this
      this.deleteActiveEdu()
      .then(function () {
        vm.reset()
      })
    }
  }
}

</script>
