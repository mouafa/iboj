export function isReady ({messenger}) {
  return messenger.loaded
}

export function chatId ({messenger}) {
  return messenger.loaded
}

export function isMessagesListLoaded ({messenger}) {
  return messenger.chatsLoaded
}

export function messagesList ({messenger}) {
  return messenger.chats
}

export function chatData ({messenger}) {
  return messenger.data
}

export function userId ({messenger}) {
  return messenger.connectedUser
}

export function userUUID ({messenger}) {
  return messenger.connectedUserUUID
}

export function numberOfNotifications ({messenger}) {
  return messenger.numberOfNotifications
}

export function messagesToNotifyAbout ({messenger}) {
  return messenger.messagesToNotifyAbout
}
