
var appConfig = require('webpack-config-loader!src/main.config.js')

console.info('fb id', appConfig.fbAppId)

window.fbAsyncInit = function() {
  FB.init({
    appId      : '398579093659420',
    xfbml      : true,
    version    : 'v2.6',
    status: true

  });
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
