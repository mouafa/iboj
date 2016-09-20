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
          <section v-if="empty" @click="addEducation"  class="fx-col hand fx-start-center placeholder capital">
            <i class="material-icons symbol">&#xE80C;</i>
            <h4 class="m-none font-1-5 capital" v-ii18n="addEducationText">add your first education</h4>
          </section>

          <section v-else class="work-body">
            <ul class="lv-list">
              <li v-for="education in educations" class="fx-row fx-space-between-center lv-item ">
                <div class="fx-row">
                  <img :src="education.school.logo ? education.school.logo   : '/assets/images/no-img.png'" class="img-rounded border size-48">
                  <div class="m-l-sm font-9">
                    <h6 class="font-1-2 m-none">{{education.degree.name}}</h6>
                    <h5 class="capital font-1-2 m-none">{{education.school.name}}</h5>
                    <div class="capital m-none font-light text-light">
                      <span class="capital">{{education.since | moment "MMMM YYYY" }} </span>
                      <span class="m-xs"> - </span>
                      <span class="capital" v-if="education.until">{{education.until | moment "MMMM YYYY" }}</span>
                      <span class="capital" v-else>Present</span>
                    </div>
                  </div>
                </div>
                <span  @click="edit(education)" class="work-edit m-l-md hand"><i class="material-icons md-14">&#xE254;</i></span>
              </li>
            </ul>
          </section>
          <section v-if="!empty" class="fx-col fx-start-center m-t-sm">
             <span @click="addEducation" class="hand p-sm border"><i class="material-icons md-14 ">&#xE39D;</i> Add education</span>
          </section>
        </div>

      </div>
    </div>
      <education-editor v-ref:editor></education-editor>
  </div>

</template>

<script>
import educationEditor from 'profile/slaves/education/education.editor.vue'

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
  props: {
    error: {
      twoWay: true
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
      this.error = ''
      this.$refs.editor.new()
    },
    next () {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  }
}

</script>
