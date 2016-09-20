<style lang="less" scoped>
td{
  padding: 10px 10px 10px 10px !important;
}
.group-name{
  display: inline-block;
  max-width: 200px;
  max-height: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
<template>
    <div class=" m-none p-sm m-l-xs">
        <span class="p-xs font-light font-1-2 sans-serif capital"><i class="fa fa-bars font-9 m-r-xs"></i><span>Job Applications</span></span>
        <span class="m-r-md">
          <input type="checkbox" id="open" />
          <label for="open">Open</label>
        </span>
        <span>
          <input type="checkbox" id="closed" />
          <label for="closed">Closed</label>
        </span>
        <span class="text-success hand m-l-lg btn-white p-xs">
            Filter
        </span>


        <div class="row m-t-lg">
          <div class="col m9 s12">
            <div  v-for="item in applicationList" track-by="$index" class="row bg-white p-xs m-b-xs">

              <div v-if="item.joboffer.company" class="row m-b-sm">
                <span class="font-light ">
                  <i class="fa fa-dot-circle-o" aria-hidden="true"></i>
                  <span class="font-1-2">{{item.joboffer.company.name}}</span>  |  <span> {{item.joboffer.title}}</span>
              </div>

              <div class="row font-light">
                  <div class="col s3">
                    Applied {{item.created_at | moment "from" "now" }}
                  </div>
                  <div  class="col s3">
                   {{count(item.joboffer)}} Applications
                  </div>
              <!--     <div  class="col s1">
                    <i class="material-icons md-18">&#xE0E1;</i>
                  </div> -->
                  <div v-if="item.joboffer.company" class="col s2">
                    <span class="label p-xxs" :class="labelClass[item.state]">{{item.state}}</span>
                  </div>
                  <div @click="viewDetail(item.joboffer)" class="capital font-light font-9 hand col s2  ">View <i class="material-icons">chevron_right</i></div>
                </div>
            </div>
          </div>
          <div class="col m5 s12">

          </div>
        </div>




        <div class="reclist m-sm bg-white ">
            <section v-if="!applicationList.length" class="fx-col fx-start-center placeholder">
              <i class="fa fa-exclamation-circle symbol"></i>
              <!-- <h2 class="m-none capital" v-ii18n="">No one recommended yet</h2> -->
              <p class="m-none capital" v-ii18n="">You didn't apply to any joboffer yet</p>
            </section>
        </div>

    </div>
</template>
<script>
var connector = require('services/connect.js')

module.exports = {
  data () {
    return {
      error: '',
      // recommenderList: [],
      // recommendedList: [],
      applicationList: [],
      labelClass: {
        'pending': 'label-warning',
        'pushed': 'label-info',
        'rejected': 'label-danger',
        'hired': 'label-success',
        'phone interview': 'label-primary',
        'office interview': 'label-primary'
      }
    }
  },
  props: {
    profileId: {
      type: Number,
      require: true
    }
  },
  ready () {
    var that = this
    connector.apiCall('', '/dashboard/recommendations', 'GET', function (error, response) {
      if (!error) {
        response.map(function (e) {
          // if (e.recommended == that.profileId && e.type == 'recommendation') that.recommendedList.push(e)
          if (e.recommended == that.profileId && e.type == 'application') that.applicationList.push(e)
          // if (e.recommender == that.profileId) that.recommenderList.push(e)
        })
      }
    })
  },
  methods: {
    count (item) {
      var result = 0
      if (!item || !item.statistic || !item.statistic.length) return result
      if (item.statistic.length > 0) {
        item.statistic.map((app) => {
          if (app.type == 'application') {
            result = app.count
          }
        })
        return result
      }
    },
    viewDetail (joboffer) {
      var jobId = joboffer.slug ? joboffer.slug : joboffer.uuid
      window.location.replace(window.location.origin + '/#!/joboffer/' + jobId)
    }
  }
}
</script>
