import Router from 'vue-router'
import connect from 'services/connect'

var router

export function routes (Vue) {
  Vue.use(Router)

  router = new Router({
    history: true,
    saveScrollPosition: true
  })

  router.map({
    '/search': {
      name: 'search',
      component: resolve => require(['home/view.search.vue'], resolve)
    },
    '/filter': {
      component: resolve => require(['components/filter/index.filter.vue'], resolve),
      subRoutes: {
        '/': {
          component: resolve => require(['components/filter/view.filter.vue'], resolve)
        }
      }
    },
    '/welcome': {
      auth: true,
      name: 'welcome',
      component: resolve => require(['welcome/index.welcome.vue'], resolve),
      subRoutes: {
        '/about': {
          name: 'about',
          component: resolve => require(['welcome/view.about.vue'], resolve)
        },
        '/education': {
          name: 'education',
          component: resolve => require(['welcome/view.education.vue'], resolve)
        },
        '/work': {
          name: 'work',
          component: resolve => require(['welcome/view.work.vue'], resolve)
        }
      }
    },
    '/': {
      auth: false,
      name: 'home',
      component: resolve => require(['components/filter/index.filter.vue'], resolve),
      subRoutes: {
        '/': {
          component: resolve => require(['components/filter/view.filter.vue'], resolve)
        },
        '/home': {
          component: resolve => require(['components/home/view.timeline.vue'], resolve)
        },
        '/joboffer/:jobId': {
          name: 'joboffer',
          paramsType: String,
          paramsId: 'jobId',
          component: resolve => require(['joboffer/view.joboffer.vue'], resolve)
        }
      }
    },
    '/profile': {
      auth: true,
      name: 'myProfile',
      component: resolve => require(['profile/index.profile.vue'], resolve),
      subRoutes: {
        '/:id': {
          paramsId: 'id',
          paramsType: String,
          name: 'profile',
          component: resolve => require(['profile/view.profile.vue'], resolve)
        }
      }
    },
    '/settings': {
      auth: true,
      name: 'settings',
      component: resolve => require(['components/settings/index.setting.vue'], resolve)
    },
    '/dashboard': {
      auth: true,
      name: 'mydashboard',
      component: resolve => require(['dashboard/index.dashboard.vue'], resolve),
      subRoutes: {
        '/': {
          component: resolve => require(['dashboard/view.dashboard.vue'], resolve)
        }
      }
    },
    '/company': {
      auth: true,
      name: 'companyPage',
      component: resolve => require(['company/index.company.vue'], resolve),
      subRoutes: {
        '/:id': {
          paramsType: String,
          paramsId: 'id',
          name: 'company',
          component: resolve => require(['company/view.company.vue'], resolve)
        }
      }
    },
    '/messenger': {
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
    '/addjoboffer': {
      auth: true,
      name: 'addjoboffer',
      component: resolve => require(['add-joboffer/index.add-joboffer.vue'], resolve),
      subRoutes: {
        '/': {
          stepId: 1,
          component: resolve => require(['add-joboffer/view.general-info.vue'], resolve)
        },
        '/:jobId': {
          name: 'job-info',
          stepId: 1,
          component: resolve => require(['add-joboffer/view.general-info.vue'], resolve)
        },
        'description/:jobId': {
          name: 'job-description',
          stepId: 2,
          component: resolve => require(['add-joboffer/view.description.vue'], resolve)
        },
        '/quizbuilder/:jobId': {
          name: 'job-quizbuilder',
          stepId: 3,
          component: resolve => require(['add-joboffer/view.quiz.vue'], resolve)
        }
      }
    },
    '/404': {
      name: '404',
      component: resolve => require(['components/404/index.404.vue'], resolve)
    }
  })

  router.redirect({
    '*': '/',
    '/welcome': '/welcome/about',
    '/joboffer': '/',
    '/company': '/'
  })

  // router.alias({
  // '/welcome': '/welcome/about'
  // })

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
