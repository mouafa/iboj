<template>
     <experience-editor v-ref:editor></experience-editor>
      <section class="work-body m-l-sm">
            <ul class="">
              <li v-for="experience in experiences" class="edit-item m-t-sm row">
                <div class="col s1">
                  <div class="item-circle"></div>
                </div>
                <div class="col s11 row">
                  <span class="col s4">{{experience.company.name}}</span>
                  <span class="col s2 m-l-md capital">{{experience.since | moment "MMMM YYYY" }} </span>
                  <span class="col s2 m-l-sm capital" v-if="experience.until">{{experience.until | moment "MMMM YYYY" }}</span>
                  <span class="col s2 m-l-sm capital" v-else>Present</span>
                  <span  @click="edit(experience)" class="col s1 work-edit m-l-lg hand"><i class="material-icons md-14">&#xE22B;</i></span>
                  <span  @click="deleteExperience(experience)" class="col s1 work-edit hand"><i class="material-icons md-14">&#xE872;</i></span>
                </div>
              </li>
            </ul>
      </section>
</template>

<script>
var experienceEditor = require('./slaves/view.work.editor.vue')

import {setActiveExp} from 'store/profile/actions.profile'
import {profileExps} from 'store/profile/getters.profile'

module.exports = {
  vuex: {
    actions: {
      setActiveExp
    },
    getters: {
      experiences: profileExps
    }
  },
  components: {
    experienceEditor
  },
  computed: {
    empty () {
      return this.experiences ? !this.experiences[0] : true
    }
  },
  methods: {
    edit (item) {
      this.setActiveExp(item)
      this.$refs.editor.edit(item)
    },
    addWork () {
      this.$refs.editor.new()
    },
    next () {
      return new Promise((resolve, reject) => {
        // that.save().then((res) => resolve(), (err) => reject(err))
        resolve()
      })
    },
    deleteExperience (item) {
      this.setActiveExp(item)
      this.$refs.editor.delete(item)
    }
  }
}

</script>
