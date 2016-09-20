<style lang="less" scoped>
.work-body {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: none;
  .work-edit{
    opacity: 0;
    transition: 200ms all;
  }
  .fx-row{
    &:hover{
     .work-edit {
       opacity: 1;
     }
    }
  }
}
</style>
<template>
  <div>
    <div class="panel panel-default">
      <div class="panel-body fx-col fx-center-start">

        <div class="fx-col">
          <section v-if="empty" @click="addWork" class="fx-col hand fx-start-center placeholder">
            <i class="material-icons symbol">&#xEB3F;</i>
            <h4 class="m-none font-1-5 capital" v-ii18n="addExperienceText">add your first experience</h4>
          </section>

          <section v-else class="work-body">
            <ul class="lv-list">
              <li v-for="experience in experiences" class="fx-row fx-space-between-center lv-item">
                <div class="fx-row">
                  <img :src="experience.company.logo  " class="company-logo img-rounded border size-48" alt="company logo">
                  <div class="m-l-sm font-9">
                    <h6 class="font-1-2 m-none">{{experience.company.name}}</h6>
                    <h5 class="font-1-2 m-none">{{experience.title}}</h5>
                    <div class="capital m-none font-light text-light">
                    <span class="capital">{{experience.since | moment "MMMM YYYY" }} </span>
                    <span class="m-xs"> - </span>
                    <span class="capital" v-if="experience.until">{{experience.until | moment "MMMM YYYY" }}</span>
                    <span class="capital" v-ii18n="present" v-else>present</span>
                    </div>
                  </div>
                </div>
                <span @click="edit(experience)" class="work-edit m-r-md hand"><i class="material-icons md-14">&#xE254;</i></span>
              </li>
            </ul>
          </section>

          <section v-if="!empty" class="fx-col fx-start-center m-t-sm">
            <span @click="addWork" class="hand border p-sm"><i class="material-icons md-14 ">&#xE39D;</i> Add experience</span>
          </section>
        </div>

      </div>
    </div>
    <experience-editor v-ref:editor></experience-editor>
  </div>
</template>

<script>
import experienceEditor from 'profile/slaves/experience/experience.editor.vue'

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
  props: {
    error: {
      twoWay: true
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
      this.error = ''
      this.$refs.editor.new()
    }
  }
}

</script>
