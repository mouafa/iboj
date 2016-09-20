<template><div id="fb-root"></div></template>

<script>
var bus = require('services/bus.js')

module.exports = {
  data () {
    return {
      autoResult: []
    }
  },
  ready () {
    bus.$on('joboffer:share', this.share)
  },
  destroyed () {
    bus.$off('joboffer:share')
  },
  methods: {
    share (joboffer) {
      let url = window.location.href + 'joboffer/' + joboffer.id
      let logo = 'https://ucarecdn.com/3c46a4cb-c899-4e7c-9513-0e642ae6899a/-/crop/266x266/0,0/-/preview/'
      let meta = {
        method: 'share',
        mobile_iframe: true,
        title: `${joboffer.title} at ${joboffer.company.name}`,
        href: url,
        picture: joboffer.company.logo || logo,
        caption: 'Talenthub.io | Millions of recruiters',
        description: joboffer.description
      }
      console.info('meta', meta)
      window.FB.ui(meta)
    }
  }
}

</script>
