<style>
.inner-border-container{
  border: 1px #DDD solid;
  border-top:none;
}
</style>

<template>
  <div>
     <education-editor v-ref:editor></education-editor>
     <div>
      <section class="work-body m-l-sm font-8">
            <ul class="">
              <li v-for="education in educations" class="edit-item row p-t-sm ">
                <div class="col s1 p-t-sm">
                  <div class="item-circle"></div>
                </div>
                <div class="col s11 row p-t-sm">
                  <span class="col s4">{{education.school.name}}</span>
                  <span class="col s2 m-l-lg capital">{{education.since | moment "MMMM YYYY" }} </span>
                  <span class="col s2 capital" v-if="education.until">{{education.until | moment "MMMM YYYY" }}</span>
                  <span  @click="edit(education)" class="col s1  m-l-lg work-edit hand"><i class="material-icons md-14">&#xE22B;</i></span>
                  <span  @click="deleteEducation(education)" class="col s1 work-edit hand"><i class="material-icons md-14">&#xE872;</i></span>
                </div>
                <div class="inner-border-container">
              </li>
            </ul>
      </section>
     </div>
  </div>

</template>

<script>
var educationEditor = require('./slaves/view.education.editor.vue')

import {setActiveEdu} from 'store/profile/actions.profile'
import {profileEdus} from 'store/profile/getters.profile'

module.exports = {
  vuex: {
    actions: {
      setActiveEdu
    },
    getters: {
      educations: profileEdus
    }
  },
  components: {
    educationEditor
  },
  computed: {
    empty () {
      return this.educations ? !this.educations[0] : true
    }
  },
  methods: {
    edit (item) {
      this.setActiveEdu(item)
      this.$refs.editor.edit(item)
    },
    addEducation () {
      this.$refs.editor.new()
    },
    deleteEducation (item) {
      this.setActiveEdu(item)
      this.$refs.editor.delete(item)
    },
    next () {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  }
}

</script>
