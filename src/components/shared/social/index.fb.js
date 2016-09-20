var appConfig = require('webpack-config-loader!src/main.config.js')

module.exports = function () {
  setTimeout(function () {
    window.fbAsyncInit = function () {
      FB.init({
        appId: appConfig.fbAppId,
        xfbml: true,
        version: 'v2.6'
      })
    }
    // $script('//connect.facebook.net/en_US/sdk.js')

    ;(function (d, s, id) {
      var js
      var fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) return
      js = d.createElement(s)
      js.id = id
      js.src = '//connect.facebook.net/en_US/sdk.js'
      fjs.parentNode.insertBefore(js, fjs)
    }(document, 'script', 'facebook-jssdk'))

    if (window.FB) FB.XFBML.parse()
  }, 100)
}
