import Router from 'vue-router'
// import connect from 'services/connect'

var router

export function routes (Vue) {
  Vue.use(Router)

  router = new Router({
    // history: true
    // saveScrollPosition: true
  })

  router.map({
    '/': {
      auth: true,
      name: 'companyPage',
      component: require('company/index.company.vue'),
      subRoutes: {
        '/:id': {
          paramsType: String,
          paramsId: 'id',
          name: 'company',
          component: require('company/view.company.vue')
        }
      }
    },
    '/joboffer/:jobId': {
      name: 'joboffer',
      paramsType: String,
      paramsId: 'jobId',
      component: {
        ready: () => (window.location = window.location.href.replace('#!', 'company.html#!'))
      }
    },
    '/auth': {
      component: {
        ready: () => (window.location = window.location.origin + '/auth.html')
      }
    },
    '/404': {
      component: {
        ready: () => (window.location = window.location.origin + '/404.html')
      }
    }
  })

  router.redirect({
    '*': '/'
  })

  router.alias({
    '/': '/about'
  })

  router.beforeEach(function (transition) {
    let to = transition.to

    if (to.path.indexOf('?fb') > 0) {
      let path = to.path
      path = path.substring(0, path.indexOf('?fb'))
      transition.abort()
      router.replace(path)
    }
    if (to.auth && !window.localStorage.auth) {
      transition.abort()
      router.go('/auth')
    } else if (to.paramsType && to.paramsId && !to.paramsType(to.params[to.paramsId])) {
      transition.abort()
      router.go('/404')
    } else {
      transition.next()
    }
    window.scrollTo(0, 0)
  })

  return router
}
