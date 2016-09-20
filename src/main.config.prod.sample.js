module.exports = {
  development: {
    toasterUrl: 'http://toaster-jobi.dev',
    apiBaseUrl: 'http://api-jobi.dev',
    fbAppId: '398579093659420',
    version: '0.2.2',
    algolia: {
      appId: 'UTR32CPGMX',
      apiKey: '573edd54ea354567ade4b487c6584dba'
    },
    tungolia: {
      url: 'http://tungolia-jobi.dev'
    },
    tunlogia: {
      url: 'http://tunlogia-jobi.dev'
    },
    messenger: {
      url: 'development/',
      apiKey: 'AIzaSyA9QkPMXFnHnOlHPl5CcnxNUw7h-xiPvas',
      authDomain: 'tunijobs-chat.firebaseapp.com',
      databaseURL: 'https://tunijobs-chat.firebaseio.com',
      storageBucket: 'tunijobs-chat.appspot.com'
    }
  },
  local: {
    toasterUrl: 'http://192.168.1.15:5015',
    apiBaseUrl: 'http://192.168.1.15:1337',
    fbAppId: '392343857616277',
    version: '0.2.1',
    algolia: {
      appId: 'UTR32CPGMX',
      apiKey: '573edd54ea354567ade4b487c6584dba'
    },
    tungolia: {
      url: 'http://192.168.1.15:8080'
    },
    tunlogia: {
      url: 'http://tunlogia.jobi.tn'
    },
    messenger: {
      url: 'development/',
      apiKey: 'AIzaSyA9QkPMXFnHnOlHPl5CcnxNUw7h-xiPvas',
      authDomain: 'tunijobs-chat.firebaseapp.com',
      databaseURL: 'https://tunijobs-chat.firebaseio.com',
      storageBucket: 'tunijobs-chat.appspot.com'
    }
  },
  production: {
    toasterUrl: 'http://toaster.jobi.tn',
    apiBaseUrl: 'http://api.jobi.tn',
    fbAppId: '392343857616277',
    version: '0.2.1',
    algolia: {
      appId: 'ZNMJTKR2DV',
      apiKey: '17de757de03b1d2762f2853389caa6eb'
    },
    tungolia: {
      url: 'http://tungolia.jobi.tn'
    },
    tunlogia: {
      url: 'http://tunlogia.jobi.tn'
    },
    messenger: {
      url: 'production/',
      apiKey: 'AIzaSyA9QkPMXFnHnOlHPl5CcnxNUw7h-xiPvas',
      authDomain: 'tunijobs-chat.firebaseapp.com',
      databaseURL: 'https://tunijobs-chat.firebaseio.com',
      storageBucket: 'tunijobs-chat.appspot.com'
    }
  }
}
