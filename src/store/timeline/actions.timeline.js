var connect = require('services/connect')

export const loadJoboffers = ({ dispatch, state }) => {
  if (state.timeline.total && state.timeline.loaded >= state.timeline.total) return

  let options = { limit: state.timeline.limit, page: state.timeline.page }
  return new Promise(function (resolve, reject) {
    connect.apiCall(options, '/joboffers', 'GET', (err, res, header) => {
      if (err) reject(err)
      else {
        dispatch('SET_TIMELINE_DATA', res, connect.parse(header))
        resolve()
      }
    })
    // connect.apiAsync('GET', '/joboffers', options)
    // .then(
    //   (res) => {
    //     dispatch('SET_TIMELINE_DATA', res)
    //     resolve()
    //   },
    //   (err) => reject(err))
  })
}

export const sendInvitation = ({ dispatch, state }, receiver) => {
  return connect.apiAsync('POST', '/contacts', receiver)
  .then((data) => {
    dispatch('INVITATION_SENT')
  }, (err) => console.warn(err))
}
