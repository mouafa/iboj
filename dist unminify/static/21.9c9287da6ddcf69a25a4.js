webpackJsonp([21],{

/***/ 2:
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if (media) {
			styleElement.setAttribute("media", media);
		}

		if (sourceMap) {
			// https://developer.chrome.com/devtools/docs/javascript-debugging
			// this makes source maps inside style tags work properly in Chrome
			css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */';
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}


/***/ },

/***/ 109:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*doc\n---\ntitle: Colors\nname: colors\ncategory: Base CSS\n---\n\nColors: to be able to use the predefined colors, You need to import common/less/colors.less\n\n```html_example\n<style>\n@import \"../src/components/common/less/colors.less\"\n</style>\n<div class=\"size-32\" style=\"background-color: @color-navy-blue\">Click</div>\n```\n*/\n/* Mixin */\n/* Panels */\n.hpanel .panel-heading {\n  color: inherit;\n  font-weight: 300;\n  padding: 10px 4px;\n  transition: all .3s;\n  border: 1px solid transparent;\n  background: #f7f9fa;\n}\n.hpanel .panel-body {\n  background: rgba(255, 255, 255, 0.8);\n  border: 1px solid #e4e5e7;\n  border-top: 1px solid #e4e5e7;\n  border-radius: 2px;\n  padding: 20px;\n  transition: all .3s;\n  position: relative;\n  word-wrap: break-word;\n}\n.hpanel .panel-body:hover {\n  background: #ffffff;\n  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.1);\n  transition: all .5s;\n}\n.hpanel.hyellow .panel-body {\n  border-top: 2px solid #ffb606;\n}\n.hpanel.hblue .panel-body {\n  border-top: 2px solid #06a2c4;\n}\n", ""]);

	// exports


/***/ },

/***/ 110:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(109);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(21)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/less-loader/index.js!./panel.less", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/less-loader/index.js!./panel.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 140:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(110);
	var bus = __webpack_require__(6);

	module.exports = {
	  vuex: {
	    getters: {
	      anonym: function anonym(_ref) {
	        var account = _ref.account;
	        return account.loaded === 'unauth';
	      },
	      accountId: function accountId(_ref2) {
	        var account = _ref2.account;
	        return account.data.id;
	      }
	    }
	  },
	  props: {
	    data: {
	      type: Object,
	      require: true
	    },
	    preview: {
	      type: Boolean,
	      default: false
	    },
	    current: {
	      type: Object,
	      require: true
	    },
	    companylisting: {
	      type: Boolean,
	      default: false
	    }
	  },
	  data: function data() {
	    return {
	      baseurl: window.location.href.substring(0, window.location.href.indexOf('/#'))
	    };
	  },

	  components: {},
	  computed: {
	    commentCount: function commentCount() {
	      return this.$refs.commentlist.comments.length || this.data.statistic.comments;
	    },
	    isMine: function isMine() {
	      if (!this.data || !this.data.responsible) return false;
	      return this.accountId == this.data.responsible.id;
	    }
	  },
	  methods: {
	    jobofferURL: function jobofferURL(joboffer) {
	      return encodeURIComponent(window.location.href.replace(/\/*$/, '') + '/joboffer/' + joboffer.slug);
	    },
	    twitterLink: function twitterLink(joboffer) {
	      var dictum = 'Visit JOBI today';
	      return 'https://twitter.com/intent/tweet?text=' + dictum + '&url=' + this.jobofferURL(joboffer);
	    },
	    gPlusLink: function gPlusLink(joboffer) {
	      return 'https://plus.google.com/share?url=' + this.jobofferURL(joboffer);
	    },
	    linkedInLink: function linkedInLink(joboffer) {
	      return 'https://www.linkedin.com/cws/share?url=' + this.jobofferURL(joboffer);
	    },
	    tumblrLink: function tumblrLink(joboffer) {
	      return 'http://www.tumblr.com/share/link?url=' + this.jobofferURL(joboffer);
	    },
	    share: function share(joboffer) {
	      bus.$emit('joboffer:share', joboffer);
	    }
	  }
	};

/***/ },

/***/ 145:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".job-title[_v-1bf56112]:hover {\n  font-weight: bold;\n}\n.body-container[_v-1bf56112] {\n  max-height: 350px;\n  overflow-y: auto;\n}\n", ""]);

	// exports


/***/ },

/***/ 146:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(145);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-1bf56112&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./joboffer-preview.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-1bf56112&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./joboffer-preview.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 151:
/***/ function(module, exports) {

	module.exports = "\n <div class=\"hpanel m-none m-b-xs font-8\" _v-1bf56112=\"\">\n   <div class=\"panel-heading\" v-if=\"preview\" _v-1bf56112=\"\">\n     <div class=\"m-l-md\" _v-1bf56112=\"\">\n       <i class=\"fa fa-lightbulb-o\" _v-1bf56112=\"\"></i>\n       <span class=\"capital\" v-ii18n=\"preview\" _v-1bf56112=\"\">preview</span>\n     </div>\n   </div>\n\n   <div class=\"panel-body m-none p-none font-light \" _v-1bf56112=\"\">\n     <section class=\"p-sm\" _v-1bf56112=\"\">\n       <div v-if=\"!preview\" class=\"pull-right\" _v-1bf56112=\"\">\n         <div class=\"panel-tools font-1-2\" _v-1bf56112=\"\">\n           <!-- Reward <span class=\"text-success \">${{data.incentive}}</span> -->\n           <!-- v-link=\"{name: 'joboffer', params: { jobId: data.id }}\" -->\n             <!-- <i class=\"fa fa-th\"></i> -->\n             <a href=\"/joboffer/{{data.slug || data.uuid}}\" class=\"hand text-grey\" _v-1bf56112=\"\">\n                <span class=\"capital middle\" v-ii18n=\"detailLbl\" _v-1bf56112=\"\">View Details <i class=\"material-icons \" _v-1bf56112=\"\"></i></span>\n             </a>\n         </div>\n       </div>\n\n       <div v-if=\"!companylisting\" class=\"fx-row fx-start-center\" _v-1bf56112=\"\">\n         <img :src=\"data.company ? data.company.logo : ''\" alt=\"logo\" class=\"img-rounded border size-48 hand\" _v-1bf56112=\"\">\n         <div class=\"job-title m-l-sm break-word\" flex=\"\" _v-1bf56112=\"\">\n           <a href=\"/company/{{data.company.slug || data.company.uuid}}\" class=\"m-none p-none\" _v-1bf56112=\"\"><h4 class=\"font-1-2 p-none capital m-none hand text-info hand font-light m-b-md\" v-if=\"data.company\" _v-1bf56112=\"\">{{data.company.name || data.company}}</h4></a>\n           <h4 class=\"capital m-none p-none m-t-n-sm font-1-2\" _v-1bf56112=\"\">\n              {{data.title}}\n           </h4>\n         </div>\n       </div>\n       <div v-else=\"\" class=\" \" _v-1bf56112=\"\">\n         <div _v-1bf56112=\"\"><i class=\"fa fa-clock-o m-r-xs\" _v-1bf56112=\"\"></i><span v-from-now=\"data.release_date\" _v-1bf56112=\"\"></span></div>\n         <div _v-1bf56112=\"\">\n           <h4 class=\"capital m-none font-light font-1-5\" _v-1bf56112=\"\">\n             {{data.title}}\n           </h4>\n         </div>\n       </div>\n\n\n       <div class=\"body-container\" _v-1bf56112=\"\">\n         <label class=\"border-bottom font-light font-1-5\" _v-1bf56112=\"\">\n           <span class=\"capital __active\" _v-1bf56112=\"\">summary</span>\n         </label>\n         <div class=\"font-light font-1-2\" _v-1bf56112=\"\">\n           {{{data.summary}}}\n         </div>\n<!--            <label class=\"border-bottom font-light font-1-5\">\n           <span class=\"capital __active\">description</span>\n         </label>\n         <div class=\"font-light font-1-2 joboffer-preview-html-data\">\n           {{{data.description}}}\n         </div>\n\n         <label class=\"border-bottom font-light font-1-5\" v-if=\"data.expectations && data.expectations.length > 0\">\n           <span class=\"capital __active\" v-ii18n=\"requirements\">requirements</span>\n         </label>\n         <div class=\"font-light font-1-2 joboffer-preview-html-data\" v-if=\"data.expectations && data.expectations.length > 0\">\n           {{{data.expectations}}}\n         </div>\n         \n         <label class=\"border-bottom font-light font-1-5\" v-if=\"data.benefits && data.benefits.length > 0\">\n           <span class=\"capital __active\" v-ii18n=\"benefits\">benefits</span>\n         </label>\n         <div class=\"font-light font-1-2 joboffer-preview-html-data\" v-if=\"data.benefits && data.benefits.length > 0\">\n           {{{data.benefits}}}\n         </div> -->\n         <!-- <p class=\"font-light font-1-2\">{{{data.description | lineBreak}}}</p> -->\n         <div class=\"fx-row\" _v-1bf56112=\"\">\n           <span class=\" font-light border p-xxs m-xxs font-1-2\" track-by=\"$index\" v-for=\"item in data.tags\" _v-1bf56112=\"\">\n             {{item.name || item}}</span>\n         </div>\n\n       </div>\n     </section>\n     <div class=\"border-top\" _v-1bf56112=\"\">\n       <div class=\"m-l-md fx-row fx-start-center\" _v-1bf56112=\"\">\n         <section class=\"fx-row fx-start-center\" flex=\"\" _v-1bf56112=\"\">\n           <div class=\"p-r-sm\" _v-1bf56112=\"\">\n              <img :src=\"data.responsible &amp;&amp; data.responsible.img ? data.responsible.img : ''\" class=\"user-image circle responsive-img size-32 m-t-sm m-b-sm hand\" _v-1bf56112=\"\">\n           </div>\n           <div class=\"\" _v-1bf56112=\"\">\n             <div v-if=\"data.responsible\" class=\"hand\" _v-1bf56112=\"\">{{data.responsible.firstname}} {{data.responsible.lastname}}</div>\n             <div v-if=\"!companylisting\" _v-1bf56112=\"\"><i class=\"material-icons md-14 orange600\" _v-1bf56112=\"\"></i><span v-from-now=\"data.release_date\" _v-1bf56112=\"\"></span></div>\n           </div>\n         </section>\n\n\n         <div class=\"\" flex=\"\" _v-1bf56112=\"\">\n           <div class=\"font-uppercase  font-light\" _v-1bf56112=\"\">\n             <i class=\"material-icons md-14 orange600\" _v-1bf56112=\"\"></i>\n             <span class=\"\" _v-1bf56112=\"\">\n               {{data.location.name}}</span>\n           </div>\n         </div>\n\n         <div class=\"\" flex=\"\" _v-1bf56112=\"\">\n           <div class=\"font-uppercase  font-light\" _v-1bf56112=\"\">\n             <i class=\"material-icons md-14 orange600\" _v-1bf56112=\"\"></i>\n             <span _v-1bf56112=\"\">{{data.job_type.name}}</span>\n           </div>\n         </div>\n\n         <div class=\"\" flex=\"\" _v-1bf56112=\"\">\n           <div class=\"font-uppercase font-light fx-col\" v-if=\"data.salary_min || data.salary_max\" _v-1bf56112=\"\">\n             <span class=\"\" _v-1bf56112=\"\">{{data.salary_min | currency}} - {{data.salary_max | currency}}</span>\n             <span _v-1bf56112=\"\">/month</span>\n           </div>\n         </div>\n\n       </div>\n     </div>\n\n\n\n     <div class=\"border-top text-left bg-light m-none p-none\" _v-1bf56112=\"\">\n       <div v-if=\"!preview\" class=\"row \" _v-1bf56112=\"\">\n\n         <!-- <div class=\"p-l-sm col m10\">\n           <ul class=\"social-icons icon-circle icon-zoom  sml list-unstyled list-inline p-l-sm\">\n             <i class=\"material-icons m-r-md\">&#xE80D;</i>\n             <li @click=\"share(data)\" class=\"hand\">\n               <svg style=\"width:32px;height:32px\" viewBox=\"0 0 24 24\"><path fill=\"#BEBEBE\" d=\"M19,4V7H17A1,1 0 0,0 16,8V10H19V13H16V20H13V13H11V10H13V7.5C13,5.56 14.57,4 16.5,4M20,2H4A2,2 0 0,0 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z\" /></svg>\n             </li>\n             <li><a :href=\"twitterLink(data)\" onclick=\"javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;\">\n               <svg style=\"width:32px;height:32px\" viewBox=\"0 0 24 24\"><path fill=\"#BEBEBE\" d=\"M17.71,9.33C17.64,13.95 14.69,17.11 10.28,17.31C8.46,17.39 7.15,16.81 6,16.08C7.34,16.29 9,15.76 9.9,15C8.58,14.86 7.81,14.19 7.44,13.12C7.82,13.18 8.22,13.16 8.58,13.09C7.39,12.69 6.54,11.95 6.5,10.41C6.83,10.57 7.18,10.71 7.64,10.74C6.75,10.23 6.1,8.38 6.85,7.16C8.17,8.61 9.76,9.79 12.37,9.95C11.71,7.15 15.42,5.63 16.97,7.5C17.63,7.38 18.16,7.14 18.68,6.86C18.47,7.5 18.06,7.97 17.56,8.33C18.1,8.26 18.59,8.13 19,7.92C18.75,8.45 18.19,8.93 17.71,9.33M20,2H4A2,2 0 0,0 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z\" /></svg>\n             </li>\n             <li>\n               <a :href=\"gPlusLink(data)\" onclick=\"javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;\">\n                 <svg style=\"width:32px;height:32px\" viewBox=\"0 0 24 24\"><path fill=\"#BEBEBE\" d=\"M20,2A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V4C2,2.89 2.9,2 4,2H20M20,12H18V10H17V12H15V13H17V15H18V13H20V12M9,11.29V13H11.86C11.71,13.71 11,15.14 9,15.14C7.29,15.14 5.93,13.71 5.93,12C5.93,10.29 7.29,8.86 9,8.86C10,8.86 10.64,9.29 11,9.64L12.36,8.36C11.5,7.5 10.36,7 9,7C6.21,7 4,9.21 4,12C4,14.79 6.21,17 9,17C11.86,17 13.79,15 13.79,12.14C13.79,11.79 13.79,11.57 13.71,11.29H9Z\" /></svg>\n               </a>\n             </li>\n             <li>\n               <a :href=\"linkedInLink(data)\" onclick=\"javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;\">\n                 <svg style=\"width:32px;height:32px\" viewBox=\"0 0 24 24\"><path fill=\"#BEBEBE\" d=\"M19,19H16V13.7A1.5,1.5 0 0,0 14.5,12.2A1.5,1.5 0 0,0 13,13.7V19H10V10H13V11.2C13.5,10.36 14.59,9.8 15.5,9.8A3.5,3.5 0 0,1 19,13.3M6.5,8.31C5.5,8.31 4.69,7.5 4.69,6.5A1.81,1.81 0 0,1 6.5,4.69C7.5,4.69 8.31,5.5 8.31,6.5A1.81,1.81 0 0,1 6.5,8.31M8,19H5V10H8M20,2H4C2.89,2 2,2.89 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z\" /></svg>\n               </a>\n             </li>\n             <li>\n               <a :href=\"tumblrLink(data)\" onclick=\"javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;\">\n                 <svg style=\"width:32px;height:32px\" viewBox=\"0 0 24 24\"><path fill=\"#BEBEBE\" d=\"M16,11H13V14.9C13,15.63 13.14,16 14.1,16H16V19C16,19 14.97,19.1 13.9,19.1C11.25,19.1 10,17.5 10,15.7V11H8V8.2C10.41,8 10.62,6.16 10.8,5H13V8H16M20,2H4C2.89,2 2,2.89 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z\" /></svg>\n               </a>\n             </li>\n           </ul>\n         </div> -->\n\n       <div v-if=\"!isMine &amp;&amp; !data.apply &amp;&amp; !anonym\" class=\"m-none p-none right p-t-sm p-r-sm \" _v-1bf56112=\"\">\n\n         <div class=\"p-t-xs \" _v-1bf56112=\"\">\n           <div title=\"you already applied for this job offer\" id=\"applied-preview-{{data.id}}\" class=\"font-light font-9 m-l-xs p-r-sm uppercase cursor \" _v-1bf56112=\"\"><i class=\"material-icons\" _v-1bf56112=\"\"></i></div>\n\n         </div>\n\n       </div>\n\n\n       </div>\n\n       <div class=\"clearfix\" _v-1bf56112=\"\"></div>\n     </div>\n   </div>\n </div>\n";

/***/ },

/***/ 155:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(146)
	__vue_script__ = __webpack_require__(140)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/shared/joboffer-preview.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(151)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 178:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.unloadCompany = exports.loadCompanyJoboffers = exports.loadCompany = undefined;

	var _promise = __webpack_require__(9);

	var _promise2 = _interopRequireDefault(_promise);

	var _connect = __webpack_require__(3);

	var _connect2 = _interopRequireDefault(_connect);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var loadCompany = exports.loadCompany = function loadCompany(_ref, id) {
	  var dispatch = _ref.dispatch;

	  return new _promise2.default(function (resolve, reject) {
	    var _id = id ? '/' + id : '/';
	    _connect2.default.apiAsync('GET', '/companies' + _id).then(function (res) {
	      dispatch('SET_COMPANY_DATA', res);
	      resolve(res);
	    }).catch(function (err) {
	      return reject(err.responseText);
	    });

	    if (!_id) return;
	  });
	};

	var loadCompanyJoboffers = exports.loadCompanyJoboffers = function loadCompanyJoboffers(_ref2) {
	  var dispatch = _ref2.dispatch;
	  var id = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

	  return new _promise2.default(function (resolve, reject) {
	    var _id = id;
	    _connect2.default.apiAsync('GET', '/joboffers/search?filter={"company":' + _id + ', "limit": 3}').then(function (res) {
	      dispatch('SET_COMPANY_JOBOFFERS', res);
	      resolve(res);
	    }).catch(function (err) {
	      return reject(err.responseText);
	    });
	  });
	};

	var unloadCompany = exports.unloadCompany = function unloadCompany(_ref3) {
	  var dispatch = _ref3.dispatch;

	  dispatch('UNLOAD_COMPANY');
	};

/***/ },

/***/ 199:
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isReady = isReady;
	exports.getCompany = getCompany;
	exports.companyData = companyData;
	exports.companyJoboffers = companyJoboffers;
	function isReady(_ref) {
	  var company = _ref.company;

	  return company.loaded;
	}

	function getCompany(_ref2) {
	  var company = _ref2.company;

	  return company;
	}

	function companyData(_ref3) {
	  var company = _ref3.company;

	  return company.data;
	}

	function companyJoboffers(_ref4) {
	  var company = _ref4.company;

	  return company.joboffers;
	}

/***/ },

/***/ 399:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _jobofferPreview = __webpack_require__(155);

	var _jobofferPreview2 = _interopRequireDefault(_jobofferPreview);

	var _actions = __webpack_require__(178);

	var _getters = __webpack_require__(199);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {
	  vuex: {
	    actions: {
	      loadCompany: _actions.loadCompany,
	      loadCompanyJoboffers: _actions.loadCompanyJoboffers,
	      unloadCompany: _actions.unloadCompany
	    },
	    getters: {
	      loaded: _getters.isReady,
	      data: _getters.companyData,
	      joboffers: _getters.companyJoboffers
	    }
	  },
	  components: {
	    joboffer: _jobofferPreview2.default
	  },
	  route: {
	    data: function data(_ref) {
	      var _this = this;

	      var to = _ref.to;

	      var vm = this;
	      var _id = to.params.id;
	      if (this.loaded == _id) return;
	      this.unloadCompany();
	      this.loadCompany(_id).then(function (res) {
	        _this.loadCompanyJoboffers(res.id).then(function () {});
	      }).catch(function () {
	        return vm.$router.go('/404');
	      });
	    }
	  }
	};

/***/ },

/***/ 590:
/***/ function(module, exports) {

	module.exports = "\n\n<div v-show=\"loaded\" class=\"row\" transition=\"fade-in\" >\n\n    <div class=\"m-none p-none col m5 \">\n      <div class=\"m-l-xs\" >\n        <div class=\"hpanel profile-panel \" id=\"custom-1\">\n          <div class=\"panel-body m-none p-none\">\n            <div class=\"panel-heading fx-row fx-space-between-center\">\n              <div class=\"m-l-md\">\n                 \n              </div>\n            </div>\n\n            <section class=\"p-sm\">\n              <div class=\"fx-row p-b-sm fx-start-start\">\n                <div class=\"m-r-sm\">\n                  <img :src=\"data.logo\" class=\"img-circle size-64\" alt=\"logo\">\n                </div>\n\n                <div flex>\n                  <span class=\"font-light font-1-5 text-light font-uppercase \">{{data.name}}</span>\n                  <div class=\"font-8 m-t-xs\"><a href=\"{{data.url}}\" target=\"_blank\">{{data.url}}</a></div>\n                </div>\n              </div>\n\n              <div class=\"fx-row p-b-sm fx-start-start\" v-if=\"data.country || data.address || data.city || data.region || data.phone\">\n                <span v-if=\"data.country || data.address || data.city || data.region\">\n                    <i class=\"fa fa-home m-xxs\"></i>\n                    <span class=\"m-r-xs capital\" v-if=\"data.address\">{{data.address}},</span>\n                    <span class=\"m-r-xs capital\" v-if=\"data.city\">{{data.city}},</span>\n                    <span class=\"m-r-xs capital\" v-if=\"data.zipcode\">{{data.zipcode}},</span>\n                    <span class=\"m-r-xs capital\" v-if=\"data.region\">{{data.region}},</span>\n                    <span class=\"m-r-xs capital\" v-if=\"data.country\">{{data.country}}.</span>\n                </span>\n                <span v-if=\"data.phone\">\n                    <i class=\"fa fa-phone m-xxs\"></i>\n                    <span class=\"m-r-xs capital\" >{{data.phone}}</span>\n                </span>\n              </div>\n\n              <div class=\"font-9 font-light word-wrapper\">\n                {{{data.description}}}\n              </div>\n            </section>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class=\"profile-details col m7 p-none m-none p-b-lg\">\n      <div class=\"p-none p-r-xs hpanel p-b-lg\">\n        <joboffer v-if=\"joboffers.length\" class=\"m-b-sm\" v-for=\"item in joboffers\" :data=\"item\" :current=\"profile\"></joboffer>\n        <div v-if=\"!joboffers.length\" class=\"panel-body p-sm capital\">no available jobs offers.</div>\n      </div>\n    </div>\n</div>\n\n";

/***/ },

/***/ 655:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(399)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/company/view.company.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(590)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }

});