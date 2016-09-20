<style lang="less" scoped>
.latest-messages-container {
  min-height: 425px;
  overflow-x: hidden;
  overflow-x: hidden;
  padding: 0;
  .section-title {
    margin: 0;
    padding: 10px 0 6px 0;
    color: #666;
    font-size: 1.2em;
    text-align: center;
  }
  .top-container {
    margin-top: 10px;
    .sub-section-title {
      color: #666;
      font-size: 11px;
      text-align: left;
      margin-bottom: 5px;
      padding-left: 15px;
    }
    ul.collection {
      overflow: visible !important;
      .collection-item {
        padding: 14px 10px !important;
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
      font-size: 1em;
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
      .podium-name {
        font-size: 1em;
        margin: 5px 0;
        /*text-transform: capitalize;*/
      }
    }
    .views-number-container {

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
  <p class="section-title">Traffic Sources</p>
  <div v-if="isLoading" class="loading-text">Loading...</div>
  <div v-if="!trafficSources.length && !isLoading" class="loading-text">No Available Data.</div>
  <div v-else class="top-container" transition="appear">
    <ul class="collection no-border">
      <li class="collection-item fx-row" v-for="item in trafficSources | limit 4" track-by="$index">
        <p class="podium-number fx-start"><span>{{$index + 1}}</span></p>
        <div class="podium-details fx-center">
          <div class="podium-name">{{item.name}}</div>
          <div class="views-number-container">
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
import tunlogia from 'services/tunlogia'

let moment = require('moment')

module.exports = {
  data () {
    return {
      isLoading: true,
      trafficSources: []
    }
  },
  filters: {
    limit: function (arr, limit) {
      return arr.slice(0, Number(limit))
    }
  },
  ready () {
    let vm = this
    vm.isLoading = true
    let from = moment().subtract(6, 'days').format('YYYY-MM-DD')
    let to = moment().add(1, 'days').format('YYYY-MM-DD')
    tunlogia.trafficSources(from, to)
    .then((res) => {
      if (res.length) {
        let t = []
        res.forEach((o) => {
          let name = o.key.replace('"', '').replace(/https?:\/\//, '').replace(/w+?.\./, '')
          if (t.indexOf(name) > -1) {
            let x = vm.trafficSources.findIndex((e) => {
              if (e.name === name) return true
              return false
            })
            vm.trafficSources[x].count += o.doc_count
          } else {
            vm.trafficSources.push({
              name: name,
              count: o.doc_count
            })
          }
        })
      }
      vm.isLoading = false
    })
  }
}
</script>
