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
<div class="row">

  <div v-show="isReady" class="job-detail border m-none m-b-md m-t-xs col s12  m7 p-none ">
    <div  class=" z-depth-1 p-sm row fx-row fx-start-center   ">
      <div class=" fx-row fx-end-center font-8  m-r-lg  ">
        <i class="material-icons md-18 p-t-xs p-r-sm">share</i> <span class="hand  " @click="shareonFB"><img class="social-image size-32" src="../../../assets/facebook.png"></span>
      </div>

      <div class="fx-row  p-xs" v-if="anonym ">
         <a href="/auth.html" class="border p-xs uppercase hand"><i class="material-icons md-14 m-r-sm orange600">&#xE39D;</i>Please login to Apply</a>
      </div>

      <div class="fx-row " v-if="!isMine && !anonym">
        <div v-if="!joboffer.apply" @click="apply" class="border p-xs uppercase hand pull-right" v-ii18n="apply"><i class="material-icons md-14 orange600">&#xE39D;</i> apply</div>
        <div v-if="joboffer.apply"  class="font-light font-9 m-l-xs uppercase pull-right border p-xs" disabled>
            <i class="material-icons">&#xE065;</i> Applied
        </div>
      </div>
      <span v-if="isMine" @click="closeJoboffer" class="m-l-sm border p-xs uppercase hand text-info m-r-sm"><i class="material-icons md-14 m-r-xs blue600">&#xE7FC;</i>Close The Offer</span>
      <a v-if="isMine" href="/addjoboffer.html#!/{{joboffer.id}}" class=" border p-xs uppercase hand"><i class="material-icons md-14 m-r-xs blue600">&#xE22B;</i>Edit The Offer</a>
      <a v-if="isMine" v-link="{name: 'myjoboffer', params: { jobId: joboffer.slug || joboffer.uuid }}"  class="m-l-sm border p-xs uppercase hand"><i class="material-icons md-14 m-r-xs blue600">&#xE7FC;</i>Manage Applications</a>

    </div>

    <section>
      <section v-if="joboffer" class=" bg-white z-depth-1" >
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
        <div class="fx-row fx-start-center  m-none p-l-md p-t-sm p-b-sm font-light bg-transparent ">
          <p class="m-none font-1 m-r-md break-word" v-if="joboffer.category">
            <i v-if="joboffer.category.name" class="material-icons md-14 orange600">&#xE0B8;</i>
            <span class="font-light">{{joboffer.category.name}}</span>
          </p>
          <p class="m-none font-1 m-r-md break-word" v-if="joboffer.job_type">
            <i v-if="joboffer.job_type.name" class="material-icons md-14 orange600">&#xE88B;</i>
            <span class="font-light">{{joboffer.job_type.name}}</span>
          </p>
          <p class="m-none font-1 m-r-md break-word" v-if="joboffer.location">
            <i v-if="joboffer.location.name"  class="material-icons md-14 orange600">&#xE55E;</i>
            <span class="font-light">{{joboffer.location.name}}</span>
          </p>
          <p class="m-none font-1 m-r-md break-word"  v-if="joboffer.release_date">
            <i class="material-icons md-14 orange600">&#xE8B3;</i>
            <span class=" font-light" v-from-now="joboffer.release_date"></span>
          </p>
          <p v-if="joboffer.responsible && !isMine" class="border-left m-l-lg"  >

            <div v-if="!isMine && joboffer.responsible" class="  fx-row fx-start-center  ">
              <img :src="joboffer.responsible.img ? joboffer.responsible.img   : ''" alt="{{joboffer.responsible.firstname}} {{joboffer.responsible.lastname}} photo" class="circle user-image size-32 hand">
              <span class="m-l-sm">{{joboffer.responsible.firstname}} {{joboffer.responsible.lastname}}</span>
            </div>

          </p>
        </div><!-- Go to www.addthis.com/dashboard to customize your tools -->


  <!-- End of Category , city and job type -->


<!-- Job Poster -->

<!-- End of Job Poster -->

    <section class="" v-if="joboffer">
      <div v-if="joboffer.tags && joboffer.tags.length">

          <div class="p-xs m-t-md m-b-md break-word p-l-lg" >
            <span class=" font-light border p-xxs m-xxs font-1-1"   v-for="tag in joboffer.tags">
              {{tag.name }}
            </span>
         </div>
       </div>

      <div v-if="showDetail" class=" p-none m-none p-none  font-light p-l-md p-b-md font-1-1">


            <div v-if="joboffer.salary_max || joboffer.salary_min" class="m-t-md   row">
              <span class="capital text-orange col m2 " v-ii18n="salary">salary</span>
              <span class="col m8 row ">
                <span class="m-l-sm m-r-xs ">{{joboffer.salary_min | currency}} - {{joboffer.salary_max | currency}}</span>
                <span class="font-8 font-light"> /month</span>
              </span>
            </div>
            <!-- <li class="m-b-sm"><b class="capital" v-ii18n="reward"></b><span class="m-l-sm">{{joboffer.incentive | currency}}</span></li> -->
            <div   v-if="joboffer.degree.name" class="row  m-t-md  ">
              <span class="capital text-orange col m2" v-ii18n="degree">degree</span>
              <span class="col m8">{{joboffer.degree.name}}</span>
            </div>
            <div v-if="joboffer.experience.value" class="m-b-sm m-t-md  row ">
              <span class="capital  text-orange col m2" v-ii18n="experience">experience</span>
              <span class="col m8">{{joboffer.experience.value}} years</span>
            </div>


      </div>


    </section>

<!-- Description Section -->
  <section class=" border-top m-b-md">

    <div class="p-xs p-l-lg m-r-sm ">
      <div class="font-light newline font-1-1"  v-if="joboffer.description && joboffer.description.length > 0">
        {{{joboffer.description | lineBreak}}}
      </div>
      <div class="font-light font-1-5 m-t-lg" v-if="joboffer.requirements && joboffer.requirements.length > 0">
        <span class="capital text-orange" v-ii18n="requirements">requirements</span>
      </div>
      <div v-for="item in joboffer.requirements" track-by="$index" class="font-light p-t-xs font-1-1">
        <i class="material-icons md-14 m-r-sm">&#xE837;</i> {{item}}
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


    <comment-section  class="bg-transparent border-top m-t-lg" v-show="isAuthed" :id="joboffer.id"></comment-section>

    <!-- <div v-if="joboffer.state!='staged'" class="fb-comments p-l-lg col m5" :data-href="url" data-numposts="5" data-width="900"></div> -->

  </div>

<div class="col m5 s12">
  <company  v-if="joboffer.company" ></company>
</div>


</div>
</template>

<script>
require('style/joboffer-details.less')
var bus = require('services/bus')
var connector = require('services/connect.js')
var company = require('./company.details.vue')
var commentSection = require('shared/comment.container.vue')
var myJobFooter = require('./my-joboffer.details.footer.vue')
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
    company,
    commentSection
  },
  data () {
    return {
      listMe: false,
      url: window.location.href
    }
  },
  computed: {
    footer () {
      if (this.isMine) return 'myJobFooter'
      else return ''
    },
    showDetail () {
      return this.joboffer.salary_max || this.joboffer.degree || this.joboffer.experience
    }
  },
  ready () {
    var vm = this
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
