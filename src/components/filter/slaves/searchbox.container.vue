<style lang="less" scoped>
@import "../../../style/common/colors.less";
	.-filter-containre{
		// background: white;
		// border: @border-color 1px solid;
		position: relative;
	}
	.-search-wrapper{

		#search {
			display: block;
			font-size: 16px;
			font-weight: 300;
			// width: 100%;
			height: 45px;
			margin: 0;
			padding: 0 40px;
			border: 0;
			z-index: 10;

		}
	}

	.-search-icon{
		position: absolute;
		top: 12px;
		left: 14px;
	}

	.-search-results{
		margin: 0;
		border-top: 1px solid #e9e9e9;
		background-color: #fff;
		position: absolute;
		top: 44px;
		left: 0px;
		font-weight: 300;
		right: 0px;
		z-index: 10;
		li{
			font-size: 16px;
			white-space: nowrap;
			padding: 12px 18px;
			transition: 200ms;
			cursor: pointer;
			&.active {
				background-color: #edf9f9
			}
		}
	}

	.expand-transition {
	  transition: all .2s ease;
	  max-height: 560px;
	  overflow: hidden;
	}

	.expand-enter, .expand-leave {
	  max-height: 0px;
	  // padding: 0 10px;
	  opacity: .5;
	}

	.appear-transition {
	  transition: all .3s ease;
	}

	.appear-enter, .appear-leave {
	  opacity: 0;
		transform: scale(0.2);
	}

	.--result-image{
		position: relative;
		i {
			position: absolute;
			bottom: -7px;
			right: -10px;
			background: white;
			border-radius: 50%;
			padding: 2px;
			font-size: 1rem;
		}
	}


</style>
<template>
	<section class="-filter-containre fx-col m-r-none p-r-none m-b-sm">
		<!-- <form class="search-container fx-row p-sm row"> -->
      <!-- <div class="m-none" flex>
          <input v-model="query" @keyup="search | debounce 10" type="search" class="form-control" placeholder="Search for jobs">
      </div> -->


			<div class="-search-wrapper m-none card col s12 fx-row fx-start-center">
				<spinner  v-if="isLoading" color="blue" size="x-small"></spinner>
				<i v-else transition="appear" class="material-icons -search-icon">search</i>
				<!-- <input v-model="term" @keyup="search | debounce 100" id="search" placeholder="Search for jobs" flex> -->
        <input autocomplete="off" placeholder="Try our Search Engine" id="search" flex
           v-model="query"
           @keydown.down="down"
					 @keydown.right="right"
           @keydown.up="up"
           @keydown.enter="hit"
           @keydown.esc="reset"
					 @blur="onBlur"
					 @focus="onFocus"
           @input="update" />

				<!-- <div class="input-field col s12">
          <i class="material-icons prefix">search</i>
          <input id="icon_prefix" type="search" class="validate">
          <label for="icon_prefix">search for jobs</label>
        </div> -->
      </div>

			<!-- {{items | json}} -->
			<ul v-if="hasItems && isDisplayed" class="-search-results card" transition="expand">
				<li v-for="item in items" class="pos-re" :class="activeClass($index)" @mousedown="hit" @mousemove="setActive($index)">
					<div class="font-8 text-orange  p-none p-b-xs pos-ab m-l-n-sm font-slim" v-if="item.$type == 'joboffer' && ( $index == 0 || items[$index -1].$type != 'joboffer') ">Jobs</div>
					<div class="font-8 text-primary-2 p-none p-b-xs pos-ab m-l-n-sm font-slim" v-if="item.$type == 'company' && ( $index == 0 || items[$index -1].$type != 'company') ">Companies</div>
					<div class="font-8 text-info p-none p-b-xs pos-ab m-l-n-sm font-slim" v-if="item.$type == 'profile' && ( $index == 0 || items[$index -1].$type != 'profile') ">Profiles</div>

					<div v-if="item.$type == 'joboffer'" class="fx-row fx-start-center m-l-xxxxl">
						<div class="--result-image m-r-sm">
							<img :src="item.company.source.logo" alt="company-image" class="img-rounded border size-24">
							<i class="material-icons">work</i>
						</div>
						<div class="fx-row fx-space-between-center font-7" flex>
							<span flex>{{{item.title.highlight }}}</span>
							<!-- <b class="text-orange  font-slim font-9 capital">{{{item.$type}}}</b> -->
						</div>
					</div>

					<div v-if="item.$type == 'company'" class="fx-row fx-start-center m-l-xxxxl">
						<div class="--result-image m-r-sm">
							<img :src="item.logo.source" alt="company-image" class="img-rounded border size-24">
							<i class="material-icons">business</i>
						</div>
						<div class="fx-row fx-space-between-center  font-7" flex>
							<span flex>{{{item.name.highlight}}}</span>
							<!-- <b class="text-primary-2 font-slim  font-9 capital">{{{item.$type}}}</b> -->
						</div>
					</div>

					<div v-if="item.$type == 'profile'" class="fx-row fx-start-center m-l-xxxxl">
						<div class="--result-image m-r-sm">
							<img :src="item.img.source" alt="user-image" class="circle user-image border size-24">
							<i class="material-icons">person</i>
						</div>
						<div class="fx-row fx-space-between-center font-7" flex>
							<span flex>{{{item.firstname.highlight}}} {{{item.lastname.highlight}}}</span>
							<!-- <b class="text-info font-slim font-9 capital">{{{item.$type}}}</b> -->
						</div>
					</div>

				</li>
			</ul>
  	<!-- </form> -->

	</section>

</template>

<script>
import VueTypeahead from 'directives/directive.typeahead'
var connect = require('services/connect')
var spinner = require('shared/spinner')
var tungolia = require('webpack-config-loader!src/main.config.js').tungolia
var bus = require('services/bus')

var config = {
	// typoTolerance: 'max',
	term: ''
}

import {termUpdate} from 'store/filter/actions.filter'
module.exports = {
	extends: VueTypeahead,
	vuex: {
		actions: {
			termUpdate
		}
	},
  data () {
		return {
			limit: 10
  	}
  },
	ready () {
		// this.$watch('options', this.mergeStats)
		bus.$on('filter:set:query', this.updateFilter)
	},
	destroyed () {
		bus.$off('filter:set:query')
	},
	components: {
		spinner
	},
	methods: {
		updateFilter (term) {
			this.query = term
			config.term = term
		},
		onHit (query) {
			console.log(query.$type)
			if (query.$type == 'profile') {
				window.location.assign(window.location.origin + '/profile.html#!/' + query.slug.source)
			} else if (query.$type == 'company') {
				window.location.assign(window.location.origin + '/#!/company/' + query.slug.source)
			} else {
				this.query = query.title.source
				config.term = query.title.source
				this.termUpdate(config)
			}
		},
		search (query) {
			config.term = query
			this.termUpdate(config)
		},
		fetch () {
			// if (this.query.length < 2) return
			var options = {
				'term': this.query,
				'highlight': 'true',
				'highlightPreTag': '<b>',
				'highlightPostTag': '</b>',
				'hitsPerPage': 3,
				'parser': 'highlight'
			}
			var job_options = Object.assign({'attributesToSearch': ['title'], 'attributesToRetrieve': ['title', 'company.logo'], 'hitsPerPage': 4}, options)
			var pro_options = Object.assign({'attributesToSearch': ['firstname', 'lastname'], 'attributesToRetrieve': ['firstname', 'lastname', 'img', 'slug']}, options)
			var com_options = Object.assign({'attributesToSearch': ['name'], 'attributesToRetrieve': ['name', 'logo', 'slug']}, options)

			return new Promise((resolve, reject) => {
				let jobofferP = connect.apiAsync('POST', tungolia.url + '/search/joboffer', job_options)
				let profileP = connect.apiAsync('POST', tungolia.url + '/search/profile', pro_options)
				let companyP = connect.apiAsync('POST', tungolia.url + '/search/company', com_options)
				Promise.all([jobofferP, profileP, companyP]).then(values => {
					let jobofferList = values[0].hits.map(i => Object.assign(i, {$type: 'joboffer'}))
					let profileList = values[1].hits.map(i => Object.assign(i, {$type: 'profile'}))
					let companyList = values[2].hits.map(i => Object.assign(i, {$type: 'company'}))
				  resolve([].concat(jobofferList, companyList, profileList))
				})
			})
			// .then((res) => console.log(res))
			// .catch((err) => console.log(err))
		},
		// prepareResponseData (data) {
		// 	var unique = []
		// 	// return data.hits.filter((i) => {
		// 	console.log('data', data)
		// 	return data.filter((i) => {
		// 		let id = i.title.highlight
		// 	  if (unique.indexOf(id) === -1) return unique.push(id)
		// 	})
		// },
		onRight (query) {
			this.query = query.title.source
		}
	}
}
</script>
