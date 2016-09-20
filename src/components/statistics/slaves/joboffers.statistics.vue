<style lang="less" scoped>
.latest-messages-container {
  min-height: 425px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  .section-title {
    margin: 0;
    padding: 10px 0 15px 0;
    color: #666;
    font-size: 1.2em;
    text-align: center;
  }
  .weeklyViewsChart {
    width: 100%;
    min-width: 160px;
    min-height: 150px;
    margin: auto;
  }
  .topJoboffers-container {
    margin-top: 10px;
    .sub-section-title {
      color: #666;
      font-size: 1.2em;
      text-align: left;
      margin-bottom: 5px;
      padding-left: 15px;
    }
    ul.collection {
      overflow: visible !important;
      .collection-item {
        padding: 7px 10px !important;
        position: relative;
      }
    }
    .no-border {
      border: none;
    }
    .podium-number {
      background: #A3E1D4;
      border-radius: 15px;
      width: 30px;
      height: 30px;
      color: #FFFFFF;
      font-size: 1.2em;
      margin: 0;
      text-align: center;
      position: relative;
      top: 2px;
      span {
        position: relative;
        top: 5px;
      }
    }
    .podium-details {
      padding-left: 10px;
      max-width: 140px;
      .podium-company-name {
        color: #06A2CE;
        font-size: .9em;
        margin: 0;
      }
      .podium-joboffer-title {
        font-size: .86em;
        margin: 0;
      }
    }

  }
  .view-all {
    position: absolute;
    right: 10px;
    bottom: 5px;
  }
  .loading-text {
    text-align: center;
    padding: 10px;
  }
}
</style>

<template>
<section class="latest-messages-container">
  <p class="section-title">Job Offer Views</p>
  <div v-show="!isChartReady" class="loading-text">Loading...</div>
  <div class="weeklyViewsChart chart-container" id="weeklyJoboffersViewsChart" v-show="isChartReady" transition="appear"></div>
  <div class="topJoboffers-container" v-show="isChartReady && topJoboffers.length" transition="appear">
    <div class="sub-section-title center">Top Offers</div>
    <ul class="collection no-border">
      <li class="collection-item fx-row" v-for="item in topJoboffers | limit 2" track-by="$index">
        <p class="podium-number fx-start"><span>{{$index + 1}}</span></p>

        <div class="podium-details fx-center">
          <p class="podium-company-name font-light"><a :href="host + '#!/joboffer/' + item.slug" target="_blank">{{item.company.name}}</a></p>
          <p class="podium-joboffer-title font-light">
            {{item.title.substring(0,20)}}...
          </p>
          <div class="views-number-container font-light font-9">
            <span class="views-number">{{item.count}} Views</span>
          </div>
        </div>

      </li>
    </ul>
  </div>
  <!-- <a href="" class="font-light center view-all">View All</a> -->
</section>
</template>

<script>
require('amcharts/amcharts/amcharts')
require('amcharts/amcharts/gauge')
require('amcharts/amcharts/serial')
require('amcharts/amcharts/themes/light')

import {loadProfile} from 'store/profile/actions.profile'
import {loadAccount} from 'store/account/actions.account'

import connect from 'services/connect.js'
import tunlogia from 'services/tunlogia'

let moment = require('moment')

module.exports = {
  vuex: {
    actions: {
      loadProfile,
      loadAccount
    },
    getters: {}
  },
  data () {
    return {
      isChartReady: false,
      topJoboffers: [],
      profile: {},
      account: {},
      host: window.location.protocol + '//' + window.location.hostname
    }
  },
  ready () {
    let vm = this
    vm.loadProfile()
    .then((res) => {
      vm.profile = res
      return vm.loadAccount()
    })
    .then((res) => {
      vm.account = res
      vm.onAmchartsReady()
    })
  },
  filters: {
    limit: function (arr, limit) {
      return arr.slice(0, Number(limit))
    }
  },
  methods: {
    onChartInit (event) {
      let vm = this
      let $ = window.jQuery
      $(`#${event.chart.div.id}`).find('a').toggle()
      vm.isChartReady = true
    },
    buildJoboffersViewsChart (from, to) {
      let vm = this
      tunlogia.joboffersVisits(from, to)
      .then((res) => {
        let weeklyJoboffersViewsChart = window.AmCharts.makeChart('weeklyJoboffersViewsChart', { // eslint-disable-line no-unused-vars
          'type': 'serial',
          'fontFamily': 'Roboto',
          'theme': 'light',
          'dataProvider': res,
          'marginLeft': 30,
          'marginRight': 13,
          'valueAxes': [{
            'position': 'left',
            'axisColor': '#8E8E8E',
            'fontSize': 8,
            'ignoreAxisWidth': true
          }],
          'graphs': [{
            'id': 'g1',
            'fillAlphas': 0.4,
            'valueField': 'visits',
            'lineThickness': 2,
            'negativeLineColor': '#637bb6',
            'type': 'smoothedLine',
            'balloonText': '<div style="margin:5px; font-size:14px;">Visits: <b>[[value]]</b></div>'
          }],
          'chartCursor': {
            'zoomable': false,
            'categoryBalloonDateFormat': 'DD MMMM',
            'cursorPosition': 'mouse'
          },
          'categoryField': 'date',
          'categoryAxis': {
            'minPeriod': 'hh',
            'parseDates': true,
            'axisColor': '#8A8A8A',
            'fontSize': 8
          },
          'listeners': [{'event': 'drawn', 'method': vm.onChartInit}]
        })
      })
    },
    buildJoboffersPodium (from, to) {
      let vm = this
      tunlogia.joboffersPodium(from, to)
      .then((res) => {
        if (res.length) {
          let promisesArray = []
          let t = res.slice(0, 3)
          t.forEach((joboffer) => {
            promisesArray.push(connect.apiAsync('GET', `${joboffer.id}?fields=[company,title,slug]`))
          })
          Promise.all(promisesArray)
          .then((joboffers) => {
            joboffers.forEach((joboffer, i) => (joboffer.count = t[i].count))
            vm.topJoboffers = joboffers
          })
        }
      })
    },
    onAmchartsReady () {
      let vm = this
      if (!window.AmCharts) return setTimeout(() => vm.onAmchartsReady(), 500)
      let from = moment().subtract(6, 'days').format('YYYY-MM-DD')
      let to = moment().add(1, 'days').format('YYYY-MM-DD')
      vm.buildJoboffersViewsChart(from, to)
      vm.buildJoboffersPodium(from, to)
    }
  }
}
</script>
