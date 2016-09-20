export default {
  data () {
      return {
        items: [],
        query: '',
        current: -1,
        isLoading: false,
        isDisplayed: true
      }
    },

    computed: {
      hasItems () {
          return this.items.length > 0
        },

        isEmpty () {
          return !this.query
        },

        isDirty () {
          return !!this.query
        }
    },

    methods: {
      update () {
          var vm = this
          if (!vm.query) return vm.reset()
          if (vm.minChars && vm.query.length < vm.minChars) return

          vm.isLoading = true

          vm.fetch().then((response) => {
            vm.showList()
            let data = response
            data = vm.prepareResponseData ? vm.prepareResponseData(data) : data
            vm.items = vm.limit ? data.slice(0, vm.limit) : data
            vm.current = -1
            setTimeout(() => (vm.isLoading = false), 300)
          })
        },
        fetch () {
          console.warn('please specify a fetch method thet return Promise')
          return Promise.reject()
        },

        reset () {
          this.items = []
          this.query = ''
          this.isLoading = false
        },

        setActive (index) {
          this.current = index
        },

        activeClass (index) {
          return {
            active: this.current == index
          }
        },

        hit () {
          if (this.current !== -1 && this.isDisplayed) {
            this.onHit(this.items[this.current])
          } else {
            this.search(this.query)
          }
          this.hideList()
        },

        up () {
          if (this.current > 0) {
            this.current--
          } else if (this.current == -1) {
            this.current = this.items.length - 1
          } else {
            this.current = -1
          }
        },

        down () {
          if (this.current < this.items.length - 1) {
            this.current++
          } else {
            this.current = -1
          }
        },
        right () {
          if (this.onRight && this.current !== -1) {
            this.onRight(this.items[this.current])
            this.update()
          }
        },
        onHit () {
          console.warn('You need to implement the `onHit` method')
        },
        hideList () {
          this.isDisplayed = false
        },
        showList () {
          this.isDisplayed = true
        },
    		onBlur () {
    			this.hideList()
    			if (!this.query && this.search) this.search('')
    		},
    		onFocus () {
    			this.showList()
    		}
    }
}
