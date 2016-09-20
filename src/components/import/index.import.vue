<style>
  .alertBox{
    margin-top: -7px !important;
    color: #8a6d3b;
    background-color: #fcf8e3;
    border-color: #faebcc;
    border: 1px solid #faebcc;
    border-radius: 4px;
    padding: 5px !important;
  }
</style>
<template>
<div class="page-container row">
    <topnav></topnav>
    <div class="profile-details col s7 p-none m-t-lg offset-s2">
      <div class="panel-body hpanel profile-panel p-none m-b-sm m-l-xs bg-white z-depth-2 font-slim ">
          <div  class="m-none row fx-row" v-if="order.about">
            <div class="col s3 bg-black text-white p-sm">
              {{order.about}}.  About
            </div>
            <div class="col s9 p-sm">
                  <p class="input-container fx-column fx-center-center" v-if="source.pictureUrl">
                    <input type="checkbox" id="img" v-model="chosen.img" />
                    <label for="img">
                      <img :src="source.pictureUrl" class="user-image circle size-48" alt="logo">
                    </label>
                  </p>
                  <br>
                  <p class="input-container fx-column fx-center-center m-t-sm" v-if="source.firstName && source.lastName">
                    <input type="checkbox" id="name" v-model="chosen.name" />
                    <label for="name">
                      <span class="font-light font-1-5 text-light font-uppercase "></span>
                      <span class="font-8 m-t-xs font-uppercase">{{source.firstName}} {{source.lastName}}</span>
                    </label>
                  </p>
                  <p class="input-container fx-column fx-center-center" v-if="source.title">
                    <input type="checkbox" id="title" v-model="chosen.title" />
                    <label for="title">{{source.title}}</label>
                  </p>

                  <p class="input-container fx-column fx-center-center" v-if="source.about">
                    <input type="checkbox" id="about" v-model="chosen.about" />
                    <label for="about" >{{source.about}}</label>
                  </p>
            </div>
          </div>
          <div  class="m-none row fx-row" v-if="order.education">
            <div class="col s3 bg-black text-white p-sm">
              {{order.education}}.  EDUCATION
            </div>
            <div class="col s9 p-sm">
              <span v-for="item in source.educationrecords" >
                <p class="input-container fx-row fx-space-between-center">
                  <input type="checkbox" id="item-{{$index}}" v-model="item.selected" />
                  <label for="item-{{$index}}" class="w-max-300 w-min-200 inline-block">{{item.title}} {{item.school.name}}</label>
                  <label for="item-{{$index}}" class="p-r-lg">{{item.since}}</label>
                  <label for="item-{{$index}}" class="p-r-lg">{{item.until}}</label>
                </p>
                <div class="row alertBox" v-if="item.duplicated"> <i class="material-icons">ic_warning</i> This education is already exists on your profile </div>
              </span>
            </div>
          </div>
          <div  class="m-none row fx-row"  v-if="order.experience">
            <div class="col s3 bg-black text-white p-sm">
              <span>{{order.experience}}.  EXPERIENCE</span>
            </div>
            <div class="col s9 p-sm">
                <span v-for="item2 in source.workrecords">
                  <p class="input-container fx-row fx-space-between-center">
                    <input type="checkbox" id="item2-{{$index}}" v-model="item2.selected" />
                    <label for="item2-{{$index}}" class="w-max-300 w-min-200 inline-block">{{item2.title}} {{item2.company.name}}</label>
                    <label for="item2-{{$index}}" class="p-r-lg">{{item2.since}}</label>
                    <label for="item2-{{$index}}" class="p-r-lg">{{item2.until}}</label>
                  </p>
                  <div class="row alertBox" v-if="item2.duplicated"> <i class="material-icons">ic_warning</i> This work is already exists on your profile </div>
                </span>
                  <div class="pull-right">
                    <button @click="save" class="btn-floating btn-large waves-effect waves-light bay-leaf"><i class="material-icons">done</i></button>
                  </div>
            </div>
          </div>
      </div>
    </div>
    <bottomfooter></bottomfooter>
</div>

</template>

<script>
require('style/common/panel.less')
var topnav = require('shared/top_nav.vue')
var bottomfooter = require('shared/footer.vue')
var connector = require('services/connect.js')
// var {accountData} = require('store/account/getters.account')
module.exports = {
  data () {
    return {
      source: {},
      chosen: {
        about: true,
        img: true,
        title: true,
        name: true
      },
      order: {
        about: 0,
        education: 0,
        experience: 0
      }
    }
  },
  components: {
    topnav: topnav,
    bottomfooter: bottomfooter
  },
  ready () {
    console.log(this.$route.params.type)
    // import
  },
  created: function () {
    var vm = this
    connector.apiAsync('GET', '/import/' + this.$route.params.type + '/get', '')
    .then((res) => {
      vm.source = res
      let i = 0
      if (vm.source.pictureUrl || (vm.source.firstName && vm.source.lastName) || vm.source.title || vm.source.about) {
        i++
        vm.order.about = i
      }
      if (vm.source.educationrecords && vm.source.educationrecords.length) {
        i++
        vm.order.education = i
      }
      if (vm.source.workrecords && vm.source.workrecords.length) {
        i++
        vm.order.experience = i
      }
    })
    .catch(() => {})
  },
  methods: {
    save () {
      let data = Object.assign({}, this.source)
      if (!this.chosen.about) delete data.about
      if (!this.chosen.img) delete data.pictureUrl
      if (!this.chosen.title) delete data.title
      if (!this.chosen.name) {
        delete data.firstName
        delete data.lastName
      }
      if (data.workrecords) data.workrecords = data.workrecords.filter((i) => i.selected)
      if (data.educationrecords) data.educationrecords = data.educationrecords.filter((i) => i.selected)
      connector.apiAsync('PUT', '/import/facebook/import', data)
      .then((res) => {
        window.location = window.location.origin + '/profile.html'
        // if (next) router.$router.go({ name: 'job-description', params: {jobId: res.id} })
        // else window.location = window.location.origin
      })
    }
  }
}

</script>
