import connect from 'services/connect'

export const loadCompany = ({ dispatch }, id) => {
  return new Promise((resolve, reject) => {
    let _id = id ? '/' + id : '/'
    connect.apiAsync('GET', '/companies' + _id)
      .then((res) => {
        dispatch('SET_COMPANY_DATA', res)
        resolve(res)
      })
      .catch((err) => reject(err.responseText))

    if (!_id) return
  })
}

export const updateCompanyImg = ({ dispatch }, logo, id) => {
    return connect.apiAsync('PUT', '/companies/' + id, {'logo': logo})
    .then((data) => {
      dispatch('SET_COMPANY_IMG', data.logo)
    }, (err) => console.warn(err))
}

export const loadCompanyJoboffers = ({ dispatch }, id = 1) => {
  return new Promise((resolve, reject) => {
    let _id = id
    connect.apiAsync('GET', '/joboffers/search?filter={"company":' + _id + ', "limit": 1000}')
      .then((res) => {
        console.log(res)
        dispatch('SET_COMPANY_JOBOFFERS', res)
        resolve(res)
      })
      .catch((err) => reject(err.responseText))
  })
}

export const unloadCompany = ({ dispatch }) => {
  dispatch('UNLOAD_COMPANY')
}
