var Vue = require('vue')
var connector = require('services/connect.js')
// console.log(window.nudgespot.identify)

var profile = new Vue({
  data: {
    user: '',
    title: '',
    state: '',
    img: '',
    id: '',
    name: '',
    visits: 0,
    invitations: 0,
    friendship: ''
  },
  methods: {
    load () {
      connector.apiCall('', '/profile?fields=[firstname,lastname,about,title,img,cv,id,visits,invitations,email]', 'GET', (error, response) => {
        if (error) return
        profile.user = response.user
        profile.title = response.title
        profile.state = response.state
        profile.img = response.img
        profile.cv = response.cv
        profile.id = response.id
        profile.name = response.firstname + ' ' + response.lastname
        profile.invitations = response.invitations
        profile.visits = response.visits
        profile.email = response.email
        profile.friendship = response.friendship || ''
        // window.nudgespot.identify(response.email, { first_name: response.firstname, last_name: response.lastname })
        profile.$emit('profile:ready', response.id)
      })
    },
    loadAsync () {
      return new Promise((resolve, reject) => {
        connector.apiCall('', '/profile?fields=[firstname,lastname,about,title,img,cv,id,visits,invitations,email]', 'GET', (error, response) => {
          if (error) reject(error)
          else {
            profile.user = response.user
            profile.title = response.title
            profile.state = response.state
            profile.img = response.img
            profile.cv = response.cv
            profile.about = response.about
            profile.id = response.id
            profile.name = response.firstname + ' ' + response.lastname
            profile.invitations = response.invitations
            profile.visits = response.visits
            profile.email = response.email
            profile.friendship = response.friendship || ''
            profile.$emit('profile:ready', response.id)
            resolve(profile.id)
          }
        })
      })
    },
    ready () {
      return new Promise((resolve, reject) => {
        if (profile.id) resolve(profile.id)
        else {
          this.loadAsync()
          .then((data) => resolve(data))
          .catch((error) => reject(error))
        }
      })
    },
    getExperiences () {
      return new Promise((resolve, reject) => {
        connector.apiCall('', '/profile?fields=[experience]', 'GET', (error, response) => {
          if (error) reject(error)
          else resolve(response)
        })
      })
    },
    getEducations () {
      return new Promise((resolve, reject) => {
        connector.apiCall('', '/profile?fields=[education]', 'GET', (error, response) => {
          if (error) reject(error)
          else resolve(response)
        })
      })
    }
  }
})

module.exports = profile
