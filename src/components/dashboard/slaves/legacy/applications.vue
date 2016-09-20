<template>
    <div v-show="showme">
        <div class="bg-white m-l-sm row">
            <div class="checkbox checkbox-success m-l-md checkbox-inline col s3" v-for="item in options">
                <input type="checkbox" :id="joboffer+item" :value="item" v-model="filters">
                <label :for="joboffer+item"> {{item}} </label>
            </div>
        </div>
        <div class="reclist m-l-sm">
          <div class="inline-block" v-for="item in applications">
            <applicationcard :data="item"></applicationcard>
          </div>
        </div>
    </div>
</template>
<script>
  var connector = require('services/connect.js')
  var applicationcard = require('./recommendation_card.vue')
  module.exports = {
    data () {
      return {
        applications: [],
        allapplications: [],
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
      applicationcard: applicationcard
    },
    created () {
      var that = this
      this.$watch('filters', function (val) {
        that.filtreapplications()
      })
    },
    ready () {
      this.loadList()
    },
    methods: {
      close () {
        this.showModal = false
      },
      filtreapplications () {
        var that = this
        if (this.filters.length) {
          this.applications = this.allapplications.filter(i => that.filters.indexOf(i.state) > -1)
        } else {
          this.applications = this.allapplications
        }
      },
      loadList () {
        this.showme = !this.showme
        if (!this.showme) return
        var that = this
        connector.apiCall('', '/dashboard/joboffers/' + this.joboffer + '/recommendations', 'GET', function (error, response) {
          if (!error) {
            that.allapplications = response.applications
            that.applications = response.applications
          }
        })
      }
    }
  }
</script>
