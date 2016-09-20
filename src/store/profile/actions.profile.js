var connect = require('services/connect')

export const flushProfile = ({ dispatch }, id) => {
  dispatch('FLUSH_PROFILE_DATA')
}

export const unloadProfile = ({ dispatch }) => {
  dispatch('UNLOAD_PROFILE')
}

export const loadProfile = ({ dispatch }, id) => {
  return new Promise((resolve, reject) => {
    let _id = id ? '/' + id : ''
    connect.apiAsync('GET', '/profile' + _id)
    .then((res) => {
      dispatch('SET_PROFILE_DATA', res)
      resolve(res)
    })
    .catch((err) => reject(err.responseText))

    if (!_id) return
    // load profile contact
    // connect.apiAsync('GET', '/profile/' + id + '/contacts', {page: 0, limit: 10})
    // .then((res) => dispatch('SET_PROFILE_CONTACT', res))
    // .catch((err) => console.warn('err loadContact', err.responseText))
  })
}

export const setProfileImg = ({ dispatch }, img) => {
  connect.apiAsync('PUT', '/profile', {img})
  .then((data) => {
    dispatch('SET_PROFILE_IMG', data.img)
    dispatch('SET_ACCOUNT_ATR', 'img', data.img)
  }, (err) => console.warn(err))
}

export const updateProfileCv = ({ dispatch }, cv) => {
  connect.apiAsync('PUT', '/profile', {cv})
  .then((data) => {
    dispatch('SET_PROFILE_CV', data.cv)
  }, (err) => console.warn(err))
}
export const addProfileCv = ({ dispatch }, cv) => {
  dispatch('ADD_PROFILE_CV', cv)
}
export const deleteProfileCv = ({ dispatch }, cv) => {
  dispatch('DELETE_PROFILE_CV', cv)
}
export const updateAbout = ({ dispatch }, newAbout) => {
  return connect.apiAsync('PUT', '/profile', newAbout)
  .then((data) => {
    dispatch('SET_PROFILE_ABOUT', data)
  }, (err) => console.warn(err))
}

// experience actions
export const setCompanyImg = ({ dispatch }, img, id, company_id) => {
  return connect.apiAsync('PUT', '/workrecords/' + id, {img, company_id})
  .then((data) => {
    dispatch('SET_EXPERIENCE_IMG', data.img, id)
  }, (err) => console.warn(err))
}

export const setActiveExp = ({ dispatch }, data) => {
  dispatch('SET_ACTIVE_EXPERIENCE', data)
}

export const cancelActiveExp = ({ dispatch }) => {
  dispatch('CANCEL_ACTIVE_EXPERIENCE')
}

export const saveActiveExp = ({ dispatch, state }, data) => {
  let id = state.profile.activeExpData.id
  delete data.id
  return new Promise((resolve, reject) => {
    connect.apiAsync('PUT', '/workrecords/' + id, data)
    .then((data) => {
      dispatch('EDIT_ACTIVE_EXPERIENCE', data)
      resolve()
    })
    .catch(reject)
  })
}

export const deleteActiveExp = ({ dispatch, state }) => {
  let id = state.profile.activeExpData.id
  return connect.apiAsync('DELETE', '/workrecords/' + id)
  .then((data) => {
    dispatch('DELETE_ACTIVE_EXPERIENCE', data)
  }, (err) => console.warn(err))
}

export const addNewExp = ({ dispatch, state }, data) => {
  delete data.id
  return new Promise((resolve, reject) => {
    return connect.apiAsync('POST', '/workrecords', data)
    .then((newData) => {
      dispatch('ADD_PROFILE_EXPERIENCE', newData)
      resolve()
    })
    .catch(reject)
  })
}

// education actions
export const setSchoolImg = ({ dispatch }, img, id, school_id) => {
  return connect.apiAsync('PUT', '/educationrecords/' + id, {img, school_id})
  .then((data) => {
    dispatch('SET_EDUCATION_IMG', data.img, id)
  }, (err) => console.warn(err))
}

export const setActiveEdu = ({ dispatch }, data) => {
  dispatch('SET_ACTIVE_EDUCATION', data)
}

export const cancelActiveEdu = ({ dispatch }) => {
  dispatch('CANCEL_ACTIVE_EDUCATION')
}

export const saveActiveEdu = ({ dispatch, state }, data) => {
  let id = state.profile.activeEduData.id
  delete data.id

  return new Promise((resolve, reject) => {
    connect.apiAsync('PUT', '/educationrecords/' + id, data)
    .then((data) => {
      dispatch('EDIT_ACTIVE_EDUCATION', data)
      resolve()
    })
    .catch(reject)
  })
}

export const deleteActiveEdu = ({ dispatch, state }) => {
  let id = state.profile.activeEduData.id
  return connect.apiAsync('DELETE', '/educationrecords/' + id)
  .then((data) => {
    dispatch('DELETE_ACTIVE_EDUCATION', data)
  }, (err) => console.warn(err))
}

export const addNewEdu = ({ dispatch, state }, data) => {
  delete data.id
  return new Promise((resolve, reject) => {
    connect.apiAsync('POST', '/educationrecords', data)
    .then((newData) => {
      dispatch('ADD_PROFILE_EDUCATION', newData)
      resolve()
    }, (err) => console.warn(err))
    .catch(reject)
  })
}

// education actions
export const setActiveSec = ({ dispatch }, data) => {
  dispatch('SET_ACTIVE_SECTION', data)
}

export const cancelActiveSec = ({ dispatch }) => {
  dispatch('CANCEL_ACTIVE_SECTION')
}

export const saveActiveSec = ({ dispatch, state }, data, sectionId) => {
  let profileId = state.profile.data.id
  let category_id = state.profile.activeSecData.id
  data.category_id = category_id
  return connect.apiAsync('PUT', '/profile/' + profileId + '/customsections/' + sectionId, data)
  .then((data) => {
    dispatch('EDIT_ACTIVE_SECTION', data, sectionId)
  }, (err) => console.warn(err))
}

export const addToActiveSec = ({ dispatch, state }, data) => {
  let profileId = state.profile.data.id
  data.category_id = state.profile.activeSecData.id
  return connect.apiAsync('POST', '/profile/' + profileId + '/customsections', data)
  .then((data) => {
    dispatch('ADD_TO_ACTIVE_SECTION', data)
  }, (err) => console.warn(err))
}

export const deleteFromActiveSec = ({ dispatch, state }, sectionId) => {
  let profileId = state.profile.data.id
  return connect.apiAsync('DELETE', '/profile/' + profileId + '/customsections/' + sectionId)
  .then((data) => {
    dispatch('DELETE_FROM_ACTIVE_SECTION', sectionId)
  }, (err) => console.warn(err))
}

// category actions

export const saveActiveSecCat = ({ dispatch, state }, data) => {
  let profileId = state.profile.data.id
  let category_id = state.profile.activeSecData.id
  data.category_id = category_id
  return connect.apiAsync('PUT', '/profile/' + profileId + '/customsectionscategory/' + category_id, data)
  .then((data) => {
    dispatch('EDIT_ACTIVE_SECTION', data)
  }, (err) => console.warn(err))
}

export const deleteActiveSec = ({ dispatch, state }) => {
  let profileId = state.profile.data.id
  let category_id = state.profile.activeSecData.id
  return connect.apiAsync('DELETE', '/profile/' + profileId + '/customsectionscategory/' + category_id)
  .then((data) => {
    dispatch('DELETE_ACTIVE_SECTION', data)
  }, (err) => console.warn(err))
}

export const addNewSec = ({ dispatch, state }, data) => {
  let profileId = state.profile.data.id
  return connect.apiAsync('POST', '/profile/' + profileId + '/customsectionscategory', data)
  .then((data) => {
    dispatch('ADD_PROFILE_SECTION', data)
  }, (err) => console.warn(err))
}

// contact actions

export const contactAdd = ({ dispatch, state }, receiver) => {
  return connect.apiAsync('POST', '/contacts', receiver)
  .then((data) => {
    dispatch('CONTACT_REQUEST_SENT', data)
  }, (err) => console.warn(err))
}

export const contactRemove = ({ dispatch, state }, friendshipId) => {
  return connect.apiAsync('DELETE', '/contacts/' + friendshipId)
  .then((data) => {
    dispatch('CONTACT_REQUEST_REMOVE', data)
  }, (err) => console.warn(err))
}

export const contactConfirm = ({ dispatch, state }, friendshipId) => {
  return connect.apiAsync('PUT', '/contacts/' + friendshipId + '/accept')
  .then((data) => {
    dispatch('CONTACT_REQUEST_ACCEPT', data)
  }, (err) => console.warn(err))
}

// export const contactCancel = ({ dispatch, state }, data) => {
// }

// kudos actions

export const loadBadges = ({ dispatch, state }) => {
  if (state.profile.badges) return
  connect.apiAsync('GET', '/badges')
  .then((res) => dispatch('SET_PROFILE_BADGES', res),
        (err) => console.warn('err loadBadges', err.responseText))
}
// relationship actions

export const loadRelationship = ({ dispatch, state }) => {
  if (state.profile.relationship) return
  connect.apiAsync('GET', '/relationship')
  .then((res) => dispatch('SET_PROFILE_RELATIONSHIP', res),
        (err) => console.warn('err loadRelationship', err.responseText))
}
// Degree actions

export const loadDegrees = ({ dispatch, state }) => {
  if (state.profile.degrees) return
  connect.apiAsync('GET', '/degrees')
  .then((res) => dispatch('SET_PROFILE_DEGREE', res),
        (err) => console.warn('err loadDegrees', err.responseText))
}
// add endorsements

export const addEndors = ({ dispatch, state }, data) => {
  return connect.apiAsync('POST', '/endorsements', data)
  .then((newData) => {
    if (data.type == 'workrecords') {
      dispatch('ADD_PROFILE_ENDORSMENT_EXP', newData)
    } else if (data.type == 'educationrecords') {
      dispatch('ADD_PROFILE_ENDORSMENT_EDU', newData)
    }
  }, (err) => console.warn(err))
}
