export function isReady (state) {
  return state.filter.loaded
}

export function filterResult ({filter}) {
  return filter.result
}

export function filterTotal ({filter}) {
  return filter.total
}

export function filterMaxPage ({filter}) {
  return filter.maxPage
}

export function filterPage ({filter}) {
  return filter.page
}

export function filterLimit ({filter}) {
  return filter.limit
}

export function filterCategory ({filter}) {
  if (!filter.facets || !filter.facets['category.name.full']) return []
  return filter.facets['category.name.full'].map(i => ({ name: i.key, count: i.doc_count, value: i.key }))
}

export function filterCompany ({filter}) {
  if (!filter.facets || !filter.facets['company.name.full']) return []
  return filter.facets['company.name.full'].map(i => ({ name: i.key, count: i.doc_count, value: i.key }))
}

export function filterJobtype ({filter}) {
  if (!filter.facets || !filter.facets['job_type.full']) return []
  return filter.facets['job_type.full'].map(i => ({ name: i.key, count: i.doc_count, value: i.key }))
}

export function filterExperience ({filter}) {
  if (!filter.facets || !filter.facets['experience']) return []
  return filter.facets['experience'].map(i => ({ name: experience[i.key], count: i.doc_count, value: i.key }))
}

export function filterSalary ({filter}) {
  if (!filter.facets) return null
  // console.info(filter['salary_min'])
  return { min: filter.facets['salary_min'].value, max: filter.facets['salary_max'].value }
}

/** intern **/

const experience = {
  1: 'junior',
  2: 'senior',
  3: 'director'
}
