<style lang="less" scoped>
@import "../../../style/common/colors.less";
	.collapsible-body{
		border: none;
	}
	.-filter-containre{
		background: @color-background-boxed;
		border: none;
		// border: @color-background .25px solid;
	}

	.-filter-list {
		.collapsible-header{
			background-color: rgba(255,255,255,.6);
			border: none;
			padding: 0 8px;
			// border-bottom: @color-bright 1px solid;
			margin-bottom: 2px;
			// background-color: @border-color;
			.material-icons{
				font-size: 16px;
				padding-top: 4px;
				font-weight: 300;
				margin-right: 4px;
				color: @color-text-light;
			}
			.-arrow{
				font-family: serif;
			}
			.-arrow::before{
				content: "+";
				font-size: 16px;
			}
			&.active {
				.-arrow::before{
					content: "-";
					font-size: 22px;
				}
			}
		}
	}

</style>
<template>
	<section class="-filter-containre">
		<h6 class="p-xs"> <i class="material-icons">&#xE152;</i> Filter</h6>
	  <ul class="-filter-list collapsible m-none p-none m-t-xs" data-collapsible="expandable">
	    <li v-if="categoryList && categoryList.length" >
	      <div class="collapsible-header capital fx-row fx-start-center active-default">
	        <i class="material-icons ">assignment</i>
	        <span class="font-light font-9" flex>Categories</span>
					<i class="text-orange -arrow"></i>
	      </div>
	      <div class="collapsible-body font-8 font-light">
	        <check-list :category="'category'" :statistic="true":options="categoryList" class="p-xs"></check-list>
	      </div>
	    </li>
			<li v-if="jobtypeList && jobtypeList.length">
				<div class="collapsible-header capital fx-row fx-start-center">
					<i class="material-icons">work</i>
					<span class="font-light" flex>Job types</span>
					<i class="text-orange -arrow"></i>
				</div>
				<div class="collapsible-body">
					<check-list :category="'jobtype'" :options="jobtypeList" :statistic="true" class="p-xs"></check-list>
				</div>
			</li>
	    <li v-if="companyList && companyList.length">
	      <div class="collapsible-header capital fx-row fx-start-center active-default">
	        <i class="material-icons md14">store</i>
	        <span class="font-light"  flex>Companies</span>
					<i class="text-orange -arrow"></i>
	      </div>
	      <div class="collapsible-body">
	        <check-list :category="'company'" :options="companyList" :statistic="true" class="p-xs"></check-list>
	      </div>
	    </li>
	    <li>
	      <div class="collapsible-header  capital fx-row fx-start-center">
	        <i class="material-icons">attach_money</i>
	        <span class="font-light"  flex>Salary range</span>
					<i class="text-orange -arrow"></i>
	      </div>
	      <div class="collapsible-body">
	        <range :category="'salary'" :options="salaryRange" class="p-sm"></range>
	      </div>
	    </li>
	    <!-- <li>
	      <div class="collapsible-header capital fx-row fx-start-center">
	        <i class="material-icons">loyalty</i>
	        <span class="font-light"  flex>Tags</span>
					<i class="text-orange -arrow"></i>
	      </div>
	      <div class="collapsible-body">
	        <tags :category="'tags'" class="p-sm"></tags>
	      </div>
	    </li> -->
	  </ul>

	</section>
</template>

<script>
var checkList = require('./filter.check-list')
var radioList = require('./filter.radio-list')
var range = require('./filter.range')
// var tags = require('./filter.tags')
var bus = require('services/bus')
import {filterCompany, filterJobtype, filterExperience, filterSalary, filterCategory, isReady} from 'store/filter/getters.filter'
import {filterUpdate} from 'store/filter/actions.filter'
module.exports = {
	vuex: {
		actions: {
			filterUpdate
		},
		getters: {
			categoryList: filterCategory,
			companyList: filterCompany,
			jobtypeList: filterJobtype,
			experienceList: filterExperience,
			salaryRange: filterSalary,
			isReady
		}
	},
  components: {
  	checkList,
  	radioList,
		range
  },
	ready () {
		$('.active-default').addClass('active')
		$('.collapsible').collapsible({accordion: false})
		bus.$on('filter:changed', this.filterUpdate)
		var stop = this.$watch('isReady', () => {
			$('.active-default').addClass('active')
			$('.collapsible').collapsible({accordion: false})
			stop()
		})
	},
	destoyed () {
		bus.$off('filter:changed')
	},
	methods: {
		// addFilter (...args) {
		// 	this.filterAdd(...args)
		// }
	}
}
</script>
