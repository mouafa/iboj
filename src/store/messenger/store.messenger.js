// initial state
const state = {
  data: {},
  chats: [],
  chatsLoaded: false,
  loaded: false,
  connectedUser: 0,
  connectedUserUUID: '',
  applicantUUID: '',
  numberOfNotifications: 0,
  messagesToNotifyAbout: []
}

// mutations
const mutations = {
  'SET_CHAT_DATA' (state, res) {
    state.loaded = res.id
    state.data = res
  },
  'SET_CHATS_LIST' (state, res) {
    state.chatsLoaded = true
    state.chats = res
  },
  'UNLOAD_CHAT' (state) {
    state.loaded = false
    state.applicantUUID = ''
  },
  'MSG_SENT' (state, res) {
    // console.log(res)
  },
  'SET_MESSAGES' (state, res) {
    state.data = res
  },
  'TOGGLE_LOCK_CHAT' (state, id) {
    let chatToBeLocked = state.chats.find((chat) => {
      return chat.id === id
    })
    chatToBeLocked.state = chatToBeLocked.state === 'open' ? 'locked' : 'open'
  },
  // 'SET_NOTIFICATIONS_NUMBER' (state, res) {
  //   state.numberOfNotifications = res
  // },
  'SET_NOTIFICATIONS_MESSAGES' (state, res) {
    state.numberOfNotifications = res.length
    state.messagesToNotifyAbout = res
  },
  'MSG_READ' (state, res) {
    if (state.messagesToNotifyAbout.indexOf(res) !== -1) state.messagesToNotifyAbout.splice(state.messagesToNotifyAbout.indexOf(res), 1)
  },
  'SET_CONNECTED_USER' (state, userId) {
    state.connectedUser = userId
  },
  'SET_CONNECTED_USER_UUID' (state, userUUID) {
    state.connectedUserUUID = userUUID
  }
}

export default {
  state,
  mutations
}
