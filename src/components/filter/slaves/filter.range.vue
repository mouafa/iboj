<style lang="less" scoped>
.-range-filter{
	// left: -2px;
	// position: relative;
	.input-field {
		width: 3rem;
		input {
			height: 2rem;
		}
	}
}
.-pipe {
	height: 1.4rem;
	width: 1px;
	&.-from{
		// left: 1px;
		// top: 3px;
	  // position: relative;
	}
	&.-to{
		right: -2px;
		// top: 3px;
		position: relative;
	}
}
// .-undo {
// 	padding: 0 1rem;
// 	// color: white
// 	.material-icons{
// 		margin-right: .5rem
// 	}
// }


</style>
<template>
	<section class="-range-filter">
		<div id="slider"></div>
		<div v-if="options" class="-info fx-row fx-space-between-center m-t-sm">
			<div class="fx-row fx-start-center">
				<i class="-pipe -from teal lighten-2 m-r-xs"></i>
				<b>{{from}}</b>
 					<!-- <div class="input-field">
          <input v-model="from" type="search">
        </div> -->
			</div>

			<!-- <button class="btn waves-effect waves-teal btn-flat -undo"><i class="material-icons left">undo</i>Undo</button> -->

			<div class="fx-row fx-start-center">
				<b>{{to}}</b>
				<i class="-pipe -to teal lighten-2 m-l-xs"></i>
				<!-- <div class="input-field -rtl">
          <input v-model="to" type="search" dir="rtl">
        </div> -->
			</div>
		</div>
	</section>

</template>

<script>
var bus = require('services/bus')
require('materialize-css/extras/noUiSlider/nouislider.css')
var noUiSlider = require('materialize-css/extras/noUiSlider/nouislider.min.js')
var slider
module.exports = {
	props: {
		options: {
			type: Object
		},
		category: {
			type: String
		}
	},
  data () {
  	return {
  		componentId: Math.floor(Math.random() * 100),
			created: false,
			from: 0,
			to: 0,
			selection: null
  	}
  },
	ready () {
		let vm = this
		if (vm.options) vm.init(vm.options)
		vm.$watch('options', vm.init)
		bus.$on('filter:set:' + this.category, this.updateFilter)
  },
  destroyed () {
    bus.$off('filter:set:' + this.category)
  },
	methods: {
		init ({min, max}) {
			let vm = this
			if (!max) return
			if (min < vm.from) vm.from = min
			if (max > vm.to) vm.to = max
			vm.selection = [min, max]
			vm.createSlider(vm.from, vm.to, vm.selection)
		},
		createSlider (min, max, position) {
			// console.info(min, max, position)
			if (slider) slider.noUiSlider.destroy()
			slider = document.getElementById('slider')
			noUiSlider.create(slider, {
				 start: position || [min, max],
				 connect: true,
				 behaviour: 'drag',
				 margin: 1,
				 step: 1,
				 animate: true,
				 animationDuration: 300,
				 range: {
					 'min': min,
					 'max': max
				 },
				 format: {
				  to: (value) => Math.floor(value),
				  from: (value) => Math.floor(value)
				}
			})
			this.updateListener()
		},
		updateListener () {
			var vm = this
			slider.noUiSlider.on('change', function (values, handle) {
				let selection = vm.selection || []
				if (selection.toString() == values.toString()) return
				vm.selection = values
				if (values[0] == vm.from && values[1] == vm.to) {
					bus.$emit('filter:changed', vm.category, [])
				} else {
					bus.$emit('filter:changed', vm.category, values)
				}
			})
		},
		updateFilter (range) {
			this.init(range[0], range[1])
		}
	}
}
</script>
