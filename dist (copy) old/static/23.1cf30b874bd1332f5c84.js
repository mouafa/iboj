webpackJsonp([23],{82:function(t,e,n){var r=n(98);"string"==typeof r&&(r=[[t.id,r,""]]);n(16)(r,{});r.locals&&(t.exports=r.locals)},98:function(t,e,n){e=t.exports=n(15)(),e.push([t.id,".hpanel .panel-heading{color:inherit;font-weight:300;padding:10px 4px;transition:all .3s;border:1px solid transparent;background:#f7f9fa}.hpanel .panel-body{background:hsla(0,0%,100%,.8);border:1px solid #e4e5e7;border-top:1px solid #e4e5e7;border-radius:2px;padding:20px;transition:all .3s;position:relative;word-wrap:break-word}.hpanel .panel-body:hover{background:#fff;box-shadow:1px 2px 4px rgba(0,0,0,.1);transition:all .5s}.hpanel.hyellow .panel-body{border-top:2px solid #ffb606}.hpanel.hblue .panel-body{border-top:2px solid #06a2c4}",""])},125:function(t,e,n){"use strict";n(82);var r=n(4);t.exports={vuex:{getters:{anonym:function(t){var e=t.account;return"unauth"===e.loaded},accountId:function(t){var e=t.account;return e.data.id}}},props:{data:{type:Object,require:!0},preview:{type:Boolean,"default":!1},current:{type:Object,require:!0},companylisting:{type:Boolean,"default":!1}},data:function(){return{baseurl:window.location.href.substring(0,window.location.href.indexOf("/#"))}},components:{},computed:{commentCount:function(){return this.$refs.commentlist.comments.length||this.data.statistic.comments},isMine:function(){return this.data&&this.data.responsible?this.accountId==this.data.responsible.id:!1}},methods:{jobofferURL:function(t){return encodeURIComponent(window.location.href.replace(/\/*$/,"")+"/joboffer/"+t.slug)},twitterLink:function(t){var e="Visit JOBI today";return"https://twitter.com/intent/tweet?text="+e+"&url="+this.jobofferURL(t)},gPlusLink:function(t){return"https://plus.google.com/share?url="+this.jobofferURL(t)},linkedInLink:function(t){return"https://www.linkedin.com/cws/share?url="+this.jobofferURL(t)},tumblrLink:function(t){return"http://www.tumblr.com/share/link?url="+this.jobofferURL(t)},share:function(t){r.$emit("joboffer:share",t)}}}},129:function(t,e){},132:function(t,e){t.exports='<div class="hpanel m-none m-b-xs font-8" _v-1bf56112=""><div class=panel-heading v-if=preview _v-1bf56112=""><div class=m-l-md _v-1bf56112=""><i class="fa fa-lightbulb-o" _v-1bf56112=""></i> <span class=capital v-ii18n=preview _v-1bf56112="">preview</span></div></div><div class="panel-body m-none p-none font-light" _v-1bf56112=""><section class=p-sm _v-1bf56112=""><div v-if=!preview class=pull-right _v-1bf56112=""><div class="panel-tools font-1-2" _v-1bf56112=""><a v-link="{name: \'joboffer\', params: { jobId: data.slug || data.uuid }}" class="hand text-grey" _v-1bf56112=""><span class="capital middle" v-ii18n=detailLbl _v-1bf56112="">View Details <i class=material-icons _v-1bf56112=""></i></span></a></div></div><div v-if=!companylisting class="fx-row fx-start-center" _v-1bf56112=""><img :src="data.company ? data.company.logo : \'\'" alt=logo class="img-rounded border size-48 hand" _v-1bf56112=""><div class="job-title m-l-sm break-word" flex="" _v-1bf56112=""><a href="/company/{{data.company.slug || data.company.uuid}}" class="m-none p-none" _v-1bf56112=""><h4 class="font-1-2 p-none capital m-none hand text-info hand font-light m-b-md" v-if=data.company _v-1bf56112="">{{data.company.name || data.company}}</h4></a><h4 class="capital m-none p-none m-t-n-sm font-1-2" _v-1bf56112="">{{data.title}}</h4></div></div><div v-else="" _v-1bf56112=""><div _v-1bf56112=""><i class="fa fa-clock-o m-r-xs" _v-1bf56112=""></i><span v-from-now=data.release_date _v-1bf56112=""></span></div><div _v-1bf56112=""><h4 class="capital m-none font-light font-1-5" _v-1bf56112="">{{data.title}}</h4></div></div><div class=body-container _v-1bf56112=""><p class="font-light font-1-2" _v-1bf56112="">{{{data.description | lineBreak}}}</p><div class=fx-row _v-1bf56112=""><span class="font-light border p-xxs m-xxs font-1-2" track-by=$index v-for="item in data.tags" _v-1bf56112="">{{item.name || item}}</span></div></div></section><div class=border-top _v-1bf56112=""><div class="m-l-md fx-row fx-start-center" _v-1bf56112=""><section class="fx-row fx-start-center" flex="" _v-1bf56112=""><div class=p-r-sm _v-1bf56112=""><img :src="data.responsible &amp;&amp; data.responsible.img ? data.responsible.img : \'\'" class="user-image circle responsive-img size-32 m-t-sm m-b-sm hand" _v-1bf56112=""></div><div _v-1bf56112=""><div v-if=data.responsible class=hand _v-1bf56112="">{{data.responsible.firstname}} {{data.responsible.lastname}}</div><div v-if=!companylisting _v-1bf56112=""><i class="material-icons md-14 orange600" _v-1bf56112=""></i><span v-from-now=data.release_date _v-1bf56112=""></span></div></div></section><div flex="" _v-1bf56112=""><div class="font-uppercase font-light" _v-1bf56112=""><i class="material-icons md-14 orange600" _v-1bf56112=""></i> <span _v-1bf56112="">{{data.location.name}}</span></div></div><div flex="" _v-1bf56112=""><div class="font-uppercase font-light" _v-1bf56112=""><i class="material-icons md-14 orange600" _v-1bf56112=""></i> <span _v-1bf56112="">{{data.job_type}}</span></div></div><div flex="" _v-1bf56112=""><div class="font-uppercase font-light fx-col" v-if="data.salary_min || data.salary_max" _v-1bf56112=""><span _v-1bf56112="">{{data.salary_min | currency}} - {{data.salary_max | currency}}</span> <span _v-1bf56112="">{{salary_type}}</span></div></div></div></div><div class="border-top text-left bg-light m-none p-none" _v-1bf56112=""><div v-if=!preview class=row _v-1bf56112=""><div v-if="!isMine &amp;&amp; !data.apply &amp;&amp; !anonym" class="m-none p-none right p-t-sm p-r-sm" _v-1bf56112=""><div class=p-t-xs _v-1bf56112=""><div title="you already applied for this job offer" id=applied-preview-{{data.id}} class="font-light font-9 m-l-xs p-r-sm uppercase cursor" _v-1bf56112=""><i class=material-icons _v-1bf56112=""></i></div></div></div></div><div class=clearfix _v-1bf56112=""></div></div></div></div>'},134:function(t,e,n){var r,i;n(129),r=n(125),i=n(132),t.exports=r||{},t.exports.__esModule&&(t.exports=t.exports["default"]),i&&(("function"==typeof t.exports?t.exports.options||(t.exports.options={}):t.exports).template=i)},168:function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0}),e.unloadCompany=e.loadCompanyJoboffers=e.loadCompany=void 0;var i=n(6),o=r(i),a=n(1),s=r(a);e.loadCompany=function(t,e){var n=t.dispatch;return new o["default"](function(t,r){var i=e?"/"+e:"/";s["default"].apiAsync("GET","/companies"+i).then(function(e){n("SET_COMPANY_DATA",e),t(e)})["catch"](function(t){return r(t.responseText)}),!i})},e.loadCompanyJoboffers=function(t){var e=t.dispatch,n=arguments.length<=1||void 0===arguments[1]?1:arguments[1];return new o["default"](function(t,r){var i=n;s["default"].apiAsync("GET",'/joboffers/search?filter={"company":'+i+', "limit": 3}').then(function(n){e("SET_COMPANY_JOBOFFERS",n),t(n)})["catch"](function(t){return r(t.responseText)})})},e.unloadCompany=function(t){var e=t.dispatch;e("UNLOAD_COMPANY")}},191:function(t,e){"use strict";function n(t){var e=t.company;return e.loaded}function r(t){var e=t.company;return e}function i(t){var e=t.company;return e.data}function o(t){var e=t.company;return e.joboffers}Object.defineProperty(e,"__esModule",{value:!0}),e.isReady=n,e.getCompany=r,e.companyData=i,e.companyJoboffers=o},406:function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}var i=n(134),o=r(i),a=n(168),s=n(191);t.exports={vuex:{actions:{loadCompany:a.loadCompany,loadCompanyJoboffers:a.loadCompanyJoboffers,unloadCompany:a.unloadCompany},getters:{loaded:s.isReady,data:s.companyData,joboffers:s.companyJoboffers}},components:{joboffer:o["default"]},route:{data:function(t){var e=this,n=t.to,r=this,i=n.params.id;this.loaded!=i&&(this.unloadCompany(),this.loadCompany(i).then(function(t){e.loadCompanyJoboffers(t.id).then(function(){})})["catch"](function(){return r.$router.go("/404")}))}}}},574:function(t,e){t.exports='<div v-show=loaded class=row transition=fade-in><div class="m-none p-none col m5"><div class=m-l-xs><div class="hpanel profile-panel" id=custom-1><div class="panel-body m-none p-none"><div class="panel-heading fx-row fx-space-between-center"><div class=m-l-md></div></div><section class=p-sm><div class="fx-row p-b-sm fx-start-start"><div class=m-r-sm><img :src=data.logo class="img-circle size-64" alt=logo></div><div flex><span class="font-light font-1-5 text-light font-uppercase">{{data.name}}</span><div class="font-8 m-t-xs"><a href={{data.url}} target=_blank>{{data.url}}</a></div></div></div><div class="fx-row p-b-sm fx-start-start" v-if="data.country || data.address || data.city || data.region || data.phone"><span v-if="data.country || data.address || data.city || data.region"><i class="fa fa-home m-xxs"></i> <span class="m-r-xs capital" v-if=data.address>{{data.address}},</span> <span class="m-r-xs capital" v-if=data.city>{{data.city}},</span> <span class="m-r-xs capital" v-if=data.zipcode>{{data.zipcode}},</span> <span class="m-r-xs capital" v-if=data.region>{{data.region}},</span> <span class="m-r-xs capital" v-if=data.country>{{data.country}}.</span></span> <span v-if=data.phone><i class="fa fa-phone m-xxs"></i> <span class="m-r-xs capital">{{data.phone}}</span></span></div><div class="font-9 font-light word-wrapper">{{{data.description}}}</div></section></div></div></div></div><div class="profile-details col m7 p-none m-none p-b-lg"><div class="p-none p-r-xs hpanel p-b-lg"><joboffer v-if=joboffers.length class=m-b-sm v-for="item in joboffers" :data=item :current=profile></joboffer><div v-if=!joboffers.length class="panel-body p-sm capital">no available jobs offers.</div></div></div></div>'},643:function(t,e,n){var r,i;r=n(406),i=n(574),t.exports=r||{},t.exports.__esModule&&(t.exports=t.exports["default"]),i&&(("function"==typeof t.exports?t.exports.options||(t.exports.options={}):t.exports).template=i)}});