<template>
    <div v-show="showme">
        <div class="m-xxs bg-white">
            <div class="checkbox checkbox-success checkbox-inline m-xs" v-for="item in options">
                <input type="checkbox" :id="joboffer+item" :value="item" v-model="filters">
                <label :for="joboffer+item"> {{item}} </label>
            </div>
        </div>
        <div class="reclist">
          <div class="inline-block" v-for="item in recommendations">
            <recommendationcard :data="item"></recommendationcard>
          </div>
        </div>
    </div>
</template>
<script>
  var connector = require('services/connect.js')
  var recommendationcard = require('./recommendation_card.vue')
  module.exports = {
    data () {
      return {
        recommendations: [],
        allRecommendations: [],
        showme: false,
        showModal: false,
        currentItem: null,
        filters: [],
        options: ['pending', 'pushed', 'rejected', 'hired', 'phone interview', 'office interview']
      }
    },
    props: {
      joboffer: {
        type: Number,
        require: true
      }
    },
    components: {
      recommendationcard: recommendationcard
    },
    created () {
      var that = this
      this.$watch('filters', function (val) {
        that.filtreRecommendations()
      })
    },
    ready () {
      this.loadList()
    },
    methods: {
      close () {
        this.showModal = false
      },
      filtreRecommendations () {
        var that = this
        this.recommendations = this.filters.length ? this.allRecommendations.filter(function (e) {
          return that.filters.indexOf(e.state) > -1
        }) : this.allRecommendations
      },
      loadList () {
        this.showme = !this.showme
        if (!this.showme) return
        var that = this
        connector.apiCall('', '/dashboard/joboffers/' + this.joboffer + '/recommendations', 'GET', function (error, response) {
          if (!error) {
            that.allRecommendations = response.recommendations
            that.recommendations = response.recommendations
          }
        })
      }
    }
  }
</script>
