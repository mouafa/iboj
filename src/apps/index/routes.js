import Router from 'vue-router'

var router

export function routes (Vue) {
  Vue.use(Router)
  router = new Router()

  router.map({
    '/': {
      auth: false,
      name: 'home',
      component: require('components/filter/index.filter.vue'),
      subRoutes: {
        '/': {
          component: resolve => require.ensure([], () => resolve(require('components/filter/view.filter.vue')), 'filter-view')
          // resolve => require(['components/filter/view.filter.vue'], resolve)
        },
        // '/home': {
        //   component: resolve => require.ensure([], () => resolve(require('components/filter/view.filter.vue')), 'filter-views')
        // },
        '/settings': {
          auth: true,
          name: 'settings',
          component: require('components/settings/index.setting.vue')
        },
        '/joboffer/:jobId': {
          name: 'joboffer',
          paramsType: String,
          paramsId: 'jobId',
          component: resolve => require.ensure([], () => resolve(require('joboffer/view.joboffer.vue')), 'joboffer-view')
        },
        '/myjoboffer/:jobId': {
          name: 'myjoboffer',
          paramsType: String,
          paramsId: 'jobId',
          component: resolve => require.ensure([], () => resolve(require('joboffer/view.my.joboffer.vue')), 'joboffer-view')
        }
      }
    },
    '/company': {
      auth: true,
      name: 'companyPage',
      component: resolve => require.ensure([], () => resolve(require('company/index.company.vue')), 'company-view'),
      subRoutes: {
        '/:id': {
          paramsType: String,
          paramsId: 'id',
          name: 'company',
          component: resolve => require.ensure([], () => resolve(require('company/view.company.vue')), 'company-view')
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
