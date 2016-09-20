webpackJsonp([24],{

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

/***/ 36:
/***/ function(module, exports) {

	module.exports = "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyOTQuOTkgMTkyLjAxIj48dGl0bGU+am9iaV9sb2dvPC90aXRsZT48ZyBpZD0iX0dyb3VwXyIgZGF0YS1uYW1lPSImbHQ7R3JvdXAmZ3Q7Ij48cG9seWdvbiBpZD0iX1BhdGhfIiBkYXRhLW5hbWU9IiZsdDtQYXRoJmd0OyIgcG9pbnRzPSIyOTEuNSA2LjczIDI0OS41NCA2LjczIDI1NS45IDQ3LjAxIDI4NS4xNCA0Ny4wMSAyOTEuNSA2LjczIiBzdHlsZT0iZmlsbDojZmY1MzBkIi8+PHBvbHlnb24gaWQ9Il9QYXRoXzIiIGRhdGEtbmFtZT0iJmx0O1BhdGgmZ3Q7IiBwb2ludHM9IjI0Ni4wNCAxNjMuODEgMjcwLjUyIDE5Mi4wMSAyOTQuOTkgMTYzLjgxIDI4NC44OSA1OS4wOSAyNTYuMTQgNTkuMDkgMjQ2LjA0IDE2My44MSIgc3R5bGU9ImZpbGw6IzM4MzYzNiIvPjwvZz48cGF0aCBkPSJNMzQ1LjczLDMxNy4xOVYxNTEuMzdoMjQuMTl2MTc2LjRMMzU0LjgsMzQyLjg5SDMyMVYzMjIuMjNoMTkuNjZaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzIxLjAzIC0xNTEuMzcpIiBzdHlsZT0iZmlsbDojMzgzNjM2Ii8+PHBhdGggZD0iTTQ1Ny44NywzMjcuNzdsLTE1LjEyLDE1LjEySDQwMC42NmwtMTUuMTItMTUuMTJWMTY2LjQ5bDE1LjEyLTE1LjEyaDQyLjA4bDE1LjEyLDE1LjEyVjMyNy43N1pNNDE0Ljc3LDE3MmwtNSw1VjMxNy4xOWw1LDVoMTMuODZsNS01VjE3Ny4wOGwtNS01SDQxNC43N1oiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zMjEuMDMgLTE1MS4zNykiIHN0eWxlPSJmaWxsOiMzODM2MzYiLz48cGF0aCBkPSJNNTQ0LjgsMTY2LjQ5VjIzMGwtMTUuMTIsMTUuMTIsMTUuMTIsMTUuMTJ2NjcuNTRsLTE1LjEyLDE1LjEySDQ3My43NFYxNTEuMzdoNTUuOTRabS0yNC4xOSw2NFYxNzYuNTdsLTUtNUg0OTcuOTN2NjRoMTcuNjRabS0yMi42OCwyNS4ydjY2LjUzaDE3LjY0bDUtNVYyNjAuNzRsLTUtNUg0OTcuOTNaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzIxLjAzIC0xNTEuMzcpIiBzdHlsZT0iZmlsbDojMzgzNjM2Ii8+PC9zdmc+"

/***/ },

/***/ 105:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.notify = undefined;

	var _notifsCenter = __webpack_require__(13);

	var _notifsCenter2 = _interopRequireDefault(_notifsCenter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var notify = exports.notify = function notify(_ref, type, body, title) {
	  var dispatch = _ref.dispatch;

	  _notifsCenter2.default[type](body, title);
	  dispatch('ADD_NOTIF', { body: body, title: title });
	};

/***/ },

/***/ 394:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _toConsumableArray2 = __webpack_require__(176);

	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

	var _actions = __webpack_require__(105);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var connector = __webpack_require__(3);


	module.exports = {
	  vuex: {
	    actions: {
	      notify: _actions.notify
	    }
	  },
	  data: function data() {
	    return {
	      firstname: '',
	      lastname: '',
	      email: '',
	      password: '',
	      showpassword: false,
	      error: ''
	    };
	  },

	  methods: {
	    validate: function validate() {
	      var errors = this.$sigupform.errors;
	      if (errors && errors.length) this.notify('error', [].concat((0, _toConsumableArray3.default)(errors)).pop().field + ' ' + [].concat((0, _toConsumableArray3.default)(errors)).pop().message);else this.signup();
	    },
	    signup: function signup() {
	      var vm = this;
	      var data = {
	        firstname: this.firstname,
	        lastname: this.lastname,
	        email: this.email,
	        password: this.password
	      };
	      vm.error = '';
	      connector.apiCall(data, '/auth/local/register', 'POST', function (err, response) {
	        if (err) {
	          vm.error = err.responseJSON.msg;
	          vm.notify('error', vm.error);
	          return;
	        }
	        window.localStorage.setItem('auth', true);
	        $(window.location).attr('href', window.location.origin + '/welcome');
	      });
	    }
	  }
	};

/***/ },

/***/ 507:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "#eye-icon[_v-cddd6a3e] {\n  margin-top: -23px;\n}\n", ""]);

	// exports


/***/ },

/***/ 538:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(507);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-cddd6a3e&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./signup.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-cddd6a3e&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./signup.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 636:
/***/ function(module, exports, __webpack_require__) {

	module.exports = "\n<div class=\"fx-col fx-center-center\" _v-cddd6a3e=\"\">\n  <div class=\"register-container\" _v-cddd6a3e=\"\">\n    <div class=\"hpanel fx-col fx-start-center\" _v-cddd6a3e=\"\">\n      <slot _v-cddd6a3e=\"\"></slot>\n      <img class=\"logo w-sm\" src=\"" + __webpack_require__(36) + "\" _v-cddd6a3e=\"\">\n      <div class=\"panel-body\" _v-cddd6a3e=\"\">\n        <validator name=\"sigupform\" _v-cddd6a3e=\"\">\n          <form novalidate=\"\" @submit.prevent=\"validate\" _v-cddd6a3e=\"\">\n            <div class=\"m-r-lg row\" _v-cddd6a3e=\"\">\n              <div class=\"input-field\" _v-cddd6a3e=\"\">\n                <label v-if=\"!firstname\" for=\"firstname\" class=\"required\" _v-cddd6a3e=\"\">First Name</label>\n                <input v-validate:firstname=\"{required:true, maxlength: 32}\" type=\"text\" name=\"firstname\" class=\"form-control \" v-model=\"firstname\" id=\"firstname\" _v-cddd6a3e=\"\">\n              </div>\n              <div class=\"input-field\" _v-cddd6a3e=\"\">\n                <label v-if=\"!lastname\" for=\"lastname\" class=\"required\" _v-cddd6a3e=\"\">Last Name</label>\n                <input v-validate:lastname=\"{required:true, maxlength: 32}\" type=\"text\" id=\"lastname\" name=\"lastname\" class=\"form-control \" v-model=\"lastname\" _v-cddd6a3e=\"\">\n              </div>\n            </div>\n            <div class=\"m-r-lg input-field\" _v-cddd6a3e=\"\">\n              <label v-if=\"!email\" for=\"email\" class=\"required\" _v-cddd6a3e=\"\">Email</label>\n              <input v-validate:email=\"['required','email']\" type=\"email\" id=\"email\" name=\"email-register\" class=\"form-control\" v-model=\"email\" _v-cddd6a3e=\"\">\n            </div>\n            <div class=\"m-r-lg input-field\" _v-cddd6a3e=\"\">\n              <div class=\"password-container input-field\" _v-cddd6a3e=\"\">\n                <label v-if=\"!password\" for=\"password\" class=\"required\" _v-cddd6a3e=\"\">Password</label>\n                <input v-validate:password=\"{'required':true, minlength:5}\" :type=\"showpassword ? 'text' : 'password'\" value=\"\" id=\"\" name=\"password-register\" class=\"form-control\" v-model=\"password\" _v-cddd6a3e=\"\">\n                <i id=\"eye-icon\" :title=\"showpassword ? 'Hide Password' : 'Show Password'\" class=\"fa fa-lg hand pull-right  m-r-xs text-info\" :class=\"{ 'fa-eye': !showpassword, 'fa-eye-slash': showpassword }\" @click=\"showpassword=!showpassword\" _v-cddd6a3e=\"\"></i>\n              </div>\n            </div>\n            <div class=\"row\" _v-cddd6a3e=\"\">\n            <button type=\"submit\" class=\"btn btn-success btn-block col s8 offset-s2\" name=\"register\" _v-cddd6a3e=\"\">Register</button>\n          </div>\n          </form>\n        </validator>\n\n      </div>\n    </div>\n  </div>\n</div>\n";

/***/ },

/***/ 650:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(538)
	__vue_script__ = __webpack_require__(394)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/auth/slaves/signup.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(636)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }

});