// module.exports = function bookmark () {
//   var url = window.location.href
//   if (window.sidebar && window.sidebar.addPanel) { // Mozilla Firefox Bookmark
//     window.sidebar.addPanel(document.title, url, '')
//   } else if (window.external && ('AddFavorite' in window.external)) { // IE Favorite
//     window.external.AddFavorite(url, document.title)
//   } else if (window.opera && window.print) { // Opera Hotlist
//     this.title = document.title
//     return true
//   } else { // webkit - safari/chrome
//     window.alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.')
//   }
// }
