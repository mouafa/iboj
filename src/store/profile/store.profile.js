const init = {
  data: {
    about: {
      about: '',
      firstname: '',
      lastname: '',
      fullname: '',
      title: '',
      img: '',
      cv: [],
      friendship: null,
      friendshipId: null
    },
    id: null,
    friend: null,
    education: null,
    experience: null,
    sections: null,
    customsectionscategories: null
  },
  contacts: null,
  loaded: false,
  activeExpData: null,
  activeEduData: null,
  activeSecData: null,
  badges: null,
  relationship: null,
  degrees: null
}
// initial state
const state = Object.assign({}, init)

// mutations
const mutations = {
  'SET_PROFILE_DATA' (state, res) {
    state.loaded = res.id
    let _about = {
      about: res.about,
      firstname: res.firstname,
      lastname: res.lastname,
      fullname: fullname(res.firstname, res.lastname),
      title: res.title,
      img: res.img,
      friendship: res.friendship,
      friendshipId: res.friendship_id,
      cv: res.cv ? res.cv : []
    }
    let _data = {
      id: res.id,
      friend: res.friend,
      about: _about,
      education: res.education,
      experience: res.experience,
      sections: res.sections,
      customsectionscategories: res.customsectionscategories
    }
    state.data = _data
    // console.log('res', state.loaded)
  },
  'FLUSH_PROFILE_DATA' (state, res) {
    Object.assign(state, init)
  },
  'UNLOAD_PROFILE' (state) {
    state.loaded = false
  },
  'SET_PROFILE_CONTACT' (state, data) {
    state.contacts = data
  },
  'SET_PROFILE_IMG' (state, value) {
    state.data.about.img = value
  },
  'SET_PROFILE_ABOUT' (state, value) {
    Object.assign(state.data.about, value)
    state.data.about.fullname = fullname(state.data.about.firstname, state.data.about.lastname)
  },
  'SET_PROFILE_CV' (state, value) {
    state.data.about.cv = value
  },
  'ADD_PROFILE_CV' (state, data) {
    state.data.about.cv.push(data)
  },
  'DELETE_PROFILE_CV' (state, data) {
    state.data.about.cv.$remove(data)
  },

  // experience mutations
  'SET_EXPERIENCE_IMG' (state, value, id) {
    state.data.experience = state.data.experience.map(function (item) {
      if (item.id == id) item.img = value
      return item
    })
  },
  'SET_ACTIVE_EXPERIENCE' (state, data) {
    state.activeExpData = data
  },
  'EDIT_ACTIVE_EXPERIENCE' (state, data) {
    Object.assign(state.activeExpData, data)
  },
  'CANCEL_ACTIVE_EXPERIENCE' (state) {
    state.activeExpData = null
  },
  'DELETE_ACTIVE_EXPERIENCE' (state) {
    state.data.experience.$remove(state.activeExpData)
    state.activeExpData = null
  },
  'ADD_PROFILE_EXPERIENCE' (state, data) {
    state.data.experience.push(data)
  },

  // education mutations
  'SET_EDUCATION_IMG' (state, value, id) {
    state.data.education = state.data.education.map(function (item) {
      if (item.id == id) item.img = value
      return item
    })
  },
  'SET_ACTIVE_EDUCATION' (state, data) {
    state.activeEduData = data
  },
  'EDIT_ACTIVE_EDUCATION' (state, data) {
    Object.assign(state.activeEduData, data)
  },
  'CANCEL_ACTIVE_EDUCATION' (state) {
    state.activeEduData = null
  },
  'DELETE_ACTIVE_EDUCATION' (state) {
    state.data.education.$remove(state.activeEduData)
    state.activeEduData = null
  },
  'ADD_PROFILE_EDUCATION' (state, data) {
    state.data.education.push(data)
  },

  // custom section mutations
  'SET_ACTIVE_SECTION' (state, data) {
    state.activeSecData = data
  },
  'EDIT_ACTIVE_SECTION' (state, data, id) {
    if (id) {
      var elment = state.activeSecData.customsections.filter((i) => i.id == id)[0]
      data = Object.assign(elment, data)
    } else Object.assign(state.activeSecData, data)
  },
  'ADD_TO_ACTIVE_SECTION' (state, data) {
    state.activeSecData.customsections.push(data)
  },
  'CANCEL_ACTIVE_SECTION' (state) {
    state.activeSecData = null
  },
  'DELETE_ACTIVE_SECTION' (state) {
    state.data.customsectionscategories.$remove(state.activeSecData)
    state.activeSecData = null
  },
  'DELETE_FROM_ACTIVE_SECTION' (state, id) {
    var elment = state.activeSecData.customsections.filter((i) => i.id == id)[0]
    state.activeSecData.customsections.$remove(elment)
    state.activeSecData = null
  },
  'ADD_PROFILE_SECTION' (state, data) {
    data.customsections = []
    state.data.customsectionscategories.push(data)
  },

  // contact mutuations
  'CONTACT_REQUEST_SENT' (state, data) {
    state.data.about.friendship = data.state
    state.data.about.friendshipId = data.id
  },
  'CONTACT_REQUEST_REMOVE' (state, data) {
    state.data.about.friendship = null
    state.data.about.friendshipId = null
  },
  'CONTACT_REQUEST_ACCEPT' (state, data) {
    state.data.about.friendship = data.state
    state.data.about.friendshipId = data.id
  },

  // badges

  'SET_PROFILE_BADGES' (state, data) {
    state.badges = data
  },
  // relationship
  'SET_PROFILE_RELATIONSHIP' (state, data) {
    state.relationship = data
  },
  // endorsements
  'ADD_PROFILE_ENDORSMENT_EXP' (state, data) {
    state.activeExpData.endorsements.push(data)
  },
  'ADD_PROFILE_ENDORSMENT_EDU' (state, data) {
    state.activeEduData.endorsements.push(data)
  },
  'SET_PROFILE_DEGREE' (state, data) {
    state.degrees = data
  }

}

export default {
  state,
  mutations
}

function fullname (firstname, lastname) {
  return `${firstname}  ${lastname}`
}
