import Router from 'vue-router'

var router

export function routes (Vue) {
  Vue.use(Router)

  router = new Router()

  router.map({
    '/': {
      name: '404',
      component: resolve => require.ensure([], () => resolve(require('components/404/index.404.vue')), '404-view')
    }
  })

  router.redirect({
    '*': '/'
  })

  return router
}
