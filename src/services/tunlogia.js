import moment from 'moment' // eslint-disable-line no-unused-vars
import connect from 'services/connect.js'

let config = require('webpack-config-loader!src/main.config.js').tunlogia

module.exports = {
  profileVisits (who, from, to) {
    return connect.apiAsync('POST', config.url + `/stats/profile/visits?startDate=${from}&endDate=${to}`, {
      profile: {
        id: who.id,
        uuid: who.uuid,
        slug: who.slug
      }
    })
      .then((res) => {
        let result = []
        let datesArray = []
        let differeceInDays = moment(to, 'YYYY MM DD').diff(moment(from, 'YYYY MM DD'), 'days')
        for (let i = 0; i < differeceInDays; i++) {
          datesArray.push(moment(from, 'YYYY MM DD').add(i, 'days').format('YYYY-MM-DD'))
        }
        datesArray.forEach((date) => {
          result.push({
            date: date,
            visits: res[date] || 0
          })
        })
        return result
      })
      .catch((err) => {
        console.error(err)
        let result = []
        let datesArray = []
        let differeceInDays = moment(to, 'YYYY MM DD').diff(moment(from, 'YYYY MM DD'), 'days')
        for (let i = 0; i < differeceInDays; i++) {
          datesArray.push(moment(from, 'YYYY MM DD').add(i, 'days').format('YYYY-MM-DD'))
        }
        datesArray.forEach((date) => {
          result.push({
            date: date,
            visits: 0
          })
        })
        return result
      })
  },
  joboffersVisits (from, to) {
    return connect.apiAsyncWithHeaders('GET', '/dashboard/joboffers?fields=[id]', {
      limit: 1,
      state: ['pushed', 'concluded', 'aborted']
    })
      .then((res) => { // Ajax request object, jqXHR, have the method request.getResponseHeader('xxx')
        if (!res.request) return Promise.reject('Error occured')
        let totalNumberOfJoboffers = res.request.getResponseHeader('total')
        if (!totalNumberOfJoboffers) return Promise.reject('Total is not returned')
        return connect.apiAsync('GET', '/dashboard/joboffers?fields=[id,uuid,slug]', {
          limit: totalNumberOfJoboffers,
          state: ['pushed', 'concluded', 'aborted']
        })
      })
      .catch((err) => {
        console.error(err)
        Promise.reject(err)
      })
      .then((res) => {
        let joboffersToQuery = []
        if (!res.length) return joboffersToQuery
        res.forEach((item) => {
          if (item.slug) joboffersToQuery.push(item.slug)
        })
        return connect.apiAsync('POST', config.url + `/stats/joboffer/visits?startDate=${from}&endDate=${to}`, {
          joboffers: joboffersToQuery
        })
      })
      .catch((err) => {
        console.error(err)
        let result = []
        let datesArray = []
        let differeceInDays = moment(to, 'YYYY MM DD').diff(moment(from, 'YYYY MM DD'), 'days')
        for (let i = 0; i < differeceInDays; i++) {
          datesArray.push(moment(from, 'YYYY MM DD').add(i, 'days').format('YYYY-MM-DD'))
        }
        datesArray.forEach((date) => {
          result.push({
            date: date,
            visits: 0
          })
        })
        return result
      })
      .then((res) => {
        let result = []
        let datesArray = []
        let differeceInDays = moment(to, 'YYYY MM DD').diff(moment(from, 'YYYY MM DD'), 'days')
        for (let i = 0; i < differeceInDays; i++) {
          datesArray.push(moment(from, 'YYYY MM DD').add(i, 'days').format('YYYY-MM-DD'))
        }
        datesArray.forEach((date) => {
          result.push({
            date: date,
            visits: res[date] ? res[date] : 0
          })
        })
        return result
      })
      .catch((err) => {
        console.error(err)
        let result = []
        let datesArray = []
        let differeceInDays = moment(to, 'YYYY MM DD').diff(moment(from, 'YYYY MM DD'), 'days')
        for (let i = 0; i < differeceInDays; i++) {
          datesArray.push(moment(from, 'YYYY MM DD').add(i, 'days').format('YYYY-MM-DD'))
        }
        datesArray.forEach((date) => {
          result.push({
            date: date,
            visits: 0
          })
        })
      })
  },
  joboffersPodium (from, to) {
    return connect.apiAsyncWithHeaders('GET', '/dashboard/joboffers?fields=[id]', {
      limit: 1,
      state: ['pushed']
    })
    .then((res) => { // Ajax request object, jqXHR, have the method request.getResponseHeader('xxx')
      if (!res.request) return Promise.reject('Error occured')
      let totalNumberOfJoboffers = res.request.getResponseHeader('total')
      if (!totalNumberOfJoboffers) return Promise.reject('Total is not returned')
      return connect.apiAsync('GET', '/dashboard/joboffers?fields=[id,uuid,slug]', {
        limit: totalNumberOfJoboffers,
        state: ['pushed']
      })
    })
    .catch((err) => {
      console.error(err)
      Promise.reject(err)
    })
    .then((res) => {
      let joboffersToQuery = []
      if (!res.length) return joboffersToQuery
      res.forEach((item) => {
        if (item.slug) joboffersToQuery.push(item.slug)
      })
      return connect.apiAsync('POST', config.url + `/stats/joboffer/top?startDate=${from}&endDate=${to}`, {
        joboffers: joboffersToQuery
      })
    })
    .catch((err) => {
      console.error(err)
      Promise.reject(err)
    })
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.error(err)
      Promise.reject(err)
    })
  },
  notLoggedJoboffersPodium (from, to) {
    return connect.apiAsync('POST', config.url + `/stats/public/joboffer/top?startDate=${from}&endDate=${to}`, {
      joboffers: []
    })
      .then((res) => {
        return res
      })
      .catch((err) => {
        console.error(err)
        Promise.reject(err)
      })
  },
  trafficSources (from, to) {
    return connect.apiAsyncWithHeaders('GET', '/dashboard/joboffers?fields=[id]', {
      limit: 1,
      state: ['pushed', 'concluded', 'aborted']
    })
      .then((res) => { // Ajax request object, jqXHR, have the method request.getResponseHeader('xxx')
        if (!res.request) return Promise.reject('Error occured')
        let totalNumberOfJoboffers = res.request.getResponseHeader('total')
        if (!totalNumberOfJoboffers) return Promise.reject('Total is not returned')
        return connect.apiAsync('GET', '/dashboard/joboffers?fields=[id,uuid,slug]', {
          limit: totalNumberOfJoboffers,
          state: ['pushed', 'concluded', 'aborted']
        })
      })
      .catch((err) => {
        console.error(err)
        Promise.reject(err)
      })
      .then((res) => {
        let joboffersToQuery = []
        if (!res.length) return joboffersToQuery
        res.forEach((item) => {
          if (item.slug) joboffersToQuery.push(item.slug)
        })
        return connect.apiAsync('POST', config.url + `/stats/traffic/sources?startDate=${from}&endDate=${to}`, {
          joboffers: joboffersToQuery
        })
      })
      .catch((err) => {
        console.error(err)
        Promise.reject(err)
      })
      .then((res) => {
        return res
      })
      .catch((err) => {
        // console.error(err)
        Promise.reject(err)
      })
  },
  test () {
    return config.url
  }
}
