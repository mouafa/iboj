import VueValidator from 'vue-validator'

export function validator (Vue) {
  Vue.use(VueValidator)

  Vue.validator('email', {
    message: 'is invalid',
    check: function (val) {
      return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
    }
  })

  Vue.validator('password', {
    message: 'must contain letters and numbers',
    check: function (val) {
      return /^(?=.*[a-zA-Z])(?=.*\d).*$/.test(val)
    }
  })

  Vue.validator('number', {
    message: 'is not a number',
    check: function (val) {
      return /^[-+]?[0-9]+$/.test(val)
    }
  })

  Vue.validator('url', {
    message: 'is not a valid URL address',
    check: function (val) {
      return /^(http\:\/\/|https\:\/\/)(.{4,})$/.test(val)
    }
  })

  Vue.validator('required', {
    message: 'is required',
    check: Vue.validator('required')
  })

  Vue.validator('maxlength', {
    message: function (field, rule) {
      // console.log('tada', field, rule)
      return 'must be under ' + rule + ' letters'
    },
    check: Vue.validator('maxlength')
  })

  Vue.validator('minlength', {
    message: function (field, rule) {
      // console.log('tada', field, rule)
      return 'must be longer than ' + rule + ' letters'
    },
    check: Vue.validator('minlength')
  })

  Vue.validator('range', {
    message: function (field, rule) {
      let range = rule.split('-')
      return `must be between ${range[0]} and ${range[1]}`
    },
    check: function (val, rule) {
      let range = rule.split('-')
      return Number(val) >= Number(range[0]) && Number(val) <= Number(range[1])
    }
  })

  Vue.component('errors-list', {
    props: ['field', 'validator', 'message'],
    template: '<span class="m-b-xs error-{{validator}}">{{field}} {{message}}</span>'
  })
}
