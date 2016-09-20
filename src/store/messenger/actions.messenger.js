import connect from 'services/connect'
import firebase from 'services/firebase-chat'

export const loadChat = ({ dispatch }, id) => {
  return firebase.getChatById(id)
    .then((o) => {
      dispatch('SET_CHAT_DATA', o)
      return o
    })
    .catch((err) => console.error(err))
}

export const loadChatList = ({ dispatch }) => {
  return firebase.getChats()
    .then((o) => {
      let list = o.map((c) => {
        c.jobofferURL = window.location.origin + '/#!/joboffer/' + c.jobofferUUID
        return c
      })
      dispatch('SET_CHATS_LIST', list)
      return list
    })
    .catch((err) => console.error(err))
}

export const unloadChat = ({ dispatch }) => {
  dispatch('UNLOAD_CHAT')
}

export const sendMsg = ({ dispatch }, chatId, msg, participants) => {
  return firebase.sendMsg(chatId, msg, participants)
    .then((o) => {
      dispatch('MSG_SENT', msg)
      return o
    })
    .catch((err) => console.error(err))
}

export const toggleLockChat = ({ dispatch }, chat) => {
  let o = JSON.parse(JSON.stringify(chat))
  dispatch('TOGGLE_LOCK_CHAT', chat.id)
  return firebase.toggleLockChat(o)
    .then((o) => {
      return o
    })
    .catch((err) => {
      dispatch('TOGGLE_LOCK_CHAT', chat.id)
      console.error(err)
    })
}

export const messageRead = ({ dispatch }, chatId) => {
  return firebase.messageRead(chatId)
    .then((o) => {
      dispatch('MSG_READ', chatId)
      return o
    })
    .catch((err) => console.error(err))
}

export const updateMsgs = ({ dispatch }, o) => {
  dispatch('SET_MESSAGES', o)
}

// export const setNotificationsNumber = ({ dispatch }, o) => {
//   dispatch('SET_NOTIFICATIONS_NUMBER', o)
// }

export const setMessagesToNotifyAbout = ({ dispatch }, o) => {
  dispatch('SET_NOTIFICATIONS_MESSAGES', o)
}

export const checkNewNotifications = ({ dispatch }, o) => {
  return firebase.checkNotifications()
}

export const setConnectedUser = ({ dispatch }) => {
  return connect.apiAsync('GET', '/profile?fields=[id,uuid]')
    .then(
      (res) => {
        dispatch('SET_CONNECTED_USER', res.id)
        dispatch('SET_CONNECTED_USER_UUID', res.uuid)
        return res
      },
      (err) => {
        return err
      })
}
