<style lang="less">
.-tag-filter{
	.chip{
		margin-top: 5px;
	}
}
</style>
<template>
	<section class="-tag-filter">
			<input @change="filterChange" v-model="tags" :id="componentId" placeholder="search by tags" type="search" data-role="materialtags" />
	</section>

</template>

<script>
var bus = require('services/bus')
// require('materialize-tags')
var $ = window.jQuery

module.exports = {
	props: {
		options: {
			type: Object
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
			tags: '',
			selected: [],
			$input: null
		}
	},
	ready () {
		// try {
			this.$input = $(`input#${this.componentId}`)
			this.$input.materialtags()
			this.$input.on('itemAdded', ({item}) => this.filterChange(this.$input.materialtags('items')))
			this.$input.on('itemRemoved', ({item}) => this.filterChange(this.$input.materialtags('items')))
		// } catch (e) {
		// 	console.log(e)
		// }
		bus.$on('filter:set:' + this.category, this.updateFilter)
	},
	destroyed () {
		bus.$off('filter:set:' + this.category)
	},
  methods: {
		filterChange (items) {
			var vm = this
			var tags = items.map(i => i.replace(/[^a-zA-Z ]/g, '').toLowerCase())
			bus.$emit('filter:changed', vm.category, tags)
		},
		updateFilter (list) {
			var vm = this
			vm.$input.materialtags('removeAll')
			list.forEach(i => vm.$input.materialtags('add', i))
		}
  }
}
</script>
