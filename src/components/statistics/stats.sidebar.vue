<style lang="less" scoped>
@import "../../style/common/colors.less";
.stats-container{
  background: white;
  border: @border-color 1px solid;
  min-height: 160px;
  min-width: 200px;
  margin: 0;
  .chart-container {
    margin-top: 10px !important;
  }
  #profileCompletionGauge {
    padding-top: 15px;
    min-width: 160px;
    min-height: 200px;
    margin: auto;
  }
  .weeklyViewsChart {
    width: 100%;
    min-width: 160px;
    min-height: 160px;
    margin: auto;
  }
  .powered-by {
    /*hidden: true;*/
    font-size: 8px;
    text-align: right;
    padding: 5px;
  }
  .appear-transition {
    transition: all .3s ease;
  }
  .appear-enter, .appear-leave {
    opacity: 0;
    transform: scale(0.2);
  }
  .spinner-container {
    position: relative;
    top: -30px;
    left: -20px;
  }
  .topJoboffers-container {
    margin-top: 10px;
    .section-title {
      margin-bottom: 15px;
      color: #BBBBBB;
      font-size: 15px;
      text-align: center;
    }
    ul.collection {
      overflow: visible !important;
    }
    .podium-number {
      background: #A3E1D4;
      border-radius: 17px;
      width: 34px;
      height: 34px;
      color: #FFFFFF;
      font-size: 16px;
      position: absolute;
      transform: translate(-40px, -15px);
      span {
        position: relative;
        top: 7px;
        left: 1px;
      }
    }
    .podium-details {
      padding-left: 10px;
      .podium-company-name {
        color: #06A2CE;
        font-size: .9em;
        margin: 0;
      }
      .podium-joboffer-title {
        font-size: .85em;
        margin: 0;
      }
    }
  }
}
</style>

<template>
<section class="stats-container card fx-col m-b-sm fx-center-center">
  <div class="fx-row fx-center-center spinner-container">
    <spinner v-if="areChartsReady.length < 1" color="blue" size="medium"></spinner>
  </div>
  <div id="profileCompletionGauge" class="chart-container" v-show="areChartsReady.length >= 1" transition="appear"></div>
  <div class="weeklyViewsChart chart-container" id="weeklyViewsChart" v-show="areChartsReady.length >= 1" transition="appear"></div>
  <div class="weeklyViewsChart chart-container" id="weeklyJoboffersViewsChart" v-show="areChartsReady.length >= 3" transition="appear"></div>

  <div class="topJoboffers-container" v-show="areChartsReady.length >= 1 && topJoboffers.length" transition="appear">
    <p class="section-title">Popular Offers This Week</p>
    <ul class="collection">
      <li class="collection-item" v-for="item in topJoboffers | limit 3" track-by="$index">
        <p class="podium-number col s3"><span>{{$index + 1}}</span></p>
        <div class="podium-details">
          <p class="podium-company-name"><a :href="'#!/joboffer/' + item.slug" target="_blank">{{item.company.name}}</a></p>
          <p class="podium-joboffer-title font-light">{{item.title}}</p>
        </div>
      </li>
    </ul>
  </div>
  <div class="powered-by" v-show="areChartsReady.length >= 1" transition="appear">
    Powered By <a href="https://www.amcharts.com/javascript-charts/" target="_blank">AmCharts</a>
  </div>
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
import spinner from 'shared/spinner'

let moment = require('moment')

module.exports = {
  vuex: {
    actions: {
      loadProfile,
      loadAccount
    }
  },
  computed: {
    profileCompletion () {
      let vm = this
      let item = 0
      let custom = false
      if (vm.profile) {
        if (vm.account.img) item++
        if (vm.profile.about) item++
        if (vm.profile.customsectionscategories && vm.profile.customsectionscategories.length > 0) {
          vm.profile.customsectionscategories.map((category) => {
            if (category.customsections && category.customsections.length > 0) custom = true
          })
          if (custom) item++
        }
        if (vm.profile.experience && vm.profile.experience.length > 0) item++
        if (vm.profile.education && vm.profile.education.length > 0) item++
      }
      return item * 20
    },
    percentMargin () {
      let vm = this
      if (vm.profileCompletion === 100) return -47
      if (vm.profileCompletion < 10) return -20
      return -35
    }
  },
  data () {
    return {
      areChartsReady: [],
      topJoboffers: [],
      profile: {},
      account: {}
    }
  },
  components: {
    spinner
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
      $(`#${event.chart.div.id}`).find('text').addClass('font-light')
      vm.areChartsReady.push(true)
    },
    buildProfileCompletionGauge () {
      let vm = this
      let profileCompletionGaugeChart = window.AmCharts.makeChart('profileCompletionGauge', { // eslint-disable-line no-unused-vars
        'type': 'gauge',
        'fontFamily': 'Roboto',
        'fontWeight': '300',
        'theme': 'light',
        'marginTop': 30,
        'marginLeft': 17,
        'marginRight': 17,
        'axes': [{
          'axisAlpha': 0,
          'tickAlpha': 0,
          'labelsEnabled': false,
          'startValue': 0,
          'endValue': 100,
          'startAngle': 0,
          'endAngle': 360,
          'labelOffset': 45,
          'bands': [{
            'color': '#eee',
            'startValue': 0,
            'endValue': 100,
            'radius': '100%',
            'innerRadius': '98%'
          }, {
            'color': '#06a2c4',
            'startValue': 0,
            'endValue': vm.profileCompletion,
            'radius': '100%',
            'innerRadius': '98%'
          }]
        }],
        'allLabels': [{
          'text': 'Profile Completion',
          'size': 16,
          'bold': false,
          'color': '#BBBBBB',
          'align': 'center'
        }, {
          'text': vm.profileCompletion,
          'size': 50,
          'bold': false,
          'color': '#BBBBBB',
          'align': 'center',
          'y': 70,
          'x': 5
        }, {
          'text': '%',
          'size': 24,
          'bold': false,
          'color': '#BBBBBB',
          'align': 'center',
          'y': 95,
          'x': vm.percentMargin
        }],
        'listeners': [{'event': 'drawn', 'method': vm.onChartInit}]
      })
    },
    buildProfileViewsChart (from, to) {
      let vm = this
      tunlogia.profileVisits({
        id: vm.account.id,
        uuid: vm.account.uuid,
        slug: vm.account.slug
      }, from, to)
      .then((res) => {
        let weeklyViewsChart = window.AmCharts.makeChart('weeklyViewsChart', { // eslint-disable-line no-unused-vars
          'type': 'serial',
          'fontFamily': 'Roboto',
          'theme': 'light',
          'dataProvider': res,
          'marginTop': 40,
          'marginLeft': 30,
          'marginRight': 13,
          'valueAxes': [{
            'position': 'left',
            'axisColor': '#8A8A8A',
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
          'allLabels': [{
            'text': 'Weekly Profile Views',
            'size': 14,
            'bold': false,
            'color': '#BBBBBB',
            'align': 'center'
          }],
          'listeners': [{'event': 'drawn', 'method': vm.onChartInit}]
        })
      })
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
          'marginTop': 40,
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
          'allLabels': [{
            'text': 'Weekly Jobs Views',
            'size': 14,
            'bold': false,
            'color': '#BBBBBB',
            'align': 'center'
          }],
          'listeners': [{'event': 'drawn', 'method': vm.onChartInit}]
        })
      })
    },
    buildJoboffersPodium (from, to) {
      let vm = this
      tunlogia.joboffersPodium(from, to)
      .then((res) => {
        if (res && res.length) {
          let promisesArray = []
          let t = res.slice(0, 3)
          t.forEach((joboffer) => {
            promisesArray.push(connect.apiAsync('GET', `/joboffers/${joboffer.id}?fields=[company,title,slug]`))
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
      vm.buildProfileCompletionGauge()
      vm.buildProfileViewsChart(from, to)
      vm.buildJoboffersViewsChart(from, to)
      vm.buildJoboffersPodium(from, to)
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
  }
}
</script>
