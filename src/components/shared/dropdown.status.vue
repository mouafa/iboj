*<style lang="less" scoped>
.down-menu {
    position: absolute !important;
    z-index: 999 !important;
    list-style: none;
    min-width: 120px;
    border-radius: 1px;
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

  <div id="drop-down-{{id}}" class="drop-down p-xxs hand  bold" @click="showmenu">
    <div class="p-none fx-row fx-start-center">
      <i class="material-icons md-20 orange600 m-t-xs">&#xE313;</i>
      <span class="hand uppercase p-r-xs">{{recommendation.state}}</span>
      <!-- <i class=" fa fa-angle-down p-l-sm"></i> -->
    </div>

    <div class="flesh" v-show="listMe"></div>
    <ul class="border bg-white down-menu p-xxs m-none m-t-xs" v-show="listMe">
      <li class="capital border-top p-xxs " v-for="op in options" @click="updateState(op.value)">
        <span><i class="fa m-r-xs" :class="op.icon"></i> {{op.value}}</span>
      </li>
    </ul>
  </div>

</template>

<script>
var connect = require('services/connect.js')
var bus = require('services/bus')

module.exports = {
  data () {
    return {
      id: (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1),
      listMe: false,
      clickOut: null,
      oldState: null,
      options: {
        'pushed': {
          value: 'pushed',
          icon: 'fa-hourglass-half'
        },
        'rejected': {
          value: 'rejected',
          icon: 'fa-ban'
        },
        'hired': {
          value: 'hired',
          icon: 'fa-check'
        },
        'phone interview': {
          value: 'phone interview',
          icon: 'fa-phone'
        },
        'office interview': {
          value: 'office interview',
          icon: 'fa-street-view'
        }
      }
    }
  },
  props: {
    recommendation: {
      type: Object,
      require: true,
      default: {}
    },
    recomId: {
      type: Number
    }
  },
  computed: {
    icon () {
      if (!this.recommendation.state || !this.options[this.recommendation.state]) return this.options.pushed.icon
      else return this.options[this.recommendation.state].icon
    }
  },
  created () {
    var vm = this
    this.clickOut = function (event) {
      if ($(event.target).closest('#drop-down-' + vm.id).length) return true
      vm.showmenu(null)
    }
  },
  methods: {
    showmenu () {
      this.listMe = !this.listMe
      if (this.listMe) $(document).bind('click', this.clickOut)
      else $(document).unbind('click', this.clickOut)
    },
    updateState (_value_) {
      let vm = this
      let recID = this.recomId || this.recommendation.id
      let jobId = this.recommendation.joboffer_id || this.$route.params.jobId
      bus.$emit('application:status-update', recID, _value_)
      this.oldState = this.recommendation.state
      this.recommendation.state = _value_
      connect.apiAsync('PUT', '/dashboard/joboffers/' + jobId + '/recommendations/' + recID, { state: _value_ })
      .then((res) => {
        bus.$emit('joboffer:rec-state-changed', Object.assign(res, {oldvalue: vm.oldState, newvalue: res.state}))
      })
      .catch(() => (vm.recommendation.state = vm.oldState))
    }
  }
}
</script>
