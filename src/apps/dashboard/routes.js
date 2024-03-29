import Router from 'vue-router'

var router

export function routes (Vue) {
  Vue.use(Router)

  router = new Router()

  router.map({
    '/': {
      auth: true,
      name: 'mydashboard',
      component: require('dashboard/index.dashboard.vue'),
      subRoutes: {
        '/': {
          component: require('dashboard/applicant.dashboard.vue')
        }
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
