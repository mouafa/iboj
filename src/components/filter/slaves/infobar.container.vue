<style lang="less">

@import "../../../style/common/colors.less";
.-filter-container{
	span.caret{
	  top: 8px;
	}

	select, input.select-dropdown{
		margin: 0;
		line-height: 2.4rem;
		height: 2.4rem;
		width: 120px;
	}
}

</style>

<template>

<section class="-filter-container fx-row fx-start-center m-b-sm row">

    <div flex>
			<h6 class="capital font-light font-1-2 p-none m-none"> <span class="font-light font-1-5">{{total}}</span> Job Offers</h6>
    </div>
    <!-- <div class="switch p-r-sm">
        <label>
            Descending
            <input type="checkbox">
            <span class="lever"></span>
						Ascending
        </label>
    </div> -->
		<div v-if="sortBy"  class="p-none capital fx-row fx-start-center  m-r-sm">
			 <label class="m-r-sm">Order</label>
				<select @change="order" v-model="sortOrder" class="browser-default">
					<option value="desc">Descending</option>
					<option value="asc">Ascending</option>
				</select>
		</div>

    <div class="p-none capital fx-row fx-start-center">
			 <label class="m-r-sm">Sort by</label>
        <select @change="order" v-model="sortBy" class="browser-default">
            <option value="">Relevent</option>
            <option v-for="option in options" :value="option.value">{{option.name}}</option>
        </select>
    </div>



</section>

</template>

<script>
import { orderUpdate } from 'store/filter/actions.filter'
import { filterTotal } from 'store/filter/getters.filter'
var bus = require('services/bus')

module.exports = {
    vuex: {
        actions: {
          orderUpdate
        },
				getters: {
					total: filterTotal
				}
    },
    data () {
        return {
            options: [
											{name: 'Title', value: 'title.full'},
											// {name: 'Job Type', value: 'job_type.full'},
											// {name: 'Incentive', value: 'incentive'},
											{name: 'Release date', value: 'release_date'},
											{name: 'Salary', value: 'salary_min'}
										],
						sortBy: 'release_date',
						sortOrder: 'desc'
        }
    },
    ready () {
        $('select').material_select()
				bus.$on('filter:set:sort', this.updateFilter)
			},
			destroyed () {
				bus.$off('filter:set:sort')
			},
    methods: {
			updateFilter ({sortBy, sortOrder}) {
				this.sortBy = sortBy || ''
				this.sortOrder = sortOrder
			},
      order () {
				var vm = this
        vm.orderUpdate(vm.sortBy, vm.sortOrder)
      }
    }
}

</script>
