import Router from 'vue-router'

var router

export function routes (Vue) {
  Vue.use(Router)

  router = new Router()

  router.map({
    '/': {
      auth: true,
      name: 'myMessages',
      component: resolve => require(['messenger/index.messenger.vue'], resolve),
      subRoutes: {
        '/:id': {
          paramsType: Number,
          paramsId: 'id',
          name: 'message',
          component: resolve => require(['messenger/view.messenger.vue'], resolve)
        },
        '/': {
          name: 'messages',
          component: resolve => require(['messenger/view.messenger.vue'], resolve)
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
