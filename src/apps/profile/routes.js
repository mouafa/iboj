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
    '/import/:type': {
      auth: true,
      name: 'importData',
      component: require('import/index.import.vue')
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
    },
    '/': {
      auth: true,
      name: 'myProfile',
      component: require('profile/index.profile.vue'),
      subRoutes: {
        '/:id': {
          paramsId: 'id',
          paramsType: String,
          name: 'profile',
          component: require('profile/view.profile.vue')
        }
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
