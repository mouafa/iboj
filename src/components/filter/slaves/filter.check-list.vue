<style lang="less" scoped>
[type="checkbox"]:checked+label:before {
    top: -1px;
    width: 12px;
    height: 18px;

	}
	[type="checkbox"]:not(.filled-in)+label:after {

    border: 1px solid #5a5a5a;
    border-radius: 0px;
		top:2px;
		width: 14px;
		height: 14px;
	}
		span {
			font-weight: 300;
		}
		.-item{
			label{
				word-break: break-all;
				word-wrap: normal;
				white-space: pre-line;
				overflow: hidden;
				text-overflow: ellipsis;
				font-size: .75rem;
			}
		}

</style>
<template>
	<section class="">
		<ul class="ul-none p-none m-none">
			<li v-for="option in options" track-by="$index" class="p-t-xxs p-b-xxs m-t-xs fx-row fx-start-top">
				<div flex class="-item">
					<input v-model="selected" type="checkbox" @change="changeFilter" :id="componentId + $index" :value="option.name"/>
      		<label flex class="capital truncate font-light" :for="componentId + $index">{{option.name}}</label>
				</div>

				<span v-if="statistic" v-show="option.count" class="p-l-xs p-r-xs">{{option.count}}</span>
			</li>
		</ul>
	</section>

</template>

<script>
var bus = require('services/bus')
module.exports = {
	props: {
		options: {
			type: Array
		},
		category: {
			type: String
		},
		statistic: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			componentId: Math.floor(Math.random() * 1000),
			selected: [],
      keepStats: false
		}
	},
  ready () {
    // this.$watch('options', this.mergeStats)
    bus.$on('filter:set:' + this.category, this.updateFilter)
  },
  destroyed () {
    bus.$off('filter:set:' + this.category)
  },
  methods: {
    changeFilter () {
      var vm = this
      vm.keepStats = true
      bus.$emit('filter:changed', vm.category, vm.selected)
    },
    updateFilter (list) {
      this.selected = list
    },
    mergeStats (newData, oldData) {
      var vm = this
      // console.log('newData, oldData', newData, oldData)
      var n = newData.map(i => i.value)
      var o = oldData.map(i => i.value)
      if (n.toString() == o.toString() && vm.keepStats) {
        vm.options = oldData
      }
      vm.keepStats = false
    }
  }
}
</script>
