<style lang="less" scoped>
.down-menu {
    position: absolute;
    z-index: 100 !important;
    list-style: none;
    min-width: 120px;
    border-radius: 2px;
    li {
      &:first-child {
        border-top: 0;
      }
      &:hover {
          transform: translateX(1px);
      }
    }
}
.drop-down {
    position: relative;
    display: inline-block;
}

</style>
<template>

<div v-show="isReady" class="row">


            <div class="col m7 s12">

                <section v-if="!anonym  "  >
                  <my-job-footer :job-id="joboffer.id"></my-job-footer>
                </section>
              </div>

              <div  class="job-detail m-none m-b-md m-t-xs col s12  m5 p-none ">

                      <recomside></recomside>
                      <chatside></chatside>



                        <section v-if="joboffer" class="" >

                                <div class="bg-white  z-depth-1">
                                                  <!--  top right options -->
                                                  <div class="fx-row right p-xs " v-if="!anonym ">

                                                    <div v-if="isMine" id="drop-down" class="drop-down hand font-1-2 bold" @click="showmenu()">
                                                      <div class="p-xxs">
                                                        <i class="material-icons md-20 orange600 border">&#xE313;</i>
                                                      </div>
                                                      <div class="flesh" v-show="listMe"></div>
                                                      <ul class="border bg-white down-menu p-xxs m-none m-t-xs" v-show="listMe">
                                                        <li class="capital border-top p-xxs font-8" @click="editJoboffer">
                                                          <i class="material-icons m-r-xs md-14">&#xE254;</i>Edit
                                                        </li>
                                                        <li class="capital border-top p-xxs font-8"  @click="closeJoboffer">
                                                          <i class="material-icons m-r-xs md-14">&#xE5C9;</i>close
                                                        </li>
                                                      </ul>
                                                    </div>
                                                    <div class="fx-row" v-if="!isMine">
                                                      <span v-if="!joboffer.apply" @click="apply" class="border p-xs uppercase hand" v-ii18n="apply">
                                                        <i class="material-icons md-14 orange600">&#xE39D;</i> apply
                                                      </span>
                                                      <div v-if="joboffer.apply"  class="font-light font-9 m-l-xs uppercase" disabled>
                                                        <i class="material-icons">&#xE065;</i>
                                                      </div>
                                                    </div>
                                                  </div>

                                <!-- end of top right options -->

                                <!-- Company and Job Title -->
                                                  <div class="fx-row p-none p-l-md p-t-lg p-b-sm" v-if="joboffer.company">
                                                    <a v-link="'/company/'+ joboffer.company.slug || joboffer.company.uuid"  class="pointer">
                                                      <img :src="joboffer.company && joboffer.company.logo ? joboffer.company.logo    : ''" alt="company-logo" class="img-rounded border size-48 company-image">
                                                    </a>
                                                    <div flex class="m-l-sm">
                                                      <a v-link="'/company/'+ joboffer.company.slug" ><h4 class="capital m-none break-word font-light font-1-2 hand text-info m-b-xs">{{joboffer.company.name}}</h4></a>
                                                      <h4 class="jdh--title capital font-light font-1-2 m-none break-word m-t-sm">{{joboffer.title}}</h4>
                                                    </div>
                                                  </div>
                                <!-- end of Company and Job Title -->

                                <!-- Category , city and job type -->
                                                    <div class="fx-row m-none p-l-md p-t-sm p-b-sm font-light bg-transparent ">
                                                      <p class="m-none font-1 m-r-sm break-word" v-if="joboffer.category">
                                                        <i v-if="joboffer.category.name" class="material-icons md-14 orange600">&#xE0B8;</i>
                                                        <span class="font-light">{{joboffer.category.name}}</span>
                                                      </p>
                                                      <p class="m-none font-1 m-r-sm break-word" v-if="joboffer.job_type">
                                                        <i v-if="joboffer.job_type.name" class="material-icons md-14 orange600">&#xE88B;</i>
                                                        <span class="font-light">{{joboffer.job_type.name}}</span>
                                                      </p>
                                                      <p class="m-none font-1 m-r-sm break-word" v-if="joboffer.location">
                                                        <i v-if="joboffer.location.name"  class="material-icons md-14 orange600">&#xE55E;</i>
                                                        <span class="font-light">{{joboffer.location.name}}</span>
                                                      </p>
                                                      <p class="m-none font-1 m-r-sm break-word"  v-if="joboffer.release_date">
                                                        <i class="material-icons md-14 orange600">&#xE8B3;</i>
                                                        <span class=" font-light" v-from-now="joboffer.release_date"></span>
                                                      </p>
                                                    </div>
                                <!-- End of Category , city and job type -->


                                <!-- Job Poster -->
                                                  <section class="row m-none p-none m-t-sm m-l-lg m-b-sm" v-if="joboffer.responsible">
                                                    <div class="  fx-row fx-start-center col m6">
                                                      <img :src="joboffer.responsible.img ? joboffer.responsible.img   : ''" alt="{{joboffer.responsible.firstname}} {{joboffer.responsible.lastname}} photo" class="circle user-image size-32 hand">
                                                      <span class="m-l-sm">{{joboffer.responsible.firstname}} {{joboffer.responsible.lastname}}</span>
                                                    </div>
                                                    <div class=" col offset-m4 m2 m-b-sm fx-row fx-start-center font-8 p-none ">
                                                      <i class="material-icons md-18 p-t-xs p-r-sm">share</i>
                                                      <span class="hand  " @click="shareonFB">
                                                        <img class="social-image size-32" src="../../../assets/facebook.png">
                                                      </span>
                                                    </div>
                                                  </section>
                                <!-- End of Job Poster -->


                                          <ul class="collapsible z-depth-0" data-collapsible="accordion">
                                                <li>

                                                     <div class="collapsible-header z-depth-0">
                                                        View/hide Details <i class="material-icons">&#xE5C5;</i>
                                                     </div>

                                                      <div class="collapsible-body">


                                <!-- Tags -->
                                                                <div v-if="joboffer.tags && joboffer.tags.length">
                                                                    <div class="p-xs m-t-md m-b-md break-word p-l-lg" >
                                                                      <span class=" font-light border p-xxs m-xxs font-1-1"   v-for="tag in joboffer.tags">
                                                                        {{tag.name }}
                                                                      </span>
                                                                   </div>
                                                                 </div>
                                <!-- end of Tags -->
                                <!-- salary, degree, etc.. -->
                                                                  <div class="fx-row p-none m-none">
                                                                    <div v-if="showDetail" class="jd-section p-xs border-top p-l-lg" flex>
                                                                       <div class=" p-none m-none m-t-xs font-light font-1-1 border-bottom"  v-if="joboffer.salary_max || joboffer.degree.name || joboffer.experience.value">
                                                                        <div v-if="joboffer.salary_max" class="m-b-sm">
                                                                          <span class="capital text-orange  " v-ii18n="salary">salary</span>
                                                                          <span class="m-l-sm m-r-xs ">{{joboffer.salary_min | currency}} - {{joboffer.salary_max | currency}}</span>
                                                                          <span class="font-8 font-light"> /month</span>
                                                                        </div>
                                                                         <div class="m-b-sm" v-if="joboffer.degree.name">
                                                                          <span class="capital text-orange" v-ii18n="degree">degree</span>
                                                                          <span class="m-l-sm">{{joboffer.degree.name}}</span>
                                                                        </div>
                                                                        <div v-if="joboffer.experience.value" class="m-b-sm">
                                                                          <span class="capital  text-orange" v-ii18n="experience">experience</span>
                                                                          <span class="m-l-sm">{{joboffer.experience.value}} years</span>
                                                                        </div>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                <!-- end of salary, degree, etc.. -->


                                <!-- Description Section -->
                                                                  <section class="bg-transparent">

                                                                    <div class="p-xs p-l-lg m-r-sm">
                                                                      <div class="font-light newline font-1-1"  v-if="joboffer.description && joboffer.description.length > 0">
                                                                        {{{joboffer.description | lineBreak}}}
                                                                      </div>
                                                                      <div class="font-light font-1-5 m-t-lg" v-if="joboffer.requirements && joboffer.requirements.length > 0">
                                                                        <span class="capital text-orange" v-ii18n="requirements">requirements</span>
                                                                      </div>
                                                                      <div v-for="item in joboffer.requirements" track-by="$index" class="font-light newline font-1-1">
                                                                        {{item}}
                                                                      </div>

                                                                      <div class="font-light font-1-5 m-t-lg" v-if="joboffer.benefits && joboffer.benefits.length > 0">
                                                                        <span class="capital text-orange" v-ii18n="benefits">benefits</span>
                                                                      </div>
                                                                      <div class="font-light newline font-1-1" v-if="joboffer.benefits && joboffer.benefits.length > 0">
                                                                        {{{joboffer.benefits | lineBreak}}}
                                                                      </div>
                                                                    </div>
                                                                  </section>
                                <!-- end of Description Section -->


                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>

                                        </section>
                                        <collaborators class="z-depth-1" v-if="!anonym && isMine && joboffer.state!='staged'" :joboffer="joboffer"></collaborators>
                                        <comment-section class="bg-white z-depth-1 p-t-sm m-t-sm" v-show="isAuthed" :id="joboffer.id"></comment-section>

                  <!-- <div v-if="joboffer.state!='staged'" class="fb-comments p-l-lg col m5" :data-href="url" data-numposts="5" data-width="900"></div> -->

                </div>




</div>
</template>

<script>
require('style/joboffer-details.less')
var bus = require('services/bus')
var connector = require('services/connect.js')
var commentSection = require('shared/comment.container.vue')
var myJobFooter = require('./my-joboffer.details.footer.vue')
var collaborators = require('./all-collaborators.list.vue')
var recomside = require('./recommended.side.vue')
var applicationSide = require('./application.side.vue')
var chatside = require('../../messenger/messenger.side.vue')
import {getJobofferData, isReady, isMine} from 'store/joboffer/getters.joboffer'
import {isAuthed} from 'store/account/getters.account'

module.exports = {
  vuex: {
    getters: {
      joboffer: getJobofferData,
      jobId: ({joboffer}) => joboffer.data.id,
      anonym: ({account}) => account.loaded === 'unauth',
      isMine,
      isReady,
      isAuthed
    }
  },
  components: {
    myJobFooter,
    collaborators,
    recomside,
    chatside,
    commentSection,
    applicationSide
  },
  data () {
    return {
      listMe: false,
      url: window.location.href
    }
  },
  computed: {
    showDetail () {
      return this.joboffer.salary_max || this.joboffer.degree || this.joboffer.experience
    }
  },
  ready () {
    var vm = this
    $('.collapsible').collapsible({
     accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    })
    bus.$on('deleteJoboffer:callback', function (status, id) {
      if (status) {
        connector.apiCall('', '/dashboard/joboffers/' + id, 'PUT', function (error, response) {
          if (!error) {
            window.location = '/dashboard.html#!/'
          }
        })
      }
    })
    this.clickOut = function (event) {
      if ($(event.target).closest('#drop-down').length) return true
      vm.showmenu(null)
    }
  },
  destroyed () {
    bus.$off('deleteJoboffer:callback')
  },
  methods: {
    apply () {
      bus.$emit('joboffer:apply', this.joboffer)
    },
    share () {
      bus.$emit('joboffer:share', this.joboffer)
    },
    closeJoboffer () {
      bus.$emit('confirm:open', 'Close JobOffer', 'Are you sure to close this job offer', 'confirm', 'deleteJoboffer', this.jobId)
    },
    editJoboffer () {
       window.location = '/addjoboffer.html#!/' + this.joboffer.id
    },
    showmenu () {
      this.listMe = !this.listMe
      if (this.listMe) $(document).bind('click', this.clickOut)
      else $(document).unbind('click', this.clickOut)
    },
    shareonFB () {
      // console.log(window.location)
      FB.ui(
      {
        method: 'share',
        href: window.location.href,
        title: this.joboffer.title + ' at ' + this.joboffer.company.name,
        caption: 'Jobi.tn | Jobs in Style',
        picture: 'http://www.jobi.tn/static/jobi_sml.jpg',
        description: this.joboffer.description ? this.joboffer.description.substring(0, 200) + '...' : ''
      },
      // callback
      function (response) {
        if (response && !response.error_message) {
          console.log('Posting completed.')
        } else {
          console.log('Error while posting.')
        }
      })
    }
  }
}
</script>
