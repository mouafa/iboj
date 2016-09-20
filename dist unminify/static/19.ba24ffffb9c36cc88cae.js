webpackJsonp([19],{

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

/***/ 391:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _toConsumableArray2 = __webpack_require__(176);

	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

	var _actions = __webpack_require__(105);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var connector = __webpack_require__(3);


	var $script = __webpack_require__(548);
	$script('https://www.google.com/recaptcha/api.js');

	module.exports = {
	  vuex: {
	    actions: {
	      notify: _actions.notify
	    }
	  },
	  data: function data() {
	    return {
	      email: null,
	      error: '',
	      success: false,
	      token: null,
	      password: null,
	      showpassword: false
	    };
	  },

	  methods: {
	    validate: function validate() {
	      var errors = this.$resetform.errors;
	      if (errors && errors.length) this.notify('error', [].concat((0, _toConsumableArray3.default)(errors)).pop().field + ' ' + [].concat((0, _toConsumableArray3.default)(errors)).pop().message);else this.reset();
	    },
	    reset: function reset() {
	      var vm = this;
	      var data = {
	        email: vm.email,
	        captcha: $('#g-recaptcha-response').val()
	      };
	      connector.apiCall(data, '/auth/reset', 'POST', function (err, resp) {
	        if (err) {
	          vm.error = err.responseJSON.msg;
	          vm.notify('error', vm.error);
	          return;
	        } else {
	          vm.notify('info', 'please check your email');
	          vm.success = true;
	          vm.error = '';
	        }
	      });
	    }
	  }
	};

/***/ },

/***/ 392:
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
	      email: null,
	      error: '',
	      success: false,
	      token: null,
	      password: null,
	      showpassword: false
	    };
	  },
	  ready: function ready() {
	    this.token = this.$root.$route.query.token;
	  },

	  methods: {
	    validate: function validate() {
	      var errors = this.$resetform.errors;
	      if (errors && errors.length) this.notify('error', [].concat((0, _toConsumableArray3.default)(errors)).pop().field + ' ' + [].concat((0, _toConsumableArray3.default)(errors)).pop().message);else this.changePassword();
	    },
	    changePassword: function changePassword() {
	      var vm = this;
	      var data = {
	        token: this.token,
	        password: this.password
	      };
	      connector.apiCall(data, '/auth/update', 'POST', function (err, resp) {
	        if (err) {
	          vm.error = err.responseJSON.msg;
	          vm.notify('error', vm.error);
	          return;
	        } else {
	          vm.notify('success', 'password changed successfully');
	          setTimeout(function () {
	            $(window.location).attr('href', '/');
	          }, 1000);
	        }
	      });
	    }
	  }
	};

/***/ },

/***/ 397:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var step1 = __webpack_require__(647);
	var step2 = __webpack_require__(648);

	module.exports = {
	  components: {
	    step1: step1,
	    step2: step2
	  },
	  data: function data() {
	    return {
	      currentView: ''
	    };
	  },
	  ready: function ready() {
	    this.token = this.$root.$route.query.token;
	    if (this.token) this.currentView = 'step2';else this.currentView = 'step1';
	  }
	};

/***/ },

/***/ 508:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "#eye-icon[_v-d4723fe4] {\n  top: -32px;\n  position: relative;\n  padding: 10px 5px;\n  margin: 0;\n}\n", ""]);

	// exports


/***/ },

/***/ 539:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(508);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-d4723fe4&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./reset.step2.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-d4723fe4&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./reset.step2.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 548:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	  * $script.js JS loader & dependency manager
	  * https://github.com/ded/script.js
	  * (c) Dustin Diaz 2014 | License MIT
	  */

	(function (name, definition) {
	  if (typeof module != 'undefined' && module.exports) module.exports = definition()
	  else if (true) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	  else this[name] = definition()
	})('$script', function () {
	  var doc = document
	    , head = doc.getElementsByTagName('head')[0]
	    , s = 'string'
	    , f = false
	    , push = 'push'
	    , readyState = 'readyState'
	    , onreadystatechange = 'onreadystatechange'
	    , list = {}
	    , ids = {}
	    , delay = {}
	    , scripts = {}
	    , scriptpath
	    , urlArgs

	  function every(ar, fn) {
	    for (var i = 0, j = ar.length; i < j; ++i) if (!fn(ar[i])) return f
	    return 1
	  }
	  function each(ar, fn) {
	    every(ar, function (el) {
	      return !fn(el)
	    })
	  }

	  function $script(paths, idOrDone, optDone) {
	    paths = paths[push] ? paths : [paths]
	    var idOrDoneIsDone = idOrDone && idOrDone.call
	      , done = idOrDoneIsDone ? idOrDone : optDone
	      , id = idOrDoneIsDone ? paths.join('') : idOrDone
	      , queue = paths.length
	    function loopFn(item) {
	      return item.call ? item() : list[item]
	    }
	    function callback() {
	      if (!--queue) {
	        list[id] = 1
	        done && done()
	        for (var dset in delay) {
	          every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = [])
	        }
	      }
	    }
	    setTimeout(function () {
	      each(paths, function loading(path, force) {
	        if (path === null) return callback()
	        
	        if (!force && !/^https?:\/\//.test(path) && scriptpath) {
	          path = (path.indexOf('.js') === -1) ? scriptpath + path + '.js' : scriptpath + path;
	        }
	        
	        if (scripts[path]) {
	          if (id) ids[id] = 1
	          return (scripts[path] == 2) ? callback() : setTimeout(function () { loading(path, true) }, 0)
	        }

	        scripts[path] = 1
	        if (id) ids[id] = 1
	        create(path, callback)
	      })
	    }, 0)
	    return $script
	  }

	  function create(path, fn) {
	    var el = doc.createElement('script'), loaded
	    el.onload = el.onerror = el[onreadystatechange] = function () {
	      if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) return;
	      el.onload = el[onreadystatechange] = null
	      loaded = 1
	      scripts[path] = 2
	      fn()
	    }
	    el.async = 1
	    el.src = urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + urlArgs : path;
	    head.insertBefore(el, head.lastChild)
	  }

	  $script.get = create

	  $script.order = function (scripts, id, done) {
	    (function callback(s) {
	      s = scripts.shift()
	      !scripts.length ? $script(s, id, done) : $script(s, callback)
	    }())
	  }

	  $script.path = function (p) {
	    scriptpath = p
	  }
	  $script.urlArgs = function (str) {
	    urlArgs = str;
	  }
	  $script.ready = function (deps, ready, req) {
	    deps = deps[push] ? deps : [deps]
	    var missing = [];
	    !each(deps, function (dep) {
	      list[dep] || missing[push](dep);
	    }) && every(deps, function (dep) {return list[dep]}) ?
	      ready() : !function (key) {
	      delay[key] = delay[key] || []
	      delay[key][push](ready)
	      req && req(missing)
	    }(deps.join('|'))
	    return $script
	  }

	  $script.done = function (idOrDone) {
	    $script([null], idOrDone)
	  }

	  return $script
	});


/***/ },

/***/ 584:
/***/ function(module, exports) {

	module.exports = "\n    <div class=\"reset-container fx-col fx-center-center\">\n      <div class=\"hpanel fx-col fx-start-center\">\n          <slot></slot>\n          <div class=\"panel-body p-m\">\n            <h5 class=\"m-t-sm m-b-sm capital center\" v-ii18n=\"reset password\">reset password</h5>\n​\n              <validator name=\"resetform\">\n                <form novalidate @submit.prevent=\"validate\">\n                  <div class=\"m-r-lg input-field\">\n                    <label for=\"email\" class=\"required\">Email address</label>\n                    <input v-validate:email=\"['email','required']\" type=\"email\" class=\"form-control\" v-model=\"email\" name=\"email\" id=\"email\">\n                    <div class=\"g-recaptcha\" data-sitekey=\"6Lf2WCATAAAAALHLQK1jaSMfmst8QxCQrS76scZo\"></div>\n                  </div>\n                  <div class=\"text-right row\">\n                    <button type=\"submit\" class=\"btn btn-success capital btn-block col s8 offset-s2 \" name=\"reset\" v-ii18n=\"resetPassword\">reset password</button>\n                  </div>\n                </form>\n              </validator>\n​\n              <div v-if=\"success\" name=\"check\">\n                <h5 class=\"capital center\" v-ii18n=\"CheckYourEmail\">check your email</h5>\n              </div>\n​\n          </div>\n      </div>\n    </div>\n";

/***/ },

/***/ 588:
/***/ function(module, exports, __webpack_require__) {

	module.exports = "\n<div class=\"fx-col fx-center-center\">\n  <component :is=\"currentView\">\n    <!-- <object class=\"logo\" data=\"../../assets/logo.svg\" type=\"image/svg+xml\"> </object> -->\n    <img class=\"logo w-sm\" src=\"" + __webpack_require__(36) + "\">\n  </component>\n</div>\n";

/***/ },

/***/ 637:
/***/ function(module, exports) {

	module.exports = "\n<div class=\"reset-container fx-col fx-center-center\" _v-d4723fe4=\"\">\n  <div class=\"hpanel  fx-col fx-start-center\" _v-d4723fe4=\"\">\n    <slot _v-d4723fe4=\"\"></slot>\n    <div class=\"panel-body p-m\" _v-d4723fe4=\"\">\n      <h5 class=\"m-t-md m-b-sm capital center\" v-ii18n=\"reset password\" _v-d4723fe4=\"\">reset password</h5>\n\n      <validator name=\"resetform\" _v-d4723fe4=\"\">\n        <form novalidate=\"\" @submit.prevent=\"validate\" _v-d4723fe4=\"\">\n          <div class=\"m-r-lg input-field\" _v-d4723fe4=\"\">\n            <label for=\"password\" class=\"required\" _v-d4723fe4=\"\">Password</label>\n            <input v-validate:password=\"{'required':true,minlength:5}\" :type=\"showpassword ? 'text' : 'password'\" class=\"form-control\" v-model=\"password\" name=\"password\" id=\"password\" _v-d4723fe4=\"\">\n\n            <i id=\"eye-icon\" :title=\"showpassword ? 'Hide Password' : 'Show Password'\" class=\"fa fa-lg hand pull-right text-info\" :class=\"{ 'fa-eye': !showpassword, 'fa-eye-slash': showpassword }\" @click=\"showpassword=!showpassword\" _v-d4723fe4=\"\"></i>\n          </div>\n          <div class=\"text-right row\" _v-d4723fe4=\"\">\n            <button type=\"submit\" class=\"btn btn-success capital btn-block col s8 offset-s2 \" name=\"save\" v-ii18n=\"next\" _v-d4723fe4=\"\">\n            Change password</button>\n          </div>\n        </form>\n      </validator>\n\n    </div>\n  </div>\n</div>\n";

/***/ },

/***/ 647:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(391)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/auth/slaves/reset.step1.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(584)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 648:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(539)
	__vue_script__ = __webpack_require__(392)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/auth/slaves/reset.step2.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(637)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 653:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(397)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/auth/view.reset.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(588)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }

});