import Router from 'vue-router'

var router

export function routes (Vue) {
  Vue.use(Router)

  router = new Router()
  router.map({
    '/': {
      auth: true,
      name: 'addjoboffer',
      component: require('add-joboffer/index.add-joboffer.vue'),
      subRoutes: {
        '/': {
          stepId: 1,
          component: require('add-joboffer/view.general-info.vue')
        },
        '/:jobId': {
          name: 'job-info',
          stepId: 1,
          component: require('add-joboffer/view.general-info.vue')
        },
        'description/:jobId': {
          name: 'job-description',
          stepId: 2,
          component: require('add-joboffer/view.description.vue')
        },
        '/quizbuilder/:jobId': {
          name: 'job-quizbuilder',
          stepId: 3,
          component: require('add-joboffer/view.quiz.vue')
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
