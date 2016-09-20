export function isMine (state) {
  if (state.account.data.id && state.profile.data.id) {
    return state.account.data.id == state.profile.data.id
  }
  return false
}

export function isReady (state) {
  return state.profile.loaded
}

export function profileData (state) {
  return state.profile.data
}

export function profileAbout (state) {
  return state.profile.data.about
}

// experience getters
export function hasProfileExps (state) {
  return state.profile.data.experience ? !!state.profile.data.experience.length : false
}

export function profileExps (state) {
  return state.profile.data.experience
}

export function getActiveExp (state) {
  return state.profile.activeExpData
}

// education getters
export function hasprofileEdus (state) {
  return state.profile.data.education ? !!state.profile.data.education.length : false
}

export function profileEdus (state) {
  return state.profile.data.education
}

export function getActiveEdu (state) {
  return state.profile.activeEduData
}

// custom section getters
export function customSecs (state) {
  return state.profile.data.customsectionscategories
}

export function getActiveSec (state) {
  return state.profile.activeSecData
}

// contacts getters
export function profileContact (state) {
  return state.profile.contacts
}

export function profileFriendship (state) {
  return state.profile.data.about.friendship
}

// badges

export function profileBadges (state) {
  return state.profile.badges
}
// Relationship
export function profileRelationship (state) {
  return state.profile.relationship
}
// degrees
export function profileDegrees (state) {
  return state.profile.degrees
}
