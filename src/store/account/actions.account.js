var connect = require('services/connect')

export const loadAccount = ({ dispatch, state }) => {
  return new Promise(function (resolve, reject) {
    if (state.account.loaded) resolve(state.account.data)
    else {
      connect.apiAsync('GET', '/profile?fields=[firstname,lastname,about,title,img,id,slug,uuid,visits,invitations,email]')
      .then(
        (res) => {
          dispatch('SET_ACCOUNT_DATA', res)
          window.localStorage.setItem('auth', true)
          resolve(res)
        },
        (err) => {
          dispatch('SET_ACCOUNT_AUTHED', false)
          window.localStorage.removeItem('auth')
          reject(err)
        })
    }
  })
}

export const loadConnexion = ({ dispatch, state }) => {
  return new Promise(function (resolve, reject) {
    if (state.account.loaded) resolve(state.account.data)
    else {
      connect.apiAsync('GET', '/connexion')
      .then(
        (res) => {
          dispatch('SET_ACCOUNT_AUTHED', true)
          window.localStorage.setItem('auth', true)
          resolve(res)
        },
        (err) => {
          dispatch('SET_ACCOUNT_AUTHED', false)
          window.localStorage.removeItem('auth')
          reject(err)
        })
    }
  })
}

export const sendInvitation = ({ dispatch, state }, receiver) => {
  return new Promise(function (resolve, reject) {
    connect.apiAsync('POST', '/contacts', receiver)
    .then((res) => {
      dispatch('INVITATION_SENT')
      resolve(res)
    }, (err) => reject(err))
  })
}
