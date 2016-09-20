<template>

  <div v-show="showme" >
    <div class="recomm-card z-depth-3" transition="slide" v-if="details">
      <div class="rc-container fx-row fx-space-between">


        <section class="rc-content border-left p-m">
          <a  @click="hideCard" class="btn-floating close-btn btn waves-effect waves-light red pull-right"><i class="material-icons md-18">&#xE14C;</i></a>

<!-- candidate name and title -->
          <div class="fx-row fx-start-center" v-if="condidate">
            <div  >
              <img  @click="gotoProfile(condidate)" :src="condidate.img  " alt="user" class="user-image circle border size-48 hand m-t-sm">
            </div>
            <div class="m-l-sm ">
              <div>
                <a><h6 @click="gotoProfile(condidate)" class="jdh--title capital m-none hand font-light font-1-5">{{condidate.firstname}} {{condidate.lastname}}</h6></a>
                <span class="capital m-none">{{condidate.title}}</span>
              </div>
            </div>
          </div>
<!-- end of candidate name and title -->


<!-- application status -->
          <div class="fx-row fx-start-center m-t-xs">
            <div class="capital m-r-sm">
              <span  class="capital font-1-2 font-light" v-ii18n="applicationstatus">Application Status</span>
            </div>
            <status class="m-t-xs border" :recom-id="recomId" :recommendation="details"></status>
          </div>
<!-- end of application status -->

<!-- CV -->
<div v-if="application.cv" class="font-light font-1-2 m-t-sm">
  <i class="material-icons blue600">&#xE873;</i>
  <a href="{{application.cv}}-/inline/yes/"  target="_blank"><span class="capital text-info hand">Uploaded CV</span></a>
</div>
<!-- end of CV -->


<!-- candidate about -->
    <div class="m-t-sm" v-if="condidate && condidate.about">
      <label class=" ">
        <span class="capital font-1-2" v-ii18n="about">about</span>
      </label>
      <p class="m-none m-b-xs m-t-xs">{{condidate.about}}</p>
    </div>
<!-- end of candidate about -->

<!-- requirements -->
          <div v-if="application.requirements && application.requirements.length>0" class="m-t-md p-sm bg-transparent">
            <div class="font-light font-1-5 p-b-sm ">
              <span class="capital text-orange" v-ii18n="requirements">requirements</span>
               <span  class=" font-light m-t-lg text-orange m-l-md  ">{{completion}}<span class="" >%</span>
             </span>
            </div>
            <div v-for="requirement in application.requirements" trak-by="$index" class="h-max-250 p-none">
                <div class="input-container m-r-md p-b-xs p-t-xs font-light  ">

                  <span  class="font-1">{{requirement.title}}</span>
                  <i class="material-icons green600 md-18 m-l-sm" v-if="requirement.value" >&#xE86C;</i>
                  <i class="material-icons red600 md-18 m-l-sm" v-else>&#xE5CD;</i>
                </div>
            </div>
          </div>
<!-- end of requirements -->

<!-- Quiz-->
          <div class="m-t-md p-sm bg-transparent" v-if="application && application.responses.length">
            <div class="font-light font-1-5  ">
              <span class="capital text-orange">quiz answer</span>
            </div>
            <div v-for="item in application.responses" class="m-t-md h-max-250 font-light  p-none">
                <div class="m-b-md">
                  <span class="font-1-2" >{{item.question.subject}}</span>
                  <span v-if="item.question.type == 'Y/N'"  class="pull-right text-info font-1-5" >{{item.content}}</span>
                </div>
                <span v-if="item.question.type == 'Free'"  class="text-info font-1-5" >{{item.content}}</span>
            </div>
          </div>
<!-- end of Quiz -->



          <div class="m-t-md" >
            <label class="border-bottom">
              <span class="capital font-1-2 m-t-n-sm" v-ii18n="logs">logs</span>
              <i v-if="details.commentable[0]" v-from-now="details.commentable[0].updated_at"></i>
                <span  @click="editComment" type="button" class="pull-right hand">
                <i v-if="!editable" class="material-icons md-14">&#xE254;</i>
                <i  v-if="editable" class="material-icons md-14">&#xE161;</i>
                   {{editable ? 'Save' : 'Edit'}}
              </span>
            </label>
            <p v-if="details.commentable[0]" class="m-none m-b-xs rc-comment" contentEditable="{{editable}}" v-el:comment>{{details.commentable[0].comment}}</p>
            <p v-else class="m-none m-b-xs rc-comment" contentEditable="{{editable}}" v-el:comment></p>
          </div>

          <div v-if="details.historyable && details.historyable.length" class="m-t-sm">
            <div  >
              <span class="capital font-1-2 " v-ii18n="history">history</span>
            </div>
            <ul class="timeline">
              <li class="tl-item" track-by="$index" v-for="history in details.historyable">
                <div class="tl-head fx-row fx-start-center">
                  <h6 class="m-none capital p-r-xs">{{history.item}}
                    <span class="font-9" v-ii18n="changed">changed</span>
                  </h6>
                  <i v-from-now="history.updated_at"></i>
                </div>
                <p class="capital m-none m-t-xs">
                  <span v-ii18n="changedFrom">changed from</span>
                  <b>{{history.oldvalue}}</b>
                  to
                  <b>{{history.newvalue}}</b>
                </p>
              </li>
            </ul>
          </div>

        </section>

      </div>

    </div>
  </div>

</template>

<script>
var connector = require('services/connect.js')
var bus = require('services/bus')
var status = require('shared/dropdown.status.vue')

// import {getRecommendationIds} from 'store/joboffer/getters.joboffer'

module.exports = {
  // vuex: {
  //   getters: {
  //     list: getRecommendationIds
  //   }
  // },
  data () {
    return {
      condidate: null,
      showme: false,
      isToggled: false,
      recomId: null,
      details: null,
      jobId: null,
      editable: false,
      application: null
    }
  },
  // props: {
  //   list: {
  //     type: Array,
  //     require: true
  //   }
  // },
  ready () {
    // this.jobId = this.$route.params.jobId
    bus.$on('recommended:show-side', this.showCard)
    bus.$on('joboffer:rec-state-changed', (data) => this.details.historyable.$set(this.details.historyable.length, data))
  },
  destroyed () {
    bus.$off('recommended:show-side')
    bus.$off('joboffer:rec-state-changed')
  },
  components: {
    status: status
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
  methods: {
    showCard (application) {
      this.jobId = application.joboffer_id
      this.showme = true
      this.recomId = application.id
      this.getRecommend(application.id)
      this.editable = false
      console.log(application)
      this.application = application
    },
    hideCard (argument) {
      // this.condidate = null
      this.details = null
      this.showme = false
    },
    toggle () {
      this.isToggled = !this.isToggled
    },
    getRecommend (_recomId_) {
      let vm = this
      let jobId = this.jobId
      connector.apiAsync('GET', '/dashboard/joboffers/' + jobId + '/recommendations/' + _recomId_)
      .then((res) => {
        vm.details = res
        vm.condidate = res.target
      })
    },
    editComment () {
      let _backup
      let _comment = this.$els.comment.innerText || ' '
      if (!this.editable) {
        this.editable = true
        _backup = _comment
      } else {
        this.editable = false
        if (_backup == _comment) return
        this.sendComment(_comment, _backup)
      }
    },
    sendComment (_new_, _old_) {
      let vm = this
      connector.apiCall({
        comment: _new_
      }, '/dashboard/joboffers/' + this.jobId + '/recommendations/' + this.recomId + '/comment', 'POST', (error, response) => {
        if (error) vm.$els.comment.innerText = _old_
      })
    },
    gotoProfile (condidate) {
      var id = condidate.slug ? condidate.slug : condidate.uuid
      window.location.replace(window.location.origin + '/profile.html#!/' + id)
    }
  }
}

</script>
