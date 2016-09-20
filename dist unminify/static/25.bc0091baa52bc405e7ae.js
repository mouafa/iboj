webpackJsonp([25],{

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

/***/ 373:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _promise = __webpack_require__(9);

	var _promise2 = _interopRequireDefault(_promise);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Vue = __webpack_require__(195);
	var connector = __webpack_require__(3);


	var profile = new Vue({
	  data: {
	    user: '',
	    title: '',
	    state: '',
	    img: '',
	    id: '',
	    name: '',
	    visits: 0,
	    invitations: 0,
	    friendship: ''
	  },
	  methods: {
	    load: function load() {
	      connector.apiCall('', '/profile?fields=[firstname,lastname,about,title,img,id,visits,invitations,email]', 'GET', function (error, response) {
	        if (error) return;
	        profile.user = response.user;
	        profile.title = response.title;
	        profile.state = response.state;
	        profile.img = response.img;
	        profile.id = response.id;
	        profile.name = response.firstname + ' ' + response.lastname;
	        profile.invitations = response.invitations;
	        profile.visits = response.visits;
	        profile.email = response.email;
	        profile.friendship = response.friendship || '';

	        profile.$emit('profile:ready', response.id);
	      });
	    },
	    loadAsync: function loadAsync() {
	      return new _promise2.default(function (resolve, reject) {
	        connector.apiCall('', '/profile?fields=[firstname,lastname,about,title,img,id,visits,invitations,email]', 'GET', function (error, response) {
	          if (error) reject(error);else {
	            profile.user = response.user;
	            profile.title = response.title;
	            profile.state = response.state;
	            profile.img = response.img;
	            profile.about = response.about;
	            profile.id = response.id;
	            profile.name = response.firstname + ' ' + response.lastname;
	            profile.invitations = response.invitations;
	            profile.visits = response.visits;
	            profile.email = response.email;
	            profile.friendship = response.friendship || '';
	            profile.$emit('profile:ready', response.id);
	            resolve(profile.id);
	          }
	        });
	      });
	    },
	    ready: function ready() {
	      var _this = this;

	      return new _promise2.default(function (resolve, reject) {
	        if (profile.id) resolve(profile.id);else {
	          _this.loadAsync().then(function (data) {
	            return resolve(data);
	          }).catch(function (error) {
	            return reject(error);
	          });
	        }
	      });
	    },
	    getExperiences: function getExperiences() {
	      return new _promise2.default(function (resolve, reject) {
	        connector.apiCall('', '/profile?fields=[experience]', 'GET', function (error, response) {
	          if (error) reject(error);else resolve(response);
	        });
	      });
	    },
	    getEducations: function getEducations() {
	      return new _promise2.default(function (resolve, reject) {
	        connector.apiCall('', '/profile?fields=[education]', 'GET', function (error, response) {
	          if (error) reject(error);else resolve(response);
	        });
	      });
	    }
	  }
	});

	module.exports = profile;

/***/ },

/***/ 442:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _promise = __webpack_require__(9);

	var _promise2 = _interopRequireDefault(_promise);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var connect = __webpack_require__(3);
	var appConfig = __webpack_require__(34);

	module.exports = {
	  data: function data() {
	    return {
	      profile: __webpack_require__(373),
	      avatar: null,
	      title: '',
	      about: ''
	    };
	  },
	  ready: function ready() {
	    var vm = this;
	    this.profile.loadAsync().then(function () {
	      vm.avatar = vm.profile.img;
	      vm.title = vm.profile.title;
	      vm.about = vm.profile.about;
	    }, function (err) {
	      return console.warn(err);
	    });
	  },

	  methods: {
	    uploadImage: function uploadImage() {
	      var vm = this;
	      window.uploadcare.openDialog(null, {
	        imagesOnly: true,
	        crop: '300x300'
	      }).done(function (file) {
	        file.done(vm.changeImage).fail(function (error) {
	          console.error('image upload failed', error);
	        });
	      });
	    },
	    changeImage: function changeImage(_fileInfo_) {
	      var vm = this;

	      connect.apiCall({
	        img: _fileInfo_.cdnUrl
	      }, '/profile', 'PUT', function (error, record) {
	        if (error) console.error('Error Saving image... ', error);else vm.avatar = record.img;
	      });
	    },
	    save: function save() {
	      var vm = this;

	      return new _promise2.default(function (resolve, reject) {
	        connect.apiCall({
	          about: vm.about,
	          title: vm.title
	        }, '/profile', 'PUT', function (error, data) {
	          if (error) reject(error);else resolve();
	        });
	      });
	    },
	    next: function next() {
	      var vm = this;
	      return new _promise2.default(function (resolve, reject) {
	        vm.save().then(function (res) {
	          return resolve();
	        }, function (err) {
	          return reject(console.warn(err));
	        });
	      });
	    },
	    importLinkedin: function importLinkedin() {
	      window.location.href = appConfig.apiBaseUrl + '/linkedin/auth?redirectUrl=/welcome/about';
	    }
	  }

	};

/***/ },

/***/ 510:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "[contentEditable=\"true\"][_v-ee980964] {\n  max-height: 60px;\n  overflow-y: auto;\n}\n", ""]);

	// exports


/***/ },

/***/ 541:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(510);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-ee980964&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.about.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-ee980964&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.about.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 639:
/***/ function(module, exports) {

	module.exports = "\n<div _v-ee980964=\"\">\n  <h4 class=\"capital m-none center\" v-ii18n=\"about\" _v-ee980964=\"\">about</h4>\n  <div class=\"panel panel-default\" _v-ee980964=\"\">\n    <div class=\"panel-body\" _v-ee980964=\"\">\n      <section class=\"fx-row fx-start-center\" _v-ee980964=\"\">\n        <img :src=\"avatar || '/static/user.png'\" class=\"user-image circle responsive-img size-64\" _v-ee980964=\"\">\n        <div class=\"m-l-sm\" _v-ee980964=\"\">\n          <h5 class=\"jdh--title capital m-none hand\" _v-ee980964=\"\">{{profile.name}}</h5>\n          <button @click=\"uploadImage\" type=\"button\" class=\"m-t-sm btn btn-success btn-xs uppercase\" _v-ee980964=\"\">\n            <i class=\"material-icons text-white\" _v-ee980964=\"\"></i><span class=\"capital m-l-xs\" v-ii18n=\"updateProfilePicture\" _v-ee980964=\"\">upload profile picture</span>\n          </button>\n        </div>\n      </section>\n\n      <section class=\"m-t-sm\" _v-ee980964=\"\">\n         <div class=\"row\" _v-ee980964=\"\">\n           <div class=\"m-r-lg input-field col s12\" _v-ee980964=\"\">\n               <label v-if=\"!title\" for=\"title\" _v-ee980964=\"\">Type your title here:</label>\n               <input type=\"text\" v-model=\"title\" maxlength=\"32\" id=\"title\" _v-ee980964=\"\">\n          </div>\n       </div>\n         <div class=\"row\" _v-ee980964=\"\">\n          <div class=\"input-field col s12\" _v-ee980964=\"\">\n            <textarea id=\"about\" class=\"materialize-textarea\" rows=\"3\" v-model=\"about\" name=\"about\" _v-ee980964=\"\"></textarea>\n            <label for=\"about\" _v-ee980964=\"\">Tell Us More About You:</label>\n           </div>\n         </div>\n   </section>\n\n      <div _v-ee980964=\"\">\n        <section class=\"fx-col fx-start-center placeholder m-none p-xs\" _v-ee980964=\"\">\n          <i class=\"fa fa-linkedin symbol\" _v-ee980964=\"\"></i>\n          <button @click=\"importLinkedin\" type=\"button\" class=\"btn btn-primary btn-xs uppercase\" _v-ee980964=\"\">\n            <i class=\"material-icons text-white\" _v-ee980964=\"\"></i>\n            <span class=\"capital m-l-xs\" v-ii18n=\"importNow\" _v-ee980964=\"\">Import Linkedin Data</span>\n          </button>\n          <p class=\"m-none p-t-xs capital\" v-ii18n=\"importText\" _v-ee980964=\"\"></p>\n        </section>\n      </div>\n\n    </div>\n  </div>\n\n</div>\n";

/***/ },

/***/ 697:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(541)
	__vue_script__ = __webpack_require__(442)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/welcome/view.about.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(639)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }

});