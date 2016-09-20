<style lang="less" scoped>

</style>

<template>
  <div v-if="showme" >
    <div class="recomm-card z-depth-3" transition="slide">
      <div class="rc-container fx-row fx-space-between">

        <section class="rc-content border-left p-m">
          <a  @click="hideCard" class="btn-floating close-btn btn waves-effect waves-light red pull-right"><i class="material-icons md-18">&#xE14C;</i></a>

          <div class="row fx-start-center m-t-md" v-if="application && application.target">
            <div class="col m2">
              <img  @click="gotoProfile(application.target)" :src="application.target.img  " alt="user" class="user-image circle border size-48 hand m-t-sm">
            </div>
            <div class="p-l-sm m-t-md col m10">
              <div>
                <a><h6 @click="gotoProfile(application.target)" class="jdh--title capital m-none hand">{{application.target.firstname}} {{application.target.lastname}}</h6></a>
                <span class="capital m-none">{{application.target.title}}</span>
              </div>
            </div>
          </div>

          <div v-if="application.requirements && application.requirements.length>0" class="m-t-lg">
            <div class="font-light font-1-5 m-t-lg">
              <span class="capital text-orange" v-ii18n="requirements">requirements</span>
               <div  class=" font-light m-t-lg  font-1-5">{{completion}}<span class="m-l-md text-info" >%</span>
               </div>
            </div>
            <div v-for="requirement in application.requirements" trak-by="$index" class="h-max-250 p-none">
                <p class="input-container m-r-md  p-b-sm m-t-md">
                  <input type="checkbox" id="requirement-{{$index}}" v-model="requirement.value" disabled="disabled"/>
                  <label for="requirement-{{$index}}">{{requirement.title}}</label>
                </p>
            </div>
          </div>

          <div v-if="application && application.responses.length">
            <div class="font-light font-1-5 m-t-lg">
              <span class="capital text-orange">quiz answer</span>
            </div>
            <div v-for="item in application.responses" class="m-t-md h-max-250 font-light  p-none">
                <div class="m-b-md">
                  <span class="font-1-2" >{{item.question.subject}}</span>
                  <span v-if="item.question.type == 'Y/N'"  class="pull-right text-info font-1-5" >{{item.content}}</span>
                </div>
                <span v-if="item.question.type == 'Free'"  class="text-info font-1-5" >{{item.content}}</span>
            </div>
            <div v-if="application.cv" class="font-light font-1-5 m-t-lg">
              <a href="{{application.cv}}-/inline/yes/"  target="_blank"><span class="capital text-orange hand">CV</span></a>
            </div>
          </div>
      </section>
      </div>
    </div>
  </div>

</template>

<script>
var bus = require('services/bus')
module.exports = {
  data () {
    return {
      application: null,
      showme: false,
      isToggled: false
    }
  },
 computed: {
   completion () {
     let vm = this
     let response = 0
     if (this.application.requirements && this.application.requirements.length > 0) {
       vm.application.requirements.map((item) => {
         if (item.value == true) response++
       })
       return Math.round((response * 100) / this.application.requirements.length)
     } else vm.completion = 0
   }
  },
  ready () {
    bus.$on('application:show-side', this.showApplication)
  },
  destroyed () {
    bus.$off('recommended:show-side')
  },
  methods: {
    showApplication (application) {
      this.application = application
      this.showme = true
    },
    hideCard (argument) {
      this.showme = false
      this.application = null
    },
    toggle () {
      this.isToggled = !this.isToggled
    },
    gotoProfile (condidate) {
      var id = condidate.slug ? condidate.slug : condidate.uuid
      window.location.replace(window.location.origin + '/profile.html#!/' + id)
    }
  }
}

</script>
