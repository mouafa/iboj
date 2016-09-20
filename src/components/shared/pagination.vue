<style lang="less" scoped>

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

  <section class="-pagination-container fx-row fx-center-center m-b-sm row">
    <ul v-if="pagination.total" class="pagination fx-row fx-start-center" >
        <li @click="prevRange" :class="{'disabled': !hasPrev}" class="waves-effect"><a class="waves-effect waves-teal btn-flat">Prev. Page<i class="material-icons">chevron_left</i></a></li>
        <li @click="goToPage(page)" v-for="page in pagesRange" class="waves-effect" :class="{'active teal lighten-2': pagination.currentPage == page}"><a>{{page}}</a></li>
        <li @click="nextRange" :class="{'disabled': !hasNext}" class="waves-effect"><a class="waves-effect waves-teal btn-flat"><i class="material-icons">chevron_right</i>Next Page</a></li>
      </ul>
  </section>

</template>
<script>
var bus = require('services/bus.js')
module.exports = {
  props: {
    pagination: {
      type: Object,
      require: true
    }
  },
  computed: {
    maxPage () {
      return this.pagination.total % this.pagination.limit == 0 ? Math.trunc(this.pagination.total / this.pagination.limit) : Math.trunc(this.pagination.total / this.pagination.limit) + 1
    },
    pagesRange () {
      if (!this.pagination.limit || !this.pagination.currentPage || !this.maxPage) return null
      let n = this.pagination.limit
      let add = this.pagination.currentPage % n == 0 ? this.pagination.currentPage - (n - 1) : Math.trunc(this.pagination.currentPage / n) * n + 1
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
  methods: {
    goToPage (page) {
      this.pagination.currentPage = page
      bus.$emit('pagination:change', this.pagination)
    },
    nextRange () {
      let n = this.pagination.limit
      let next = Math.trunc(this.pagination.currentPage / n) * n + (n + 1)
       this.goToPage(next)
    },
    prevRange () {
      let n = this.pagination.limit
      let prev = Math.trunc(this.pagination.currentPage / n) * n - (n - 1)
      this.goToPage(prev)
    }
  }
}
</script>
