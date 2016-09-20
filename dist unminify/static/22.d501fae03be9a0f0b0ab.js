webpackJsonp([22],{

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

/***/ 11:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.addEndors = exports.loadDegrees = exports.loadRelationship = exports.loadBadges = exports.contactConfirm = exports.contactRemove = exports.contactAdd = exports.addNewSec = exports.deleteActiveSec = exports.saveActiveSecCat = exports.deleteFromActiveSec = exports.addToActiveSec = exports.saveActiveSec = exports.cancelActiveSec = exports.setActiveSec = exports.addNewEdu = exports.deleteActiveEdu = exports.saveActiveEdu = exports.cancelActiveEdu = exports.setActiveEdu = exports.setSchoolImg = exports.addNewExp = exports.deleteActiveExp = exports.saveActiveExp = exports.cancelActiveExp = exports.setActiveExp = exports.setCompanyImg = exports.updateAbout = exports.setProfileImg = exports.loadProfile = exports.unloadProfile = exports.flushProfile = undefined;

	var _promise = __webpack_require__(9);

	var _promise2 = _interopRequireDefault(_promise);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var connect = __webpack_require__(3);

	var flushProfile = exports.flushProfile = function flushProfile(_ref, id) {
	  var dispatch = _ref.dispatch;

	  dispatch('FLUSH_PROFILE_DATA');
	};

	var unloadProfile = exports.unloadProfile = function unloadProfile(_ref2) {
	  var dispatch = _ref2.dispatch;

	  dispatch('UNLOAD_PROFILE');
	};

	var loadProfile = exports.loadProfile = function loadProfile(_ref3, id) {
	  var dispatch = _ref3.dispatch;

	  return new _promise2.default(function (resolve, reject) {
	    var _id = id ? '/' + id : '';
	    connect.apiAsync('GET', '/profile' + _id).then(function (res) {
	      dispatch('SET_PROFILE_DATA', res);
	      resolve;
	    }).catch(function (err) {
	      return reject(err.responseText);
	    });

	    if (!_id) return;
	  });
	};

	var setProfileImg = exports.setProfileImg = function setProfileImg(_ref4, img) {
	  var dispatch = _ref4.dispatch;

	  connect.apiAsync('PUT', '/profile', { img: img }).then(function (data) {
	    dispatch('SET_PROFILE_IMG', data.img);
	    dispatch('SET_ACCOUNT_ATR', 'img', data.img);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var updateAbout = exports.updateAbout = function updateAbout(_ref5, newAbout) {
	  var dispatch = _ref5.dispatch;

	  return connect.apiAsync('PUT', '/profile', newAbout).then(function (data) {
	    dispatch('SET_PROFILE_ABOUT', data);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var setCompanyImg = exports.setCompanyImg = function setCompanyImg(_ref6, img, id, company_id) {
	  var dispatch = _ref6.dispatch;

	  return connect.apiAsync('PUT', '/workrecords/' + id, { img: img, company_id: company_id }).then(function (data) {
	    dispatch('SET_EXPERIENCE_IMG', data.img, id);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var setActiveExp = exports.setActiveExp = function setActiveExp(_ref7, data) {
	  var dispatch = _ref7.dispatch;

	  dispatch('SET_ACTIVE_EXPERIENCE', data);
	};

	var cancelActiveExp = exports.cancelActiveExp = function cancelActiveExp(_ref8) {
	  var dispatch = _ref8.dispatch;

	  dispatch('CANCEL_ACTIVE_EXPERIENCE');
	};

	var saveActiveExp = exports.saveActiveExp = function saveActiveExp(_ref9, data) {
	  var dispatch = _ref9.dispatch;
	  var state = _ref9.state;

	  var id = state.profile.activeExpData.id;
	  delete data.id;
	  return new _promise2.default(function (resolve, reject) {
	    connect.apiAsync('PUT', '/workrecords/' + id, data).then(function (data) {
	      dispatch('EDIT_ACTIVE_EXPERIENCE', data);
	      resolve();
	    }).catch(reject);
	  });
	};

	var deleteActiveExp = exports.deleteActiveExp = function deleteActiveExp(_ref10) {
	  var dispatch = _ref10.dispatch;
	  var state = _ref10.state;

	  var id = state.profile.activeExpData.id;
	  return connect.apiAsync('DELETE', '/workrecords/' + id).then(function (data) {
	    dispatch('DELETE_ACTIVE_EXPERIENCE', data);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var addNewExp = exports.addNewExp = function addNewExp(_ref11, data) {
	  var dispatch = _ref11.dispatch;
	  var state = _ref11.state;

	  delete data.id;
	  return new _promise2.default(function (resolve, reject) {
	    return connect.apiAsync('POST', '/workrecords', data).then(function (newData) {
	      dispatch('ADD_PROFILE_EXPERIENCE', newData);
	      resolve();
	    }).catch(reject);
	  });
	};

	var setSchoolImg = exports.setSchoolImg = function setSchoolImg(_ref12, img, id, school_id) {
	  var dispatch = _ref12.dispatch;

	  return connect.apiAsync('PUT', '/educationrecords/' + id, { img: img, school_id: school_id }).then(function (data) {
	    dispatch('SET_EDUCATION_IMG', data.img, id);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var setActiveEdu = exports.setActiveEdu = function setActiveEdu(_ref13, data) {
	  var dispatch = _ref13.dispatch;

	  dispatch('SET_ACTIVE_EDUCATION', data);
	};

	var cancelActiveEdu = exports.cancelActiveEdu = function cancelActiveEdu(_ref14) {
	  var dispatch = _ref14.dispatch;

	  dispatch('CANCEL_ACTIVE_EDUCATION');
	};

	var saveActiveEdu = exports.saveActiveEdu = function saveActiveEdu(_ref15, data) {
	  var dispatch = _ref15.dispatch;
	  var state = _ref15.state;

	  var id = state.profile.activeEduData.id;
	  delete data.id;

	  return new _promise2.default(function (resolve, reject) {
	    connect.apiAsync('PUT', '/educationrecords/' + id, data).then(function (data) {
	      dispatch('EDIT_ACTIVE_EDUCATION', data);
	      resolve();
	    }).catch(reject);
	  });
	};

	var deleteActiveEdu = exports.deleteActiveEdu = function deleteActiveEdu(_ref16) {
	  var dispatch = _ref16.dispatch;
	  var state = _ref16.state;

	  var id = state.profile.activeEduData.id;
	  return connect.apiAsync('DELETE', '/educationrecords/' + id).then(function (data) {
	    dispatch('DELETE_ACTIVE_EDUCATION', data);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var addNewEdu = exports.addNewEdu = function addNewEdu(_ref17, data) {
	  var dispatch = _ref17.dispatch;
	  var state = _ref17.state;

	  delete data.id;
	  return new _promise2.default(function (resolve, reject) {
	    connect.apiAsync('POST', '/educationrecords', data).then(function (newData) {
	      dispatch('ADD_PROFILE_EDUCATION', newData);
	      resolve();
	    }, function (err) {
	      return console.warn(err);
	    }).catch(reject);
	  });
	};

	var setActiveSec = exports.setActiveSec = function setActiveSec(_ref18, data) {
	  var dispatch = _ref18.dispatch;

	  dispatch('SET_ACTIVE_SECTION', data);
	};

	var cancelActiveSec = exports.cancelActiveSec = function cancelActiveSec(_ref19) {
	  var dispatch = _ref19.dispatch;

	  dispatch('CANCEL_ACTIVE_SECTION');
	};

	var saveActiveSec = exports.saveActiveSec = function saveActiveSec(_ref20, data, sectionId) {
	  var dispatch = _ref20.dispatch;
	  var state = _ref20.state;

	  var profileId = state.profile.data.id;
	  var category_id = state.profile.activeSecData.id;
	  data.category_id = category_id;
	  return connect.apiAsync('PUT', '/profile/' + profileId + '/customsections/' + sectionId, data).then(function (data) {
	    dispatch('EDIT_ACTIVE_SECTION', data, sectionId);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var addToActiveSec = exports.addToActiveSec = function addToActiveSec(_ref21, data) {
	  var dispatch = _ref21.dispatch;
	  var state = _ref21.state;

	  var profileId = state.profile.data.id;
	  data.category_id = state.profile.activeSecData.id;
	  return connect.apiAsync('POST', '/profile/' + profileId + '/customsections', data).then(function (data) {
	    dispatch('ADD_TO_ACTIVE_SECTION', data);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var deleteFromActiveSec = exports.deleteFromActiveSec = function deleteFromActiveSec(_ref22, sectionId) {
	  var dispatch = _ref22.dispatch;
	  var state = _ref22.state;

	  var profileId = state.profile.data.id;
	  return connect.apiAsync('DELETE', '/profile/' + profileId + '/customsections/' + sectionId).then(function (data) {
	    dispatch('DELETE_FROM_ACTIVE_SECTION', sectionId);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var saveActiveSecCat = exports.saveActiveSecCat = function saveActiveSecCat(_ref23, data) {
	  var dispatch = _ref23.dispatch;
	  var state = _ref23.state;

	  var profileId = state.profile.data.id;
	  var category_id = state.profile.activeSecData.id;
	  data.category_id = category_id;
	  return connect.apiAsync('PUT', '/profile/' + profileId + '/customsectionscategory/' + category_id, data).then(function (data) {
	    dispatch('EDIT_ACTIVE_SECTION', data);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var deleteActiveSec = exports.deleteActiveSec = function deleteActiveSec(_ref24) {
	  var dispatch = _ref24.dispatch;
	  var state = _ref24.state;

	  var profileId = state.profile.data.id;
	  var category_id = state.profile.activeSecData.id;
	  return connect.apiAsync('DELETE', '/profile/' + profileId + '/customsectionscategory/' + category_id).then(function (data) {
	    dispatch('DELETE_ACTIVE_SECTION', data);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var addNewSec = exports.addNewSec = function addNewSec(_ref25, data) {
	  var dispatch = _ref25.dispatch;
	  var state = _ref25.state;

	  var profileId = state.profile.data.id;
	  return connect.apiAsync('POST', '/profile/' + profileId + '/customsectionscategory', data).then(function (data) {
	    dispatch('ADD_PROFILE_SECTION', data);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var contactAdd = exports.contactAdd = function contactAdd(_ref26, receiver) {
	  var dispatch = _ref26.dispatch;
	  var state = _ref26.state;

	  return connect.apiAsync('POST', '/contacts', receiver).then(function (data) {
	    dispatch('CONTACT_REQUEST_SENT', data);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var contactRemove = exports.contactRemove = function contactRemove(_ref27, friendshipId) {
	  var dispatch = _ref27.dispatch;
	  var state = _ref27.state;

	  return connect.apiAsync('DELETE', '/contacts/' + friendshipId).then(function (data) {
	    dispatch('CONTACT_REQUEST_REMOVE', data);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var contactConfirm = exports.contactConfirm = function contactConfirm(_ref28, friendshipId) {
	  var dispatch = _ref28.dispatch;
	  var state = _ref28.state;

	  return connect.apiAsync('PUT', '/contacts/' + friendshipId + '/accept').then(function (data) {
	    dispatch('CONTACT_REQUEST_ACCEPT', data);
	  }, function (err) {
	    return console.warn(err);
	  });
	};

	var loadBadges = exports.loadBadges = function loadBadges(_ref29) {
	  var dispatch = _ref29.dispatch;
	  var state = _ref29.state;

	  if (state.profile.badges) return;
	  connect.apiAsync('GET', '/badges').then(function (res) {
	    return dispatch('SET_PROFILE_BADGES', res);
	  }, function (err) {
	    return console.warn('err loadBadges', err.responseText);
	  });
	};
	var loadRelationship = exports.loadRelationship = function loadRelationship(_ref30) {
	  var dispatch = _ref30.dispatch;
	  var state = _ref30.state;

	  if (state.profile.relationship) return;
	  connect.apiAsync('GET', '/relationship').then(function (res) {
	    return dispatch('SET_PROFILE_RELATIONSHIP', res);
	  }, function (err) {
	    return console.warn('err loadRelationship', err.responseText);
	  });
	};
	var loadDegrees = exports.loadDegrees = function loadDegrees(_ref31) {
	  var dispatch = _ref31.dispatch;
	  var state = _ref31.state;

	  if (state.profile.degrees) return;
	  connect.apiAsync('GET', '/degrees').then(function (res) {
	    return dispatch('SET_PROFILE_DEGREE', res);
	  }, function (err) {
	    return console.warn('err loadDegrees', err.responseText);
	  });
	};
	var addEndors = exports.addEndors = function addEndors(_ref32, data) {
	  var dispatch = _ref32.dispatch;
	  var state = _ref32.state;

	  return connect.apiAsync('POST', '/endorsements', data).then(function (newData) {
	    if (data.type == 'workrecords') {
	      dispatch('ADD_PROFILE_ENDORSMENT_EXP', newData);
	    } else if (data.type == 'educationrecords') {
	      dispatch('ADD_PROFILE_ENDORSMENT_EDU', newData);
	    }
	  }, function (err) {
	    return console.warn(err);
	  });
	};

/***/ },

/***/ 441:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _actions = __webpack_require__(11);

	__webpack_require__(549);

	module.exports = {
	  vuex: {
	    actions: {
	      loadProfile: _actions.loadProfile
	    }
	  },
	  data: function data() {
	    return {
	      step: {
	        index: 1,
	        class: 'step-1'
	      },
	      routes: ['about', 'work', 'education']
	    };
	  },
	  ready: function ready() {
	    this.stepIndication();
	    this.loadProfile();
	  },

	  route: {
	    data: function data() {
	      this.stepIndication();
	    }
	  },
	  methods: {
	    next: function next() {
	      var vm = this;
	      this.$refs.innercomp.next().then(function (res) {
	        vm.nextPage();
	      }, function (err) {
	        return console.log(err);
	      });
	    },

	    nextPage: function nextPage() {
	      var _i = this.step.index;

	      if (_i > this.routes.length - 1) this.$route.router.go({ name: 'myProfile' });else {
	        var _nextPage = this.routes[_i];
	        this.$route.router.go({ name: _nextPage });
	      }
	    },
	    stepIndication: function stepIndication(_i_) {
	      var newIndex = _i_ || this.routes.indexOf(this.$route.name) + 1;
	      this.step.index = newIndex;
	      this.step.class = 'step-' + newIndex;
	    }
	  }
	};

/***/ },

/***/ 475:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*doc\n---\ntitle: Colors\nname: colors\ncategory: Base CSS\n---\n\nColors: to be able to use the predefined colors, You need to import common/less/colors.less\n\n```html_example\n<style>\n@import \"../src/components/common/less/colors.less\"\n</style>\n<div class=\"size-32\" style=\"background-color: @color-navy-blue\">Click</div>\n```\n*/\n/* Mixin */\n.welcome-container {\n  background: #F5F8FB !important;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  align-items: center;\n}\n.welcome-container:after {\n  content: '';\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  height: 50%;\n  background: linear-gradient(transparent, rgba(255, 255, 255, 0.9));\n  z-index: 0;\n}\n.welcome-container .main-view {\n  width: 100%;\n  max-width: 640px;\n  position: relative;\n  z-index: 1;\n}\n.panel {\n  width: 100%;\n}\n.panel .panel-body {\n  background: white;\n  border-radius: 4px;\n  padding: 15px 20px;\n  box-shadow: 0 3px 8px #e4e5e7;\n  height: 400px;\n}\n[contentEditable=\"true\"] {\n  min-height: 60px;\n  max-height: 200px;\n  overflow-y: auto;\n  height: initial;\n}\n.form-control {\n  transition: all 200ms ease;\n  border-radius: 2px !important;\n}\n.form-control:hover,\n.form-control:focus {\n  border-color: #06a2c4;\n  box-shadow: inset 0 0 4px 2px #e4e5e7 !important;\n}\nnav {\n  width: 100%;\n}\nnav .nav-next {\n  line-height: 48px;\n  height: 50px;\n  width: 50px;\n  border-radius: 50%;\n  z-index: 2;\n  position: relative;\n  transition: all 300ms ease;\n  outline: none !important;\n  background-color: #6a6c6f !important;\n  transform: scale3d(0.7, 0.7, 1);\n}\nnav .nav-next:hover {\n  transform: scale3d(0.8, 0.8, 1);\n}\nnav .nav-next svg g {\n  fill: #FFF;\n}\nnav .steps {\n  position: relative;\n}\nnav .steps .steps-indic {\n  list-style: none;\n  position: absolute;\n  white-space: pre;\n  top: 5px;\n  right: -100px;\n  transition: transform 300ms;\n}\nnav .steps .steps-indic.step-1 {\n  transform: translateX(-20px);\n}\nnav .steps .steps-indic.step-2 {\n  transform: translateX(-60px);\n}\nnav .steps .steps-indic.step-3 {\n  transform: translateX(-100px);\n}\nnav .steps .steps-indic li {\n  background-color: #6a6c6f;\n  border-radius: 50%;\n  display: inline-block;\n  height: 40px;\n  width: 40px;\n  position: relative;\n  transform: scale(0.1);\n}\nnav .steps .steps-indic .current {\n  animation: grow 300ms;\n}\n@keyframes grow {\n  0% {\n    transform: scale(0.1);\n    opacity: 1;\n  }\n  99% {\n    opacity: 1;\n  }\n  100% {\n    transform: scale(1);\n    opacity: 0;\n  }\n}\n.limit-view {\n  width: 100%;\n  position: relative;\n}\n.limit-view:before {\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 20px;\n  background: linear-gradient(white, transparent);\n  z-index: 2;\n}\n.limit-view:after {\n  content: '';\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  height: 20px;\n  background: linear-gradient(transparent, white);\n  z-index: 2;\n}\n.limit-view .lv-list {\n  list-style: none;\n  padding: 20px 0;\n  overflow-y: auto;\n  height: 300px;\n  margin: 0;\n}\n.limit-view .lv-list .lv-item {\n  position: relative;\n}\n.limit-view .lv-list .lv-item:not(:first-child) {\n  padding-top: 5px;\n  margin-top: 5px;\n}\n.limit-view .lv-list .lv-item:not(:first-child):before {\n  content: '';\n  position: absolute;\n  top: 0;\n  right: 10px;\n  left: 58px;\n  height: 1px;\n  background-color: #e4e5e7;\n}\n.limit-view .lv-list .lv-item .-edit-btn {\n  opacity: 0;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  border: solid 1px #e4e5e7;\n  margin-right: 20px;\n  transition: all 200ms;\n}\n.limit-view .lv-list .lv-item .-edit-btn:hover {\n  background-color: #e4e5e7;\n}\n.limit-view .lv-list .lv-item:hover .-edit-btn {\n  opacity: 1;\n}\n", ""]);

	// exports


/***/ },

/***/ 505:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "nav[_v-98d7c628] {\n  background-color: #FB8C00 !important;\n}\n", ""]);

	// exports


/***/ },

/***/ 536:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(505);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-98d7c628&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./index.welcome.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-98d7c628&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./index.welcome.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 549:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(475);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(21)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/less-loader/index.js!./welcome.less", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/less-loader/index.js!./welcome.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 634:
/***/ function(module, exports) {

	module.exports = "\n<div class=\"welcome-container fx-col fx-center-center\" _v-98d7c628=\"\">\n  <div class=\"main-view\" _v-98d7c628=\"\">\n    <router-view v-ref:innercomp=\"\" _v-98d7c628=\"\"></router-view>\n\n    <nav class=\"fx-row fx-end-center\" _v-98d7c628=\"\">\n      <div class=\"steps\" _v-98d7c628=\"\">\n        <button @click=\"next\" type=\"button\" class=\"btn btn-link nav-next m-b-md\" _v-98d7c628=\"\">\n          <span _v-98d7c628=\"\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"25\" height=\"21\" viewBox=\"0 0 20 21\" version=\"1.1\" _v-98d7c628=\"\"><g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" _v-98d7c628=\"\"><g transform=\"translate(-708.000000, -1895.000000)\" fill=\"#000000\" _v-98d7c628=\"\"><g transform=\"translate(693.000000, 1878.000000)\" _v-98d7c628=\"\"><g transform=\"translate(7.000000, 17.000000)\" _v-98d7c628=\"\"><rect x=\"0.5\" y=\"9.5\" width=\"23\" height=\"2\" _v-98d7c628=\"\"></rect><path d=\"M22.8 11.2L22.8 9.8 13.8 18.8C13.4 19.2 13.4 19.9 13.8 20.2 14.2 20.6 14.8 20.6 15.2 20.2L24.2 11.2C24.6 10.8 24.6 10.2 24.2 9.8L15.3 0.8C14.9 0.4 14.3 0.4 13.9 0.8 13.5 1.2 13.5 1.8 13.9 2.2L22.8 11.2Z\" _v-98d7c628=\"\"></path></g></g></g></g>\n          </svg>\n          </span>\n        </button>\n        <ul class=\"p-none m-none steps-indic fx-row\" :class=\"[step.class]\" _v-98d7c628=\"\">\n          <li class=\"\" :class=\"{'current':step.class=='step-1'}\" _v-98d7c628=\"\"></li>\n          <li class=\"\" :class=\"{'current':step.class=='step-2'}\" _v-98d7c628=\"\"></li>\n          <li class=\"\" :class=\"{'current':step.class=='step-3'}\" _v-98d7c628=\"\"></li>\n        </ul>\n      </div>\n    </nav>\n\n  </div>\n</div>\n";

/***/ },

/***/ 696:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(536)
	__vue_script__ = __webpack_require__(441)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/welcome/index.welcome.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(634)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }

});