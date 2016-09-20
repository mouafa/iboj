<template>
  <section class="font-9 m-b-lg" v-show="isReady" transition="fade-in" transition-mode="out-in">
      <form class="form-container bg-white m-b-md z-depth-1">
        <section class="field-group fx-col">
          <div class="m-b-sm">
            <label class="capital">description/summary</label>
          </div>
          <div>
            <textarea class="input-box" id="description" maxlength="600" v-model="joboffer.description | substring 600"></textarea>
            <span class="m-b-sm font-8 text-warning pull-right">{{remainChars(joboffer.description)}}</span>
          </div>
        </section>

        <section class="field-group fx-col">
          <div class="m-b-sm">
            <label class="capital">Requirements (max 10)</label>
          </div>
          <div v-for="i in requirementList" track-by="$index" class="m-b-sm">
            <input @blur="filteList" class="input-box" id="title" maxlength="32" v-model="joboffer.requirement[$index]">
          </div>
        </section>

        <section class="field-group fx-col">
          <div class="m-b-sm">
            <label class="capital">Benefits</label>
          </div>
          <div>
            <textarea class="input-box" id="benefits" maxlength="600" v-model="joboffer.benefits | substring 600"></textarea>
            <span class="m-b-sm font-8 text-warning pull-right">{{remainChars(joboffer.benefits)}}</span>
          </div>
        </section>

      </form>
      <div class="fx-row fx-space-between-center">
        <button @click="save(false)" class="btn-flat waves-effect waves-teal font-1-2 bg-none teal-text" name="save-draft">Save as Draft</button>
        <button @click="save('next')" class="btn-floating btn-large waves-effect waves-light bay-leaf"><i class="material-icons">chevron_right</i></button>
      </div>
    </section>
</template>

<script>
var connect = require('services/connect')
var $ = window.jQuery
require('flex-text')

module.exports = {
  data () {
    return {
      isReady: false,
      joboffer: { id: 0, description: '', requirement: [], benefits: '' }
    }
  },
  route: {
    data ({to}) {
      let jobId = to.params.jobId
      if (Number(jobId)) {
        this.loadJoboffer(jobId)
        .catch(() => this.$router.go('/'))
      } else this.$router.go('/')
    }
  },
  ready () {
    $('textarea.input-box').flexText()
  },
  computed: {
    requirementList () {
      var arr = this.joboffer.requirement.map(i => '')
      if (this.joboffer.requirement.length < 10) arr.push('')
      return arr
    }
  },
  methods: {
    loadJoboffer (id) {
      var vm = this
      return connect.apiAsync('GET', '/dashboard/joboffers/' + id + '?fields=[id,description,requirements,benefits]')
      .then(function (res) {
        vm.isReady = true
        vm.joboffer.id = res.id
        vm.joboffer.description = res.description || ''
        vm.joboffer.requirement = res.requirements || []
        vm.joboffer.benefits = res.benefits || ''
      })
    },
    save (next) {
      var vm = this
      let data = {
        description: this.joboffer.description,
        requirements: this.joboffer.requirement,
        benefits: this.joboffer.benefits
      }
      connect.apiAsync('PUT', '/joboffers/' + this.joboffer.id, data)
      .then((res) => {
        if (next) vm.$router.go({ name: 'job-quizbuilder', params: {jobId: res.id} })
        else window.location = window.location.origin
      })
    },
    remainChars (field) {
      if (field && field.length) {
        if (field.length > 600) return 0
        return (600 - field.split('\n').join('  ').length)
      } else return 600
    },
    filteList () {
      this.joboffer.requirement = this.joboffer.requirement.filter(i => !!i)
    }
  }
}

</script>
