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
      name: 'welcome',
      component: require('welcome/index.welcome.vue'),
      subRoutes: {
        '/about': {
          name: 'about',
          component: require('welcome/view.about.vue')
        },
        '/education': {
          name: 'education',
          component: require('welcome/view.education.vue')
        },
        '/work': {
          name: 'work',
          component: require('welcome/view.work.vue')
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
    '*': '/about',
    '/welcome/about': '/about',
    '/welcome/education': '/education',
    '/welcome/work': '/work'
  })

  router.alias({
    '/': '/about'
  })

  router.beforeEach(function (transition) {
    let to = transition.to
    console.info(to)
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
