webpackJsonp([18],{

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

/***/ 12:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(46)
	__vue_script__ = __webpack_require__(44)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/shared/modal.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(47)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 44:
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  props: {
	    show: {
	      type: Boolean,

	      twoWay: true,
	      default: true
	    },
	    withFooter: {
	      type: Boolean,
	      default: true
	    },
	    width: {
	      type: Number,
	      default: 640
	    }
	  }
	};

/***/ },

/***/ 45:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*doc\n---\ntitle: Colors\nname: colors\ncategory: Base CSS\n---\n\nColors: to be able to use the predefined colors, You need to import common/less/colors.less\n\n```html_example\n<style>\n@import \"../src/components/common/less/colors.less\"\n</style>\n<div class=\"size-32\" style=\"background-color: @color-navy-blue\">Click</div>\n```\n*/\n/* Mixin */\n.modal-mask[_v-5d28a280] {\n  position: fixed;\n  z-index: 1000;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background-color: rgba(0, 0, 0, 0.5);\n  -webkit-transition: opacity .3s ease;\n  transition: opacity .3s ease;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.modal-container[_v-5d28a280] {\n  padding: 0;\n  background-color: #fff;\n  border-radius: 2px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);\n  -webkit-transition: all .3s ease;\n  transition: all .3s ease;\n}\n.modal-header h3[_v-5d28a280] {\n  margin-top: 0;\n}\n.modal-body[_v-5d28a280] {\n  margin: 0;\n  max-height: 600px;\n  overflow: hidden;\n  padding-bottom: 15px;\n}\n.modal-default-button[_v-5d28a280] {\n  float: right;\n}\n.modal-footer[_v-5d28a280] {\n  height: 50px;\n  background-color: #575959;\n}\n.modal-enter[_v-5d28a280],\n.modal-leave[_v-5d28a280] {\n  opacity: 0;\n}\n.modal-enter .modal-container[_v-5d28a280],\n.modal-leave .modal-container[_v-5d28a280] {\n  -webkit-transform: scale(1.1);\n  transform: scale(1.1);\n}\n", ""]);

	// exports


/***/ },

/***/ 46:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(45);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-5d28a280&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./modal.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-5d28a280&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./modal.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 47:
/***/ function(module, exports) {

	module.exports = "\n\n<!-- <div  v-if=\"show\"> -->\n<div class=\"modal-mask\" v-show=\"show\" transition=\"modal\" _v-5d28a280=\"\">\n  <div class=\"modal-wrapper\" _v-5d28a280=\"\">\n    <div class=\"modal-container\" :style=\"'width:' + width + 'px;'\" _v-5d28a280=\"\">\n\n      <div class=\"modal-header\" _v-5d28a280=\"\">\n        <slot name=\"header\" _v-5d28a280=\"\"></slot>\n      </div>\n\n      <div class=\"modal-body\" _v-5d28a280=\"\">\n        <slot name=\"body\" _v-5d28a280=\"\"></slot>\n      </div>\n\n      <div class=\"modal-footer\" v-if=\"withFooter\" _v-5d28a280=\"\">\n        <slot name=\"footer\" _v-5d28a280=\"\"></slot>\n      </div>\n\n    </div>\n  </div>\n</div>\n<!-- </div> -->\n\n";

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

/***/ 390:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _notifsCenter = __webpack_require__(13);

	var _notifsCenter2 = _interopRequireDefault(_notifsCenter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var modal = __webpack_require__(12);
	var preview = __webpack_require__(155);
	var connect = __webpack_require__(3);

	module.exports = {
	  data: function data() {
	    return {
	      joboffer: { id: 0, questions: [] },
	      showModal: false,
	      error: '',
	      questionType: 'Free',
	      questionFor: 'application',
	      questionSubject: '',
	      desable: false,
	      jobofferPreview: {}
	    };
	  },

	  route: {
	    data: function data(_ref) {
	      var _this = this;

	      var to = _ref.to;

	      var jobId = to.params.jobId;
	      if (Number(jobId)) {
	        this.loadJoboffer(jobId).catch(function () {
	          return _this.$router.go('/addjoboffer');
	        });
	      } else this.$router.go('/addjoboffer');
	    }
	  },
	  components: {
	    preview: preview,
	    modal: modal
	  },
	  computed: {
	    desable: function desable() {
	      if (this.joboffer.questions && this.joboffer.questions.length) {
	        if (this.joboffer.questions.length == 2) return 3;
	      }
	    },
	    remainChars: function remainChars() {
	      if (this.questionSubject && this.questionSubject) return 140 - this.questionSubject.split('\n').join('  ').length;else return 140;
	    }
	  },
	  methods: {
	    loadJoboffer: function loadJoboffer(id) {
	      var vm = this;
	      return connect.apiAsync('GET', '/dashboard/joboffers/' + id + '?fields=[id,applicationQuestions]').then(function (res) {
	        vm.joboffer.id = res.id;
	        vm.joboffer.questions = res.applicationQuestions || [];
	      });
	    },
	    add: function add() {
	      if (this.check()) return;
	      var question = {
	        subject: this.questionSubject,
	        type: this.questionType,
	        target: this.questionFor
	      };
	      this.joboffer.questions.push(question);
	      this.reset();
	    },
	    remove: function remove(question) {
	      this.joboffer.questions.$remove(question);
	      this.reset();
	    },
	    useSample: function useSample() {
	      this.questionSubject = this.$els.sample.innerHTML;
	    },
	    check: function check() {
	      if (this.desable == 3) return true;else if (this.questionSubject.length < 10) {
	        _notifsCenter2.default.error('question is too short');
	        return true;
	      } else return false;
	    },
	    previewForPublish: function previewForPublish() {
	      var vm = this;
	      vm.error = '';
	      var data = {
	        questions: this.joboffer.questions.length == 0 ? [] : this.joboffer.questions
	      };
	      connect.apiAsync('PUT', '/joboffers/' + this.joboffer.id, data).then(function (res) {
	        vm.jobofferPreview = res;
	        vm.showModal = true;
	      }).catch(_notifsCenter2.default.fail);
	    },
	    publish: function publish() {
	      var vm = this;
	      vm.error = '';
	      connect.apiAsync('PUT', '/joboffers/' + this.joboffer.id, { state: 'pushed' }).then(function (res) {
	        vm.showModal = false;
	        var id = vm.joboffer.slug ? vm.joboffer.slug : vm.joboffer.uuid;
	        vm.$router.go('/joboffer/' + id);
	      }).catch(_notifsCenter2.default.fail);
	    },
	    saveForLater: function saveForLater() {
	      var vm = this;
	      vm.error = '';
	      var data = {
	        questions: this.joboffer.questions.length == 0 ? [] : this.joboffer.questions,
	        state: 'staged'
	      };
	      connect.apiAsync('PUT', '/joboffers/' + this.joboffer.id, data).then(function (res) {
	        var id = vm.joboffer.slug ? vm.joboffer.slug : vm.joboffer.uuid;
	        vm.$router.go('/joboffer/' + id);
	      }).catch(_notifsCenter2.default.fail);
	    },
	    cancel: function cancel() {
	      this.showModal = false;
	    },
	    reset: function reset() {
	      this.error = '';
	      this.questionType = 'Free';
	      this.questionSubject = '';
	    }
	  }
	};

/***/ },

/***/ 496:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".\\--question-list button[_v-337fa852] {\n  opacity: .5;\n  -webkit-transition: all 200ms;\n  transition: all 200ms;\n}\n.\\--question-list:hover button[_v-337fa852] {\n  opacity: 1;\n}\n", ""]);

	// exports


/***/ },

/***/ 527:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(496);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-337fa852&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.quiz.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-337fa852&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.quiz.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 625:
/***/ function(module, exports) {

	module.exports = "\n<div class=\"hpanel row m-none p-md\" _v-337fa852=\"\">\n   <modal :show.sync=\"showModal\" _v-337fa852=\"\">\n    <div class=\"p-l-sm p-r-sm m-b-md\" slot=\"body\" _v-337fa852=\"\">\n      <div class=\"container-preview-component m-t-sm\" _v-337fa852=\"\">\n        <preview v-if=\"showModal\" :data=\"jobofferPreview\" :preview=\"true\" _v-337fa852=\"\"></preview>\n      </div>\n    </div>\n    <div class=\"pull-right m-r-md m-t-sm row \" slot=\"footer\" _v-337fa852=\"\">\n      <button @click=\"cancel\" class=\"font-light btn-link text-white hand font-8 uppercase\" v-ii18n=\"cancel\" _v-337fa852=\"\">cancel</button>\n      <button @click=\"publish\" class=\"w-xs font-light btn btn-success m-l-md font-8 uppercase\" v-ii18n=\"publish\" _v-337fa852=\"\">publish</button>\n    </div>\n  </modal>\n  <div class=\"panel-body col s7 \" _v-337fa852=\"\">\n        <div class=\"m-l-md\" _v-337fa852=\"\">\n          <span class=\"capital\" v-ii18n=\"questionTemplates\" _v-337fa852=\"\">question for application</span>\n        </div>\n    <div class=\"row  m-t-xs m-r-lg m-b-xs m-l-lg\" _v-337fa852=\"\">\n      <!-- <div class=\"row error-class text-danger m-b-sm capital\">{{error}}</div> -->\n         <div class=\"row\" _v-337fa852=\"\">\n          <div class=\"col s8 m-t-md row\" _v-337fa852=\"\">\n            <label class=\"col s4 m-t-sm capital\" _v-337fa852=\"\">question type</label>\n              <select v-model=\"questionType\" class=\"browser-default col s8\" id=\"question_type\" _v-337fa852=\"\">\n                <option value=\"Free\" _v-337fa852=\"\">Free input Question</option>\n                <option value=\"Y/N\" _v-337fa852=\"\">Yes / No Question</option>\n             </select>\n          </div>\n         </div>\n       <div class=\"row\" _v-337fa852=\"\">\n         <div class=\"input-field col s12\" _v-337fa852=\"\">\n          <label for=\"role\" class=\"capital\" _v-337fa852=\"\">You Question here..</label>\n           <textarea id=\"role\" class=\"materialize-textarea\" v-model=\"questionSubject\" maxlength=\"140\" name=\"role\" minlength=\"10\" rows=\"3\" _v-337fa852=\"\"></textarea>\n          </div>\n           <div class=\" font-8 text-warning pull-right\" _v-337fa852=\"\">{{remainChars}}</div>\n       </div>\n        <div class=\"row  m-b-md m-r-lg\" _v-337fa852=\"\">\n          <button @click=\"add\" :disabled=\"desable==3\" class=\"w-xs font-light btn btn-success m-l-md font-8 uppercase\" v-ii18n=\"addQuestion\" _v-337fa852=\"\">add question</button>\n        </div>\n\n      <div class=\"fx-row fx-space-between-centerm-sm p-xs --question-list\" v-for=\"item in joboffer.questions\" track-by=\"$index\" _v-337fa852=\"\">\n        <div class=\"font-light p-r-sm\" flex=\"\" _v-337fa852=\"\">\n          <div class=\"m-b-xs\" _v-337fa852=\"\">\n            <span v-if=\"item.type == 'Free'\" _v-337fa852=\"\">Free question</span>\n            <span v-else=\"\" _v-337fa852=\"\">Yes or No question</span>\n            <span v-if=\"item.target == 'application'\" class=\"label label-primary m-l-xs\" _v-337fa852=\"\">application</span>\n          </div>\n          <span class=\"font-9 font-bold break-word\" _v-337fa852=\"\">{{item.subject}}</span>\n        </div>\n        <span @click=\"remove(item)\" class=\"hand\" _v-337fa852=\"\"><i class=\"material-icons\" _v-337fa852=\"\"></i></span>\n      </div>\n    </div>\n    <button @click=\"saveForLater\" class=\"w-md font-light btn btn-primary pull-right font-8 uppercase m-l-sm\" v-ii18n=\"saveForLater\" _v-337fa852=\"\">save for later</button>\n    <button @click=\"previewForPublish\" class=\"w-md font-light btn btn-primary pull-right font-8 uppercase\" v-ii18n=\"previewForPublish\" _v-337fa852=\"\">preview for publish</button>\n\n  </div>\n\n  <div class=\"col s5 \" _v-337fa852=\"\">\n    <div class=\"hpanel m-t-sm\" id=\"right_menu_job_container\" _v-337fa852=\"\">\n      <div class=\"panel-heading\" _v-337fa852=\"\">\n        <div class=\"m-l-md\" _v-337fa852=\"\">\n          <i class=\"fa fa-lightbulb-o m-r-sm\" _v-337fa852=\"\"></i>\n          <span class=\"capital\" v-ii18n=\"questionTemplates\" _v-337fa852=\"\">question templates you can use </span>\n        </div>\n      </div>\n      <div class=\"panel-body\" _v-337fa852=\"\">\n        <p class=\"p-b-lg capital\" v-el:sample=\"\" v-ii18n=\"haveYouWorked\" _v-337fa852=\"\">Have you worked with the candidate you are recommending?</p>\n        <div class=\"row  m-b-sm \" _v-337fa852=\"\">\n          <button @click=\"useSample\" class=\"font-light btn btn-primary m-r-md font-8 pull-right uppercase\" v-ii18n=\"useIt\" _v-337fa852=\"\">use it</button>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n";

/***/ },

/***/ 645:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(527)
	__vue_script__ = __webpack_require__(390)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/add-joboffer/view.quiz.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(625)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }

});