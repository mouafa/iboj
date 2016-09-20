import Router from 'vue-router'
import connect from 'services/connect'

var router

export function routes (Vue) {
  Vue.use(Router)

  router = new Router()

  router.map({
    '/': {
      name: 'auth',
      component: require('auth/index.auth.vue'),
      subRoutes: {
        '/': {
          name: 'sigin',
          component: require('auth/view.auth.vue')
        },
        '/reset': {
          name: 'reset',
          component: require('auth/view.reset.vue')
        },
        '/register': {
          name: 'signup',
          component: require('auth/slaves/signup.vue')
        },
        '/logout': {
          name: 'logout',
          component: {
            ready: logout
          }
        },
        '/complet': {
            name: 'complet',
            component: require('auth/view.complet.vue')
        }
      }
    }
  })

  router.redirect({
    '*': '/'
  })

  router.alias({
    'auth/reset': '/reset',
    'auth/register': '/register',
    'auth': '/',
    'auth/logout': '/logout',
    'auth/complet': '/complet'
  })

  return router
}

function logout () {
  connect.apiCall('', '/logout', 'GET', (err, res) => {
    if (!err) {
      window.localStorage.removeItem('auth')
      router.go('/auth')
    }
  })
}
