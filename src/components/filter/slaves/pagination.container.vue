<style lang="less">

@import "../../../style/common/colors.less";

.-pagination-container{
	.pagination{
		li {
			transition: 200ms;
			font-size: 1rem;
			line-height: 1rem;
			padding: 8px;
			&.disabled {
				opacity: 0;
				a{
					display: none;
				}
			}
		}
	}
	.btn-flat {
		padding: 0;
	}
}

</style>

<template>

	<section class="-pagination-container fx-row fx-center-center m-b-sm row"flex >
		<ul v-if="total" class="pagination fx-row fx-start-center" flex >
		    <li @click="prevRange" :class="{'disabled': !hasPrev}" flex>
					<a class="waves-effect waves-teal btn-flat">Prev. Page
						<!-- <i class="material-icons">chevron_left</i> -->
					</a></li>
		    <li @click="goTo(page)" v-for="page in pagesRange" class="waves-effect" :class="{'active teal lighten-2': currentPage == page}"><a>{{page}}</a></li>
		    <li @click="nextRange" :class="{'disabled': !hasNext}" flex>
					<a class="waves-effect waves-teal btn-flat">
						<!-- <i class="material-icons">chevron_right</i> -->
						Next Page
					</a></li>
		  </ul>
	</section>

</template>

<script>
import { goToPage } from 'store/filter/actions.filter'
import { filterMaxPage, filterPage, filterLimit, filterTotal } from 'store/filter/getters.filter'
module.exports = {
    vuex: {
        actions: {
            goToPage
        },
				getters: {
					maxPage: filterMaxPage,
					currentPage: filterPage,
					limit: filterLimit,
					total: filterTotal
				}
    },
		computed: {
			pagesRange () {
				if (!this.limit || !this.currentPage || !this.maxPage) return null
				let n = this.limit
				let add = this.currentPage % n == 0 ? this.currentPage - (n - 1) : Math.trunc(this.currentPage / n) * n + 1
				let range = []
				for (let i = 0; i < n; i++) {
					range[i] = i + add
				}
				// let range = Array(n).fill(1).map((i, j) => j + add)
				while (range[range.length - 1] > this.maxPage) {
					range.pop()
				}
				return range
			},
			hasPrev () {
				if (!Array.isArray(this.pagesRange)) return false
				return !(this.pagesRange[0] <= 1)
			},
			hasNext () {
				if (!Array.isArray(this.pagesRange)) return false
				return !(this.pagesRange[this.pagesRange.length - 1] >= this.maxPage)
			}
		},
    ready () {
    },
    methods: {
				goTo (p) {
					this.goToPage(p)
				},
        nextRange () {
					let n = this.limit
					let next = Math.trunc(this.currentPage / n) * n + (n + 1)
					this.goToPage(next)
				},
				prevRange () {
					let n = this.limit
					let prev = Math.trunc(this.currentPage / n) * n - (n - 1)
					this.goToPage(prev)
				}
    }
}

</script>
