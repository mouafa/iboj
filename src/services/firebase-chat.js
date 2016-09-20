import connector from 'services/connect.js'

// import firebase from 'firebase'
var $script = require('scriptjs')

var bus = require('services/bus')
var appConfig = require('webpack-config-loader!src/main.config.js')

var config = appConfig.messenger
var firebase

$script('https://www.gstatic.com/firebasejs/3.0.3/firebase.js', () => {
  firebase = window.firebase
  firebase.initializeApp(firebaseAppConfig)
})

// Initialize Firebase
let firebaseAppConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  databaseURL: config.databaseURL,
  storageBucket: config.storageBucket
}

module.exports = {
  connected: false, // will be set to the user ID when connected
  subscribedChatId: false, // will be set to the chat the user is reading at the moment
  init () {
    return connector.apiAsync('GET', '/connexion', '')
      .then((res) => {
        if (!firebase) {
          return new Promise((resolve, reject) => {
            window.setTimeout(() => {
              return resolve(this.init())
            }, 500)
          })
        } else {
          return this.signinOrSignup(res.tchatToken)
        }
      })
      .catch((err) => {
        // console.error(err)
        Promise.reject(err)
      })
  },
  signinOrSignup (token) {
    let user = {}
    return firebase.auth()
      .signInWithCustomToken(token)
      .then((authData) => {
        return connector.apiAsync('GET', '/profile?fields=[firstname,lastname,id,uuid,email]')
      })
      .catch((err) => {
        // console.error(err)
        Promise.reject(err)
      })
      .then((res) => {
        user = res
        this.connected = user.uuid
        // Verify if the user is already registred in firebase
        return firebase.database().ref(config.url + 'users/' + user.uuid).once('value')
      })
      .catch((err) => {
        // console.error(err)
        Promise.reject(err)
      })
      .then((snapshot) => {
        if (!snapshot.val()) {
          return firebase.database().ref(config.url + 'users/' + user.uuid + '/username').set(user.firstname + ' ' + user.lastname)
          .then(firebase.database().ref(config.url + 'users/' + user.uuid + '/email').set(user.email))
          .then(firebase.database().ref(config.url + 'users/' + user.uuid + '/id').set(user.id))
          .then(firebase.database().ref(config.url + 'users/' + user.uuid + '/uuid').set(user.uuid))
          .then(firebase.database().ref(config.url + 'users/' + user.uuid + '/chats/dummy').set(true))
          .then(firebase.database().ref(config.url + 'users/' + user.uuid + '/newMessages/dummy').set(true))
        } else {
          return snapshot.val()
        }
      })
      .catch((err) => {
        // console.error(err)
        Promise.reject(err)
      })
      .then((user) => {
        if (!user) return user
        return this.subscribeToChats()
      })
      .catch((err) => {
        // console.error(err)
        Promise.reject(err)
      })
  },
  signout () {
    return firebase.auth()
      .signOut()
      .then(() => {
        this.connected = false
      })
      .catch((err) => {
        // console.error(err)
        Promise.reject(err)
      })
  },
  findOrCreateGroupChat (joboffer, candidate) {
    let messageId = '' + joboffer.id + joboffer.responsible.id + candidate.id
    let participants = {}
    participants[joboffer.responsible.uuid] = {
      name: joboffer.responsible.firstname + ' ' + joboffer.responsible.lastname,
      id: joboffer.responsible.id,
      uuid: joboffer.responsible.uuid,
      img: joboffer.responsible.img,
      // title: joboffer.responsible.title,
      collaborator: true
    }
    participants[candidate.uuid] = {
      name: candidate.firstname + ' ' + candidate.lastname,
      id: candidate.id,
      uuid: candidate.uuid,
      img: candidate.img,
      title: candidate.title,
      collaborator: false
    }
    joboffer.collaborators.forEach(({ profile }) => {
      let collaborator = profile
      participants[collaborator.uuid] = {
        name: collaborator.firstname + ' ' + collaborator.lastname,
        id: collaborator.id,
        uuid: collaborator.uuid,
        img: collaborator.img,
        title: collaborator.title,
        collaborator: true
      }
    })
    if (!this.connected) {
      return this.init()
        .then(() => {
          return this.findOrCreateGroupChat(joboffer, candidate)
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
    } else {
      return firebase.database().ref(config.url + 'chats/' + messageId).once('value')
        .then((snapshot) => {
          if (!snapshot.val()) {
            return firebase.database().ref(config.url + 'chats/' + messageId + '/id').set(messageId)
            .then(firebase.database().ref(config.url + 'chats/' + messageId + '/responsible').set(participants[joboffer.responsible.uuid]))
            .then(firebase.database().ref(config.url + 'chats/' + messageId + '/jobofferUUID').set(joboffer.uuid))
            .then(firebase.database().ref(config.url + 'chats/' + messageId + '/jobofferId').set(joboffer.id))
            .then(firebase.database().ref(config.url + 'chats/' + messageId + '/company').set({
              'id': joboffer.company.id,
              'name': joboffer.company.name,
              'logo': joboffer.company.logo
            }))
            .then(firebase.database().ref(config.url + 'chats/' + messageId + '/applicant').set(participants[candidate.uuid]))
            .then(firebase.database().ref(config.url + 'chats/' + messageId + '/title').set(joboffer.title))
            .then(firebase.database().ref(config.url + 'chats/' + messageId + '/state').set('open'))
            .then(firebase.database().ref(config.url + 'chats/' + messageId + '/participants').set(participants))
            .then(firebase.database().ref(config.url + 'chats/' + messageId + '/lastMessageTime').set(new Date().toISOString()))
            .then(firebase.database().ref(config.url + 'chats/' + messageId + '/messages/0').set({
              'timestamp': new Date().toISOString(),
              'owner': joboffer.responsible.uuid,
              'content': joboffer.responsible.firstname + ' ' + joboffer.responsible.lastname + ' invited you to chat :)'
            }))
            .then(firebase.database().ref(config.url + 'joboffers/' + joboffer.id + '/' + messageId).set(true))
          } else {
            return messageId
          }
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
        .then((o) => {
          let promisesArray = []
          Object.keys(participants).forEach((p) => {
            promisesArray.push(this.verifyOrCreateReferenceToChat(p, messageId))
          })
          return Promise.all(promisesArray)
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
        .then((o) => {
          return messageId
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
    }
  },
  verifyOrCreateReferenceToChat (userUUID, messageId) {
    return firebase.database().ref(config.url + 'users/' + userUUID + '/chats/' + messageId).once('value')
      .then((snapshot) => {
        if (!snapshot.val()) {
          return firebase.database().ref(config.url + 'users/' + userUUID + '/chats/' + messageId).set(true)
          .then(firebase.database().ref(config.url + 'users/' + userUUID + '/newMessages/' + messageId).set(true))
        } else {
          return messageId
        }
      })
  },
  getChats () {
    if (!this.connected) {
      return this.init()
        .then(() => {
          return this.getChats()
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
    } else {
      return firebase.database().ref(config.url + 'users/' + this.connected + '/chats').once('value')
        .then((snapshot) => {
          let chatsList = snapshot.val()
          if (chatsList.dummy) delete chatsList.dummy
          let promisesArray = []
          for (let chatId in chatsList) {
            if (!chatsList.hasOwnProperty(chatId)) {
              continue
            }
            promisesArray.push(firebase.database().ref(config.url + 'chats/' + chatId).once('value'))
          }
          return Promise.all(promisesArray)
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
        .then((o) => {
          let a = []
          if (o.length) {
            o.forEach((e) => {
              a.push(e.val())
            })
          }
          return a
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
    }
  },
  getChatById (chatId) {
    if (!this.connected) {
      return this.init()
        .then(() => {
          return this.getChatById(chatId)
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
    } else {
      if (chatId === this.subscribedChatId || this.subscribedChatId === false) {
        this.subscribedChatId = chatId
        return firebase.database().ref(config.url + 'chats/' + chatId).once('value')
          .then((snapshot) => {
            firebase.database().ref(config.url + 'chats/' + chatId).on('value', (snapshot) => {
              bus.$emit('messenger:new-messages', snapshot.val())
            })
            return snapshot.val()
          })
          .catch((err) => {
            // console.error(err)
            Promise.reject(err)
          })
      } else {
        firebase.database().ref(config.url + 'chats/' + this.subscribedChatId).off()
        this.subscribedChatId = chatId
        return firebase.database().ref(config.url + 'chats/' + chatId).once('value')
          .then((snapshot) => {
            firebase.database().ref(config.url + 'chats/' + chatId).on('value', (snapshot) => {
              bus.$emit('messenger:new-messages', snapshot.val())
            })
            return snapshot.val()
          })
          .catch((err) => {
            // console.error(err)
            Promise.reject(err)
          })
      }
    }
  },
  sendMsg (chatId, msg, participants) {
    return firebase.database().ref(config.url + 'chats/' + chatId + '/messages').push({
      content: msg,
      owner: this.connected,
      timestamp: new Date().toISOString()
    })
    .then(firebase.database().ref(config.url + 'chats/' + chatId + '/lastMessageTime').set(new Date().toISOString()))
    .catch((err) => {
      // console.error(err)
      Promise.reject(err)
    })
    .then((snapshot) => {
      let participantsArray = Object.keys(participants)
      let promisesArray = []
      participantsArray.forEach((participant) => {
        if (participant !== this.connected) {
          promisesArray.push(firebase.database().ref(config.url + 'users/' + participant + '/newMessages/' + chatId).push(true))
        }
      })
      return Promise.all(promisesArray)
    })
    .catch((err) => {
      // console.error(err)
      Promise.reject(err)
    })
    .then((o) => Promise.resolve(o))
    .catch((err) => {
      // console.error(err)
      Promise.reject(err)
    })
  },
  checkNotifications () {
    if (!this.connected) {
      return this.init()
        .then(() => {
          return this.checkNotifications()
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
    } else {
      return firebase.database().ref(config.url + 'users/' + this.connected + '/newMessages').once('value')
      .then((snapshot) => {
        if (snapshot.val()) {
          let messages = Object.keys(snapshot.val())
          messages.splice(messages.indexOf('dummy', 1))
          bus.$emit('messenger:new-message-notification', {
            messages: messages
          })
        }
      })
      .catch((err) => {
        // console.error(err)
        Promise.reject(err)
      })
    }
  },
  subscribeToChats () {
    firebase.database().ref(config.url + 'users/' + this.connected + '/newMessages/').on('child_added', (snapshot) => {
      firebase.database().ref(config.url + 'users/' + this.connected + '/newMessages/').once('value', (snapshot) => {
        if (snapshot.val()) {
          let messages = Object.keys(snapshot.val())
          messages.splice(messages.indexOf('dummy', 1))
          bus.$emit('messenger:new-message-notification', {
            messages: messages
          })
        } else {
          bus.$emit('messenger:new-message-notification', {
            messages: []
          })
        }
      })
    })

    firebase.database().ref(config.url + 'users/' + this.connected + '/newMessages/').on('child_removed', (snapshot) => {
      firebase.database().ref(config.url + 'users/' + this.connected + '/newMessages/').once('value', (snapshot) => {
        if (snapshot.val()) {
          let messages = Object.keys(snapshot.val())
          messages.splice(messages.indexOf('dummy', 1))
          bus.$emit('messenger:new-message-notification', {
            messages: messages
          })
        } else {
          bus.$emit('messenger:new-message-notification', {
            messages: []
          })
        }
      })
    })
  },
  messageRead (chatId) {
    return firebase.database().ref(config.url + 'users/' + this.connected + '/newMessages/' + chatId).remove()
  },
  addCollaboratorToChats (collaborator, joboffer) {
    let messages = joboffer.applications.map((application) => {
      return '' + joboffer.id + joboffer.responsible.id + application.recommended
    })
    let collaboratorInfo = {
      name: collaborator.firstname + ' ' + collaborator.lastname,
      id: collaborator.id,
      uuid: collaborator.uuid,
      img: collaborator.img,
      title: collaborator.title,
      collaborator: true
    }
    let promisesArray = []
    messages.forEach((chatId) => {
      promisesArray.push(
        firebase.database().ref(config.url + 'chats/' + chatId).once('value')
        .then((snapshot) => {
          if (!snapshot.val()) return 0 // if chat does not exist, we don't do anything
          return firebase.database().ref(config.url + 'users/' + collaborator.uuid + '/chats/' + chatId).push(true)
          .then(firebase.database().ref(config.url + 'users/' + collaborator.uuid + '/newMessages/' + chatId).push(true))
          .then(firebase.database().ref(config.url + 'chats/' + chatId + '/participants/' + collaborator.uuid).set(collaboratorInfo))
        })
      )
    })
    return Promise.all(promisesArray)
  },
  removeCollaboratorFromChats (collaborator, joboffer, applicationsList) {
    let messages = applicationsList.map((application) => {
      return '' + joboffer.id + joboffer.responsible.id + application.recommended
    })
    let promisesArray = []
    messages.forEach((chatId) => {
      promisesArray.push(
        firebase.database().ref(config.url + 'chats/' + chatId).once('value')
        .then((snapshot) => {
          if (!snapshot.val()) return 0 // if chat does not exist, we don't do anything
          return firebase.database().ref(config.url + 'users/' + collaborator.uuid + '/chats/' + chatId).remove()
          .then(firebase.database().ref(config.url + 'users/' + collaborator.uuid + '/newMessages/' + chatId).remove())
          .then(firebase.database().ref(config.url + 'chats/' + chatId + '/participants/' + collaborator.uuid).remove())
        })
      )
    })
    return Promise.all(promisesArray)
  },
  toggleLockChat (chat) {
    let newState = chat.state === 'open' ? 'locked' : 'open'
    return firebase.database().ref(config.url + 'chats/' + chat.id + '/state').set(newState)
  },
  getChatOfJoboffer (jobofferId) {
    if (!this.connected) {
      return this.init()
        .then(() => {
          return this.getChatOfJoboffer(jobofferId)
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
    } else {
      return firebase.database().ref(config.url + 'joboffers/' + jobofferId).once('value')
      .then((snapshot) => {
        return snapshot.val()
      })
      .catch((err) => {
        // console.error(err)
        Promise.reject(err)
      })
    }
  },
  checkNotificationForJoboffer (chatId) {
    if (!this.connected) {
      return this.init()
        .then(() => {
          return this.checkNotificationForJoboffer(chatId)
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
    } else {
      return firebase.database().ref(config.url + 'users/' + this.connected + '/newMessages/' + chatId).once('value')
        .then((snapshot) => {
          return snapshot.val()
        })
        .catch((err) => {
          // console.error(err)
          Promise.reject(err)
        })
    }
  }
}
