<style lang="less" scoped>
@import "../../style/common/colors.less";
.stats-container{
  background: white;
  min-height: 160px;
  min-width: 200px;
  margin: 0;
  .spinner-container {
    position: relative;
    top: -30px;
    left: -20px;
  }
  .open-joboffers-container {
    text-align: center;
    padding-top: 10px;
    .joboffers-number {
      color: #06A2CE;
      font-size: 2.5em;
      margin: 0;
    }
    .sub-title {
      color: #AAA;
      font-size: 1.1em;
      margin: 0;
    }
  }
  .topJoboffers-container {
    margin-top: 10px;
    hr {
      border-color: #FFFFFF;
    }
    .section-title {
      margin-bottom: 15px;
      color: #AAA;
      font-size: 1.1em;
      text-align: center;
    }
    ul.collection {
      border: none;
      .collection-item {
        padding: 7px 4px !important;
      }
    }
    .podium-number {
      background: #A3E1D4;
      border-radius: 19px;
      width: 33px;
      height: 33px;
      color: #FFFFFF;
      font-size: 1em;
      margin: 3px 0 0 5px;
      text-align: center;
      span {
        position: relative;
        top: 5px;
      }
    }
    .podium-details {
      padding-left: 10px;
      max-width: 135px;
      .podium-company-name {
        color: #06A2CE;
        font-size: .85em;
        margin: 0;
        text-transform: capitalize;
      }
      .podium-joboffer-title {
        font-size: .84em;
        margin: 0;
        position: relative;
        top: -4px;
        text-transform: capitalize;
      }
    }
  }
}
</style>

<template>
<section class="stats-container card fx-col m-b-sm fx-center-center">
  <div class="fx-row fx-center-center spinner-container">
    <spinner v-if="!ready" color="blue" size="medium"></spinner>
  </div>
  <div class="open-joboffers-container font-light" v-show="ready" transition="appear">
    <p class="joboffers-number">{{totalJoboffers}}</p>
    <p class="sub-title">Open Job Offers</p>
  </div>
  <div class="topJoboffers-container" v-if="ready && topJoboffers.length">
    <hr>
    <p class="section-title font-light">Popular Offers This Week</p>
    <ul class="collection">
      <li class="collection-item fx-row" v-for="item in topJoboffers | limit 3" track-by="$index">
        <p class="podium-number fx-start"><span>{{$index + 1}}</span></p>
        <div class="podium-details fx-center">
          <p class="podium-company-name"><a :href="'#!/joboffer/' + item.slug" target="_blank">{{item.company.name.substring(0,20)}}</a></p>
          <p class="podium-joboffer-title font-light">{{item.title.substring(0,20)}}...</p>
        </div>
      </li>
    </ul>
  </div>
</section>
</template>

<script>
let moment = require('moment')
let connect = require('services/connect')
let tungolia = require('webpack-config-loader!src/main.config.js').tungolia

import tunlogia from 'services/tunlogia'
import spinner from 'shared/spinner'

module.exports = {
  data () {
    return {
      topJoboffers: [],
      totalJoboffers: 0,
      ready: false
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
    buildJoboffersPodium (from, to) {
      let vm = this
      vm.topJoboffers = []
      tunlogia.notLoggedJoboffersPodium(from, to)
      .then((res) => {
        if (!res.length) return
        res.forEach((o) => {
          let _a = o.key.replace('/joboffers/', '').split('-')
          let _idx = _a.indexOf('at')
          vm.topJoboffers.push({
            slug: o.key.replace('/joboffers/', ''),
            title: _a.splice(0, _idx).join(' '),
            company: {
              name: _a.splice(1).join(' ')
            }
          })
        })
      })
    }
  },
  ready () {
    let vm = this
    let from = moment().subtract(6, 'days').format('YYYY-MM-DD')
    let to = moment().add(1, 'days').format('YYYY-MM-DD')
    vm.buildJoboffersPodium(from, to)
    connect.apiAsync('POST', tungolia.url + '/filter/joboffer', { parser: 'source' })
    .then((res) => {
       vm.totalJoboffers = res.total || 0
       vm.ready = true
    })
    .catch(() => (vm.ready = true))
  }
}
</script>
