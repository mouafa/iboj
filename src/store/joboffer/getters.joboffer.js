export function isReady (state) {
  return state.joboffer.loaded
}

export function isMine (state) {
  if (!state.joboffer.loaded || !state.account.loaded || state.account.loaded == 'unauth') return false
  if (state.joboffer.data.responsible.id == state.account.data.id) return true
  else if (state.joboffer.data.collaborators) {
    return !!state.joboffer.data.collaborators.find((c) => c.profile_id == state.account.data.id)
  } else return false
}

export function getJoboffer (state) {
  return state.joboffer
}

export function getJobofferData ({joboffer}) {
  return joboffer.data
}

export function getRecommendedIds ({joboffer}) {
  if (!joboffer.data.statistic) return []
  return joboffer.data.statistic.recommendations.list.map((i) => i.split(':')[2])
}

export function getRecommendationList ({joboffer}) {
  let statistic = joboffer.data.statistic
  if (!statistic) return []
  return statistic.recommendations.list.map((i) => {
    let ids = i.split(':')
    let rec = {recommenderId: Number(ids[1]), recommendedId: Number(ids[2]), recommendationId: Number(ids[3])}
    if (statistic.recpending.list.indexOf(i) > -1) {
      rec.status = 'pending'
    } else if (statistic.recpushed.list.indexOf(i) > -1) {
      rec.status = 'new'
    }
    return rec
  })
}
export function getApplicationList (state) {
  return state.joboffer.applicationList
}
export function numberOfApplication (state) {
  return state.joboffer.numberOfApplication
}
export function getAppliedIds ({joboffer}) {
  if (!joboffer.data.applications) return []
  return joboffer.data.applications.map((i) => i.recommended)
}

export function jobofferCategories (state) {
  return state.joboffer.jobofferCategories
}

export function jobofferTypes (state) {
  return state.joboffer.jobofferTypes
}

export function jobofferSalaryTypes (state) {
  return state.joboffer.salaryTypes
}

export function yearsOfExperience (state) {
  return state.joboffer.yearsOfExperience
}

export function jobofferdegrees (state) {
  return state.joboffer.degrees
}

export function referrer (state) {
  return state.joboffer.referrer
}
