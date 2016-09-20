import notif from 'services/notifs-center'

export const notify = ({ dispatch }, type, body, title) => {
  notif[type](body, title)
  dispatch('ADD_NOTIF', {body, title})
}
