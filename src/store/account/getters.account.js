export function isReady (state) {
  return state.account.loaded
}

export function isAuthed (state) {
  return state.account.authed
}

export function getAccount (state) {
  return state.account
}

export function accountData ({account}) {
  return account.data
}
