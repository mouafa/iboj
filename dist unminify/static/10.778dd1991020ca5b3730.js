webpackJsonp([10],{

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

/***/ 20:
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isMine = isMine;
	exports.isReady = isReady;
	exports.profileData = profileData;
	exports.profileAbout = profileAbout;
	exports.hasProfileExps = hasProfileExps;
	exports.profileExps = profileExps;
	exports.getActiveExp = getActiveExp;
	exports.hasprofileEdus = hasprofileEdus;
	exports.profileEdus = profileEdus;
	exports.getActiveEdu = getActiveEdu;
	exports.customSecs = customSecs;
	exports.getActiveSec = getActiveSec;
	exports.profileContact = profileContact;
	exports.profileFriendship = profileFriendship;
	exports.profileBadges = profileBadges;
	exports.profileRelationship = profileRelationship;
	exports.profileDegrees = profileDegrees;
	function isMine(state) {
	  if (state.account.data.id && state.profile.data.id) {
	    return state.account.data.id == state.profile.data.id;
	  }
	  return false;
	}

	function isReady(state) {
	  return state.profile.loaded;
	}

	function profileData(state) {
	  return state.profile.data;
	}

	function profileAbout(state) {
	  return state.profile.data.about;
	}

	function hasProfileExps(state) {
	  return state.profile.data.experience ? !!state.profile.data.experience.length : false;
	}

	function profileExps(state) {
	  return state.profile.data.experience;
	}

	function getActiveExp(state) {
	  return state.profile.activeExpData;
	}

	function hasprofileEdus(state) {
	  return state.profile.data.education ? !!state.profile.data.education.length : false;
	}

	function profileEdus(state) {
	  return state.profile.data.education;
	}

	function getActiveEdu(state) {
	  return state.profile.activeEduData;
	}

	function customSecs(state) {
	  return state.profile.data.customsectionscategories;
	}

	function getActiveSec(state) {
	  return state.profile.activeSecData;
	}

	function profileContact(state) {
	  return state.profile.contacts;
	}

	function profileFriendship(state) {
	  return state.profile.data.about.friendship;
	}

	function profileBadges(state) {
	  return state.profile.badges;
	}
	function profileRelationship(state) {
	  return state.profile.relationship;
	}
	function profileDegrees(state) {
	  return state.profile.degrees;
	}

/***/ },

/***/ 42:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Symbol = __webpack_require__(114)["default"];

	exports["default"] = function (obj) {
	  return obj && obj.constructor === _Symbol ? "symbol" : typeof obj;
	};

	exports.__esModule = true;

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

/***/ 51:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(124)
	__vue_script__ = __webpack_require__(112)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/shared/selector.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(125)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 92:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(123);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(21)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./tagmanager.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./tagmanager.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 103:
/***/ function(module, exports) {

	(function(c){var d={prefilled:null,CapitalizeFirstLetter:false,preventSubmitOnEnter:true,isClearInputOnEsc:true,externalTagId:false,prefillIdFieldName:"Id",prefillValueFieldName:"Value",AjaxPush:null,AjaxPushAllTags:null,AjaxPushParameters:null,delimiters:[9,13,44],backspace:[8],maxTags:0,hiddenTagListName:null,hiddenTagListId:null,replace:true,output:null,deleteTagsOnBackspace:true,tagsContainer:null,tagCloseIcon:"x",tagClass:"",validator:null,onlyTagList:false,tagList:null,fillInputOnTagRemove:false},a={pushTag:function(z,g,h){var y=c(this),r=y.data("opts"),l,e,x,v,j=y.data("tlis"),t=y.data("tlid"),s,p,q,k,n,A,f,o;z=b.trimTag(z,r.delimiterChars);if(!z||z.length<=0){return}if(r.onlyTagList&&undefined!==r.tagList){if(r.tagList){var m=r.tagList;c.each(m,function(i,B){m[i]=B.toLowerCase()});var u=c.inArray(z.toLowerCase(),m);if(-1===u){return}}}if(r.CapitalizeFirstLetter&&z.length>1){z=z.charAt(0).toUpperCase()+z.slice(1).toLowerCase()}if(r.validator&&!r.validator(z)){y.trigger("tm:invalid",z);return}if(r.maxTags>0&&j.length>=r.maxTags){return}l=false;e=jQuery.map(j,function(i){return i.toLowerCase()});s=c.inArray(z.toLowerCase(),e);if(-1!==s){l=true}if(l){y.trigger("tm:duplicated",z);if(r.blinkClass){for(var w=0;w<6;++w){c("#"+y.data("tm_rndid")+"_"+t[s]).queue(function(i){c(this).toggleClass(r.blinkClass);i()}).delay(100)}}else{c("#"+y.data("tm_rndid")+"_"+t[s]).stop().animate({backgroundColor:r.blinkBGColor_1},100).animate({backgroundColor:r.blinkBGColor_2},100).animate({backgroundColor:r.blinkBGColor_1},100).animate({backgroundColor:r.blinkBGColor_2},100).animate({backgroundColor:r.blinkBGColor_1},100).animate({backgroundColor:r.blinkBGColor_2},100)}}else{if(r.externalTagId===true){if(h===undefined){c.error("externalTagId is not passed for tag -"+z)}v=h}else{x=Math.max.apply(null,t);x=x===-Infinity?0:x;v=++x}if(!g){y.trigger("tm:pushing",[z,v])}j.push(z);t.push(v);if(!g){if(r.AjaxPush!==null&&r.AjaxPushAllTags==null){if(c.inArray(z,r.prefilled)===-1){c.post(r.AjaxPush,c.extend({tag:z},r.AjaxPushParameters))}}}p=y.data("tm_rndid")+"_"+v;q=y.data("tm_rndid")+"_Remover_"+v;k=c("<span/>").text(z).html();n='<span class="'+b.tagClasses.call(y)+'" id="'+p+'">';n+="<span>"+k+"</span>";n+='<a href="#" class="tm-tag-remove" id="'+q+'" TagIdToRemove="'+v+'">';n+=r.tagCloseIcon+"</a></span> ";A=c(n);if(r.tagsContainer!==null){c(r.tagsContainer).append(A)}else{if(t.length>1){o=y.siblings("#"+y.data("tm_rndid")+"_"+t[t.length-2]);o.after(A)}else{y.before(A)}}A.find("#"+q).on("click",y,function(B){B.preventDefault();var i=parseInt(c(this).attr("TagIdToRemove"));b.spliceTag.call(y,i,B.data)});b.refreshHiddenTagList.call(y);if(!g){y.trigger("tm:pushed",[z,v])}b.showOrHide.call(y)}y.val("")},popTag:function(){var i=c(this),g,f,h=i.data("tlis"),e=i.data("tlid");if(e.length>0){g=e.pop();f=h[h.length-1];i.trigger("tm:popping",[f,g]);h.pop();c("#"+i.data("tm_rndid")+"_"+g).remove();b.refreshHiddenTagList.call(i);i.trigger("tm:popped",[f,g])}},empty:function(){var h=c(this),g=h.data("tlis"),e=h.data("tlid"),f;while(e.length>0){f=e.pop();g.pop();c("#"+h.data("tm_rndid")+"_"+f).remove();b.refreshHiddenTagList.call(h)}h.trigger("tm:emptied",null);b.showOrHide.call(h)},tags:function(){var f=this,e=f.data("tlis");return e}},b={showOrHide:function(){var g=this,e=g.data("opts"),f=g.data("tlis");if(e.maxTags>0&&f.length<e.maxTags){g.show();g.trigger("tm:show")}if(e.maxTags>0&&f.length>=e.maxTags){g.hide();g.trigger("tm:hide")}},tagClasses:function(){var i=c(this),g=i.data("opts"),h=g.tagBaseClass,e=g.inputBaseClass,f;f=h;if(i.attr("class")){c.each(i.attr("class").split(" "),function(j,k){if(k.indexOf(e+"-")!==-1){f+=" "+h+k.substring(e.length)}})}f+=(g.tagClass?" "+g.tagClass:"");return f},trimTag:function(e,f){var g;e=c.trim(e);g=0;for(g;g<e.length;g++){if(c.inArray(e.charCodeAt(g),f)!==-1){break}}return e.substring(0,g)},refreshHiddenTagList:function(){var g=c(this),f=g.data("tlis"),e=g.data("lhiddenTagList");if(e){c(e).val(f.join(g.data("opts").baseDelimiter)).change()}g.trigger("tm:refresh",f.join(g.data("opts").baseDelimiter))},killEvent:function(f){f.cancelBubble=true;f.returnValue=false;f.stopPropagation();f.preventDefault()},keyInArray:function(g,f){return c.inArray(g.which,f)!==-1},applyDelimiter:function(f){var g=c(this);a.pushTag.call(g,c(this).val());f.preventDefault()},prefill:function(e){var g=c(this);var f=g.data("opts");c.each(e,function(h,i){if(f.externalTagId===true){a.pushTag.call(g,i[f.prefillValueFieldName],true,i[f.prefillIdFieldName])}else{a.pushTag.call(g,i,true)}})},pushAllTags:function(i,f){var j=c(this),g=j.data("opts"),h=j.data("tlis");if(g.AjaxPushAllTags){if(i.type!=="tm:pushed"||c.inArray(f,g.prefilled)===-1){c.post(g.AjaxPush,c.extend({tags:h.join(g.baseDelimiter)},g.AjaxPushParameters))}}},spliceTag:function(h){var j=this,i=j.data("tlis"),f=j.data("tlid"),e=c.inArray(h,f),g;if(-1!==e){g=i[e];j.trigger("tm:splicing",[g,h]);c("#"+j.data("tm_rndid")+"_"+h).remove();i.splice(e,1);f.splice(e,1);b.refreshHiddenTagList.call(j);j.trigger("tm:spliced",[g,h])}b.showOrHide.call(j)},init:function(e){var f=c.extend({},d,e),g,h;f.hiddenTagListName=(f.hiddenTagListName===null)?"hidden-"+this.attr("name"):f.hiddenTagListName;g=f.delimeters||f.delimiters;h=[9,13,17,18,19,37,38,39,40];f.delimiterChars=[];f.delimiterKeys=[];c.each(g,function(k,j){if(c.inArray(j,h)!==-1){f.delimiterKeys.push(j)}else{f.delimiterChars.push(j)}});f.baseDelimiter=String.fromCharCode(f.delimiterChars[0]||44);f.tagBaseClass="tm-tag";f.inputBaseClass="tm-input";if(!c.isFunction(f.validator)){f.validator=null}this.each(function(){var o=c(this),j="",n="",m="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";if(o.data("tagManager")){return false}o.data("tagManager",true);for(var l=0;l<5;l++){n+=m.charAt(Math.floor(Math.random()*m.length))}o.data("tm_rndid",n);o.data("opts",f).data("tlis",[]).data("tlid",[]);if(f.output===null){j=c("<input/>",{type:"hidden",name:f.hiddenTagListName});o.after(j);o.data("lhiddenTagList",j)}else{o.data("lhiddenTagList",c(f.output))}if(f.AjaxPushAllTags){o.on("tm:spliced",b.pushAllTags);o.on("tm:popped",b.pushAllTags);o.on("tm:pushed",b.pushAllTags)}o.on("focus keypress",function(i){if(c(this).popover){c(this).popover("hide")}});if(f.isClearInputOnEsc){o.on("keyup",function(i){if(i.which===27){c(this).val("");b.killEvent(i)}})}o.on("keypress",function(i){if(b.keyInArray(i,f.delimiterChars)){b.applyDelimiter.call(o,i)}});o.on("keydown",function(i){if(i.which===13){if(f.preventSubmitOnEnter){b.killEvent(i)}}if(b.keyInArray(i,f.delimiterKeys)){b.applyDelimiter.call(o,i)}});if(f.deleteTagsOnBackspace){o.on("keydown",function(i){if(b.keyInArray(i,f.backspace)){if(c(this).val().length<=0){a.popTag.call(o);b.killEvent(i)}}})}if(f.fillInputOnTagRemove){o.on("tm:popped",function(p,i){c(this).val(i)})}o.change(function(i){if(!/webkit/.test(navigator.userAgent.toLowerCase())){o.focus()}b.killEvent(i)});if(f.prefilled!==null){if(typeof(f.prefilled)==="object"){b.prefill.call(o,f.prefilled)}else{if(typeof(f.prefilled)==="string"){b.prefill.call(o,f.prefilled.split(f.baseDelimiter))}else{if(typeof(f.prefilled)==="function"){b.prefill.call(o,f.prefilled())}}}}else{if(f.output!==null){if(c(f.output)&&c(f.output).val()){var k=c(f.output)}b.prefill.call(o,c(f.output).val().split(f.baseDelimiter))}}});return this}};c.fn.tagsManager=function(f){var e=c(this);if(!(0 in this)){return this}if(a[f]){return a[f].apply(e,Array.prototype.slice.call(arguments,1))}else{if(typeof f==="object"||!f){return b.init.apply(this,arguments)}else{c.error("Method "+f+" does not exist.");return false}}}}(jQuery));

/***/ },

/***/ 107:
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  props: {
	    id: {
	      type: String
	    },
	    sincemonth: {
	      type: Number,
	      twoWay: true
	    },
	    sinceyear: {
	      type: Number,
	      twoWay: true
	    },
	    untilmonth: {
	      type: Number,
	      twoWay: true
	    },
	    untilyear: {
	      type: Number,
	      twoWay: true
	    },
	    iscurrent: {
	      type: Boolean,
	      twoWay: true,
	      default: true
	    },

	    description: {
	      type: String,
	      twoWay: true
	    },
	    tags: {
	      type: Array
	    },
	    error: {}
	  }
	};

/***/ },

/***/ 111:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },

/***/ 112:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var connector = __webpack_require__(3);

	module.exports = {
	  data: function data() {
	    return {
	      term: '',
	      selected: null,
	      results: [],
	      showme: false,
	      clickOut: null,
	      isOver: true
	    };
	  },
	  computed: {
	    showmenu: function showmenu() {
	      return this.term.length > 0 && (this.results.length > 0 && this.showme || this.insertable);
	    }
	  },
	  props: {
	    endpoint: {
	      type: String,
	      require: true
	    },
	    value: {
	      twoWay: true
	    },
	    max: {
	      type: Number
	    },
	    label: {
	      type: String,
	      require: true
	    },
	    free: {
	      type: Boolean,
	      default: true
	    },
	    img: {
	      type: String,
	      default: null
	    },
	    name: {
	      type: Function,
	      default: function _default(e) {
	        return e ? e.name : 'undefined';
	      }
	    },
	    selectable: {
	      type: Boolean,
	      default: true
	    },
	    insertable: {
	      type: Boolean,
	      default: false
	    },
	    insert: {
	      type: Function,
	      default: function _default(e) {}
	    }
	  },
	  created: function created() {
	    var that = this;
	    this.clickOut = function (event) {
	      if ($(event.target).closest('#autocomplitmenu').length) return true;
	      that.close(null);
	    };
	    this.$watch('value', function (val) {
	      if (typeof val == 'string') return;
	      this.selected = val;
	      this.showme = false;
	      this.term = '';
	    });
	    $('#autocomplitmenu').on('mouseenter', function () {
	      that.isOver = true;
	      console.log('over');
	    });
	    $('#autocomplitmenu').on('mouseleave', function () {
	      console.log('leave');
	      that.isOver = false;
	    });
	  },
	  methods: {
	    setFocusOnInput: function setFocusOnInput(event) {
	      $(event.target).siblings('.autocomplete-input').focus();
	    },
	    menuOut: function menuOut() {
	      this.isOver = true;
	    },
	    menuin: function menuin() {
	      this.isOver = false;
	    },
	    close: function close(e) {
	      var that = this;
	      if (this.isOver) {
	        that.showme = false;
	        $(document).unbind('click', that.clickOut);
	        if (that.free && !that.selected) that.value = that.term;else that.term = '';
	      }
	    },
	    select: function select(item) {
	      this.selected = item;
	      this.value = item;
	      this.showme = false;
	      this.term = this.name(item);
	      this.$dispatch('selector:selected:item', item);
	      $(document).unbind('click', this.clickOut);
	    },
	    reset: function reset() {
	      this.showme = false;
	      this.value = null;
	      this.term = '';
	      this.selected = null;
	    },
	    change: function change(e) {
	      var that = this;
	      this.results = [];
	      if (e.keyCode == 27) {
	        this.showme = false;
	        return;
	      }
	      if (this.term.trim().length < 1 || !this.endpoint) {
	        this.value = this.term;
	        this.showme = false;
	        return;
	      }
	      connector.apiCall({
	        limit: this.max || 10,
	        term: this.term.toLowerCase().trim()
	      }, this.endpoint, 'GET', function (error, data) {
	        if (error) return console.warn(error);
	        if (data.length) {
	          that.results = data;
	          that.showme = true;
	          $(document).bind('click', that.clickOut);
	        } else {
	          if (that.free && !that.selected) that.value = that.term;
	        }
	      });
	    }
	  }
	};

/***/ },

/***/ 114:
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(115), __esModule: true };

/***/ },

/***/ 115:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(121);
	__webpack_require__(159);
	module.exports = __webpack_require__(50).Symbol;

/***/ },

/***/ 116:
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var $ = __webpack_require__(14);
	module.exports = function(it){
	  var keys       = $.getKeys(it)
	    , getSymbols = $.getSymbols;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = $.isEnum
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
	  }
	  return keys;
	};

/***/ },

/***/ 118:
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(38)
	  , getNames  = __webpack_require__(14).getNames
	  , toString  = {}.toString;

	var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return getNames(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	module.exports.get = function getOwnPropertyNames(it){
	  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
	  return getNames(toIObject(it));
	};

/***/ },

/***/ 119:
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(130);
	module.exports = Array.isArray || function(arg){
	  return cof(arg) == 'Array';
	};

/***/ },

/***/ 120:
/***/ function(module, exports, __webpack_require__) {

	var $         = __webpack_require__(14)
	  , toIObject = __webpack_require__(38);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = $.getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },

/***/ 121:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var $              = __webpack_require__(14)
	  , global         = __webpack_require__(108)
	  , has            = __webpack_require__(141)
	  , DESCRIPTORS    = __webpack_require__(133)
	  , $export        = __webpack_require__(117)
	  , redefine       = __webpack_require__(144)
	  , $fails         = __webpack_require__(134)
	  , shared         = __webpack_require__(157)
	  , setToStringTag = __webpack_require__(135)
	  , uid            = __webpack_require__(158)
	  , wks            = __webpack_require__(61)
	  , keyOf          = __webpack_require__(120)
	  , $names         = __webpack_require__(118)
	  , enumKeys       = __webpack_require__(116)
	  , isArray        = __webpack_require__(119)
	  , anObject       = __webpack_require__(127)
	  , toIObject      = __webpack_require__(38)
	  , createDesc     = __webpack_require__(143)
	  , getDesc        = $.getDesc
	  , setDesc        = $.setDesc
	  , _create        = $.create
	  , getNames       = $names.get
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , setter         = false
	  , HIDDEN         = wks('_hidden')
	  , isEnum         = $.isEnum
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , useNative      = typeof $Symbol == 'function'
	  , ObjectProto    = Object.prototype;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(setDesc({}, 'a', {
	    get: function(){ return setDesc(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = getDesc(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  setDesc(it, key, D);
	  if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
	} : setDesc;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol.prototype);
	  sym._k = tag;
	  DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
	    configurable: true,
	    set: function(value){
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    }
	  });
	  return sym;
	};

	var isSymbol = function(it){
	  return typeof it == 'symbol';
	};

	var $defineProperty = function defineProperty(it, key, D){
	  if(D && has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))setDesc(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return setDesc(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key);
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
	    ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  var D = getDesc(it = toIObject(it), key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
	  return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
	  return result;
	};
	var $stringify = function stringify(it){
	  if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	  var args = [it]
	    , i    = 1
	    , $$   = arguments
	    , replacer, $replacer;
	  while($$.length > i)args.push($$[i++]);
	  replacer = args[1];
	  if(typeof replacer == 'function')$replacer = replacer;
	  if($replacer || !isArray(replacer))replacer = function(key, value){
	    if($replacer)value = $replacer.call(this, key, value);
	    if(!isSymbol(value))return value;
	  };
	  args[1] = replacer;
	  return _stringify.apply($JSON, args);
	};
	var buggyJSON = $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	});

	// 19.4.1.1 Symbol([description])
	if(!useNative){
	  $Symbol = function Symbol(){
	    if(isSymbol(this))throw TypeError('Symbol is not a constructor');
	    return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
	  };
	  redefine($Symbol.prototype, 'toString', function toString(){
	    return this._k;
	  });

	  isSymbol = function(it){
	    return it instanceof $Symbol;
	  };

	  $.create     = $create;
	  $.isEnum     = $propertyIsEnumerable;
	  $.getDesc    = $getOwnPropertyDescriptor;
	  $.setDesc    = $defineProperty;
	  $.setDescs   = $defineProperties;
	  $.getNames   = $names.get = $getOwnPropertyNames;
	  $.getSymbols = $getOwnPropertySymbols;

	  if(DESCRIPTORS && !__webpack_require__(142)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	}

	var symbolStatics = {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    return keyOf(SymbolRegistry, key);
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	};
	// 19.4.2.2 Symbol.hasInstance
	// 19.4.2.3 Symbol.isConcatSpreadable
	// 19.4.2.4 Symbol.iterator
	// 19.4.2.6 Symbol.match
	// 19.4.2.8 Symbol.replace
	// 19.4.2.9 Symbol.search
	// 19.4.2.10 Symbol.species
	// 19.4.2.11 Symbol.split
	// 19.4.2.12 Symbol.toPrimitive
	// 19.4.2.13 Symbol.toStringTag
	// 19.4.2.14 Symbol.unscopables
	$.each.call((
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
	  'species,split,toPrimitive,toStringTag,unscopables'
	).split(','), function(it){
	  var sym = wks(it);
	  symbolStatics[it] = useNative ? sym : wrap(sym);
	});

	setter = true;

	$export($export.G + $export.W, {Symbol: $Symbol});

	$export($export.S, 'Symbol', symbolStatics);

	$export($export.S + $export.F * !useNative, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!useNative || buggyJSON), 'JSON', {stringify: $stringify});

	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },

/***/ 122:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".autocomplite .list[_v-d2d98dc8] {\n  display: block;\n  position: absolute;\n  z-index: 998;\n  background: white;\n  width: 100%;\n  padding-left: 10px;\n  max-width: 570px;\n  max-height: 200px;\n  overflow-y: scroll;\n  overflow-x: none;\n  margin-top: 0px;\n}\n.autocomplite .list li[_v-d2d98dc8] {\n  list-style: none;\n}\n.sticker[_v-d2d98dc8] {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n}\n.wrrap[_v-d2d98dc8] {\n  display: inline-block;\n  max-width: 180px;\n}\n", ""]);

	// exports


/***/ },

/***/ 123:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*\n * DO NOT EDIT THIS FILE DIRECTLY\n * Compiled from bootstrap-tagmanager.less based on Bootstrap 2.3.1 variables\n * https://github.com/twitter/bootstrap/blob/master/less/variables.less\n */\n.tm-tag {\n  color: #4594b5;\n  background-color: #c5eefa;\n  background-color: #e0eaf1;\n  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset;\n  display: inline-block;\n  border-radius: 3px;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 13px;\n  margin: 4px 4px 4px 2px;\n  padding: 3px;\n  text-decoration: none;\n  transition: border 0.2s linear 0s, box-shadow 0.2s linear 0s;\n  -moz-transition: border 0.2s linear 0s, box-shadow 0.2s linear 0s;\n  -webkit-transition: border 0.2s linear 0s, box-shadow 0.2s linear 0s;\n  vertical-align: middle;\n}\n.tm-tag .tm-tag-remove {\n  color: #000000;\n  font-weight: bold;\n  margin-left: 4px;\n  opacity: 0.2;\n}\n.tm-tag .tm-tag-remove:hover {\n  color: #000000;\n  text-decoration: none;\n  opacity: 0.4;\n}\n.tm-tag.tm-tag-warning {\n  color: #945203;\n  background-color: #f2c889;\n  border-color: #f0a12f;\n}\n.tm-tag.tm-tag-error {\n  color: #84212e;\n  background-color: #e69ca6;\n  border-color: #d24a5d;\n}\n.tm-tag.tm-tag-success {\n  color: #638421;\n  background-color: #cde69c;\n  border-color: #a5d24a;\n}\n.tm-tag.tm-tag-info {\n  color: #4594b5;\n  background-color: #c5eefa;\n  border-color: #5dc8f7;\n}\n.tm-tag.tm-tag-inverse {\n  color: #cccccc;\n  background-color: #555555;\n  border-color: #333333;\n  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2) inset;\n}\n.tm-tag.tm-tag-inverse .tm-tag-remove {\n  color: #ffffff;\n}\n.tm-tag.tm-tag-large {\n  font-size: 16.25px;\n  border-radius: 4px;\n  padding: 11px 7px;\n}\n.tm-tag.tm-tag-small {\n  font-size: 11.049999999999999px;\n  border-radius: 3px;\n  padding: 2px 4px;\n}\n.tm-tag.tm-tag-mini {\n  font-size: 9.75px;\n  border-radius: 2px;\n  padding: 0px 2px;\n}\n.tm-tag.tm-tag-plain {\n  color: #333333;\n  box-shadow: none;\n  background: none;\n  border: none;\n}\n.tm-tag.tm-tag-disabled {\n  color: #aaaaaa;\n  background-color: #e6e6e6;\n  border-color: #cccccc;\n  box-shadow: none;\n}\n.tm-tag.tm-tag-disabled .tm-tag-remove {\n  display: none;\n}\ninput[type=\"text\"].tm-input {\n  margin-bottom: 5px;\n  vertical-align: middle !important;\n  max-width: 100px;\n}\n.control-group.tm-group {\n  margin-bottom: 5px;\n}\n.form-horizontal .control-group.tm-group {\n  margin-bottom: 15px;\n}\n", ""]);

	// exports


/***/ },

/***/ 124:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(122);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-d2d98dc8&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./selector.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-d2d98dc8&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./selector.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 125:
/***/ function(module, exports) {

	module.exports = "\n<div _v-d2d98dc8=\"\">\n  <div class=\"m-none autocomplite\" v-if=\"!selected || !selectable\" _v-d2d98dc8=\"\">\n    <div class=\"input-field p-none m-none\" _v-d2d98dc8=\"\">\n      <label @click=\"setFocusOnInput\" class=\"required\" _v-d2d98dc8=\"\">{{label}}</label>\n      <input class=\"autocomplete-input\" @focusout=\"close\" @keyup=\"change\" maxlength=\"60\" type=\"text\" v-model=\"term\" _v-d2d98dc8=\"\">\n\n    </div>\n    <ul v-if=\"showmenu\" class=\"border list\" id=\"autocomplitmenu\" _v-d2d98dc8=\"\">\n      <li @click=\"select(item)\" @mouseenter=\"menuin\" @mouseleave=\"menuOut\" class=\"hand\" track-by=\"$index\" v-for=\"item in results\" _v-d2d98dc8=\"\">\n        <div class=\"border-top fx-row fx-start-center  \" _v-d2d98dc8=\"\">\n          <img :src=\"item[img]\" alt=\"logo\" :class=\"{'img-circle' : endpoint !='/companies' &amp;&amp; endpoint !='/schools'}\" class=\"img-handler img-rounded size-32 m-t-sm m-b-sm\" v-if=\"img\" _v-d2d98dc8=\"\">\n          <div class=\"inline-block size-16\" v-else=\"\" _v-d2d98dc8=\"\"></div>\n          <span class=\"wrrap p-l-xs\" _v-d2d98dc8=\"\">{{{ name(item) }}}</span>\n        </div>\n      </li>\n      <li @click=\"insert\" @mouseenter=\"menuin\" @mouseleave=\"menuOut\" class=\"hand\" v-if=\"insertable\" _v-d2d98dc8=\"\">\n        <div class=\"border-top p-xs\" _v-d2d98dc8=\"\">\n          <div class=\"inline-block size-16\" _v-d2d98dc8=\"\">\n             <i class=\"material-icons\" _v-d2d98dc8=\"\">add</i>\n          </div>\n          <span class=\"wrrap p-l-xs capital\" v-ii18n=\"addNew\" _v-d2d98dc8=\"\">addNew</span>\n        </div>\n      </li>\n    </ul>\n  </div>\n  <div v-else=\"\" class=\"p-xxs\" _v-d2d98dc8=\"\">\n    <div class=\"border  p-xxs  bg-white-smoke sticker\" _v-d2d98dc8=\"\">\n      <img :src=\"selected ? selected[img] : ''\" alt=\"logo\" :class=\"{'img-circle' : endpoint !='/companies' &amp;&amp; endpoint !='/schools'}\" class=\"img-handler img-rounded size-32 m-l-xs\" v-if=\"img\" _v-d2d98dc8=\"\">\n      <div class=\"size-32 inline-block\" v-else=\"\" _v-d2d98dc8=\"\"></div>\n      <span class=\"font-1-2 p-l-xs\" _v-d2d98dc8=\"\">{{{name(selected)}}}</span>\n      <span @click=\"reset\" class=\"size-16  inline-block hand font-bold\" _v-d2d98dc8=\"\">x</span>\n    </div>\n  </div>\n</div>\n";

/***/ },

/***/ 129:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _promise = __webpack_require__(9);

	var _promise2 = _interopRequireDefault(_promise);

	var _notifsCenter = __webpack_require__(13);

	var _notifsCenter2 = _interopRequireDefault(_notifsCenter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var connector = __webpack_require__(3);
	var modal = __webpack_require__(12);

	module.exports = {
	  data: function data() {
	    return {
	      company: new Company(),
	      isLoading: false,
	      showModal: false,
	      isImageLoading: false
	    };
	  },
	  components: {
	    modal: modal
	  },
	  computed: {
	    remainChars: function remainChars() {
	      if (this.company.description && this.company.description.length) {
	        return 100 - this.company.description.split('\n').join('  ').length;
	      } else return 100;
	    }
	  },
	  methods: {
	    showme: function showme() {
	      this.showModal = true;
	    },
	    reset: function reset() {
	      this.company = new Company();
	    },
	    save: function save() {
	      var that = this;
	      this.isLoading = true;
	      this.company.save().then(function (company) {
	        that.isLoading = false;
	        that.$dispatch('addcompany:added', company);
	        that.reset();
	        that.showModal = false;
	      }).catch(function (err) {
	        _notifsCenter2.default.error(err);
	        that.isLoading = false;
	      });
	    },
	    cancel: function cancel() {
	      this.reset();
	      this.showModal = false;
	    },
	    uploadImage: function uploadImage() {
	      var that = this;
	      this.isImageLoading = true;
	      var dialog = window.uploadcare.openDialog(null, {
	        imagesOnly: true,
	        crop: '300x300'
	      }).done(function (file) {
	        file.done(function (fileInfo) {
	          that.company.logo = fileInfo.cdnUrl;
	          that.isImageLoading = false;
	        }).fail(function (error, fileInfo) {
	          that.isImageLoading = false;
	          console.warn(error);
	        });
	      });
	      dialog.fail(function () {
	        that.isImageLoading = false;
	      });
	    }
	  }
	};
	var Company = function Company() {
	  this.id = null;
	  this.name = '';
	  this.url = '';
	  this.logo = '';
	  this.description = '';

	  this.address = '';
	  this.city = '';
	  this.country = '';
	  this.zipcode = '';
	  this.region = '';

	  this.phone = '';
	  this.email = '';

	  var self = this;

	  this.toJSON = function () {
	    var object = {
	      name: self.name,
	      url: self.url,
	      logo: self.logo,
	      description: self.description,
	      address: self.address,
	      city: self.city,
	      country: self.country,
	      zipcode: self.zipcode,
	      region: self.region,
	      phone: self.phone,
	      email: self.email
	    };
	    if (self.id) {
	      object['id'] = self.id;
	    }
	    return object;
	  };
	  this.validate = function () {
	    return new _promise2.default(function (resolve, reject) {
	      if (!self.name) {
	        reject('Name missing');
	      } else if (!self.country) {
	        reject('country missing');
	      } else if (!self.validEmail()) {
	        reject('Invalid email');
	      } else if (!self.validPhone()) {
	        reject('invalid phone');
	      } else {
	        resolve();
	      }
	    });
	  };
	  this.validEmail = function () {
	    if (!self.email) return true;
	    var re = /^(([^<>()\[\]\\.,:\s@']+(\.[^<>()\[\]\\.,:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(self.email);
	  };
	  this.validPhone = function () {
	    if (!self.phone) return true;
	    var re = /^[\d\-\(\)\+]*$/g;
	    return re.test(self.phone) && self.phone.length > 6;
	  };
	  this.save = function () {
	    return new _promise2.default(function (resolve, reject) {
	      self.validate().then(function () {
	        connector.apiAsync('POST', '/companies', self.toJSON()).then(resolve).catch(function (_ref) {
	          var responseJSON = _ref.responseJSON;
	          return reject(responseJSON.msg);
	        });
	      }).catch(function (err) {
	        reject(err);
	      });
	    });
	  };
	};

/***/ },

/***/ 131:
/***/ function(module, exports) {

	module.exports = "\n<modal v-if=\"showModal\" :show.sync=\"showModal\">\n    <div class=\"p-sm panel-heading m-t-md\" slot=\"header\">\n         <i class=\"material-icons\">&#xEB3F;</i> <span class=\"m-l-sm capital\" v-ii18n=\"addCompany\">add Company</span>\n    </div>\n    <div class=\"p-l-sm p-r-sm m-b-md row\" slot=\"body\">\n        <div class=\"col s2\">\n            <div @click=\"uploadImage\" title=\"Logo Of Company\" class=\"cd-timeline-img cd-picture size-64 hand uploader\" :class=\"{'progress' : isImageLoading}\">\n                <img :src=\"company.logo\" class=\"uploader size-64 company-logo\" alt=\"company logo\"/>\n            </div>\n        </div>\n        <div class=\"row col s10\">\n            <div class=\"col s6\">\n              <div class=\"m-r-lg input-field\">\n                <label for=\"name\" class=\"required\">Company name</label>\n                <input type=\"text\"  id=\"name\" v-model=\"company.name\"  maxlength=\"64\" name=\"title\">\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"Company\" v-model=\"company.url\"  maxlength=\"64\" name=\"url\">\n                <label for=\"Company\">Company url </label>\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"email\" v-model=\"company.email\"  maxlength=\"64\" name=\"email\">\n                <label for=\"email\">Company email </label>\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"phone\" v-model=\"company.phone\"  maxlength=\"16\" name=\"Phone\">\n                <label for=\"phone\">Company phone </label>\n              </div>\n            </div>\n            <div class=\"col s6\">\n               <div class=\"m-r-lg input-field\">\n                <label for=\"country\" class=\"required\">Country</label>\n                <input type=\"text\"  id=\"country\" v-model=\"company.country\"  maxlength=\"32\" name=\"country\">\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"address\" v-model=\"company.address\" maxlength=\"32\" name=\"address\">\n                <label for=\"address\">Address </label>\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"city\" v-model=\"company.city\"  maxlength=\"32\" name=\"city\">\n                <label for=\"city\">City </label>\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"region\" v-model=\"company.region\"  maxlength=\"32\" name=\"region\">\n                <label for=\"region\">Region </label>\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"zipcode\" v-model=\"company.zipcode\" maxlength=\"16\" name=\"zipcode\">\n                <label for=\"zipcode\">zipcode </label>\n              </div>\n            </div>\n        </div>\n        <div class=\"row\">\n          <div class=\"input-field col s12\">\n            <textarea id=\"description\" class=\"materialize-textarea\"v-model=\"company.description\" maxlength=\"100\" name=\"description\"></textarea>\n            <label for=\"description\">Description</label>\n          </div>\n         <div class=\" font-8 text-warning pull-right\">{{remainChars}}</div>\n       </div>\n    </div>\n    <div slot=\"footer\" class=\"m-r-md m-t-sm row p-xs \">\n        <div class=\"pull-right\">\n            <button @click=\"cancel\" :disabled=\"isLoading\" class=\"font-light btn-flat text-white hand font-8 uppercase\" name=\"cancel\" v-ii18n=\"cancel\">cancel</button>\n            <button @click=\"save\" :disabled=\"isLoading\" class=\"w-xs font-light btn btn-success m-l-md font-8 uppercase\" name=\"save\"  v-ii18n=\"save\">save</button>\n        </div>\n    </div>\n</modal>\n";

/***/ },

/***/ 132:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(129)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/shared/add_company.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(131)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 137:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof2 = __webpack_require__(42);

	var _typeof3 = _interopRequireDefault(_typeof2);

	var _notifsCenter = __webpack_require__(13);

	var _notifsCenter2 = _interopRequireDefault(_notifsCenter);

	var _actions = __webpack_require__(11);

	var _getters = __webpack_require__(20);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _ = __webpack_require__(111);
	__webpack_require__(103);
	__webpack_require__(92);
	var modal = __webpack_require__(12);
	var selector = __webpack_require__(51);
	var addschool = __webpack_require__(154);


	module.exports = {
	  mixins: __webpack_require__(107),
	  vuex: {
	    getters: {
	      degrees: _getters.profileDegrees
	    },
	    actions: {
	      saveActiveEdu: _actions.saveActiveEdu,
	      deleteActiveEdu: _actions.deleteActiveEdu,
	      addNewEdu: _actions.addNewEdu,
	      cancelActiveEdu: _actions.cancelActiveEdu,
	      loadDegrees: _actions.loadDegrees
	    }
	  },
	  data: function data() {
	    return {
	      school: null,
	      degree_id: null,
	      isLoading: false,
	      showModal: false,
	      iseditmode: false,
	      isCurrent: false,
	      untilMonth: null,
	      untilYear: null,
	      sinceMonth: null,
	      sinceYear: null,
	      description: null,
	      error: '',
	      tags: []
	    };
	  },

	  components: {
	    modal: modal,
	    selector: selector,
	    addschool: addschool
	  },
	  computed: {
	    until: {
	      get: function get() {
	        var _date = new Date();
	        _date.setFullYear(this.untilYear);
	        _date.setMonth(this.untilMonth - 1);
	        _date.setDate(1);
	        return _date.toISOString().slice(0, 10);
	      },
	      set: function set(newValue) {
	        if (newValue) {
	          var until = new Date(newValue);
	          this.untilMonth = until ? until.getMonth() + 1 : '';
	          this.untilYear = until ? until.getFullYear() : '';
	        }
	      }
	    },
	    since: {
	      get: function get() {
	        var _date = new Date();
	        _date.setFullYear(this.sinceYear);
	        _date.setMonth(this.sinceMonth - 1);
	        _date.setDate(1);
	        return _date.toISOString().slice(0, 10);
	      },
	      set: function set(newValue) {
	        var since = newValue ? new Date(newValue) : null;
	        this.sinceMonth = since ? since.getMonth() + 1 : '';
	        this.sinceYear = since ? since.getFullYear() : '';
	      }
	    },
	    skills: {
	      get: function get() {
	        return this.tags ? this.tags.join(',') : '';
	      }
	    },
	    remainChars: function remainChars() {
	      if (this.description && this.description.length) return 240 - this.description.split('\n').join('  ').length;else return 240;
	    }
	  },
	  ready: function ready() {
	    this.loadDegrees();
	    var vm = this;
	    $('#skillsEducation').tagsManager({
	      initialCap: true,
	      backspaceChars: [8],
	      delimiterChars: [13, 44, 188]
	    });
	    $('#skillsEducation').on('tm:pushed', function (e, tag) {
	      vm.tags.push(tag);
	    });
	    $('#skillsEducation').on('tm:popped', function (e, tag) {
	      vm.tags.$remove(tag);
	    });
	    $('#skillsEducation').on('tm:spliced', function (e, tag) {
	      vm.tags.$remove(tag);
	    });
	    this.$on('addschool:added', function (school) {
	      vm.school = school;
	    });
	  },

	  methods: {
	    new: function _new() {
	      this.reset();
	      this.showModal = true;
	    },
	    addSchool: function addSchool() {
	      this.$refs.schooleditor.showme();
	    },
	    reset: function reset() {
	      this.description = this.error = this.untilYear = this.untilMonth = this.sinceMonth = this.sinceYear = '';
	      this.school = this.degree_id = null;
	      this.iseditmode = false;
	      this.id = null;
	      this.isLoading = false;
	      this.iseditmode = false;
	      this.tags = [];
	      this.id = null;
	      $('#skillsEducation').tagsManager('empty');
	    },
	    save: function save() {
	      var vm = this;
	      var invalidUntil = this.untilMonth && !this.untilYear || !this.untilMonth && this.untilYear;

	      if (!this.school || !this.degree_id || !this.sinceYear || !this.sinceMonth || invalidUntil) {
	        return _notifsCenter2.default.warn('Missing Required Fields');
	      }

	      if (this.since >= this.until) {
	        return _notifsCenter2.default.warn('The dates you entered are off');
	      }

	      this.isLoading = true;

	      var data = _.pick(this, 'id', 'degree_id', 'since', 'until', 'description', 'skills');
	      if ((0, _typeof3.default)(this.school) == 'object') data.school_id = this.school.id;else data.school_name = this.school;

	      this.isLoading = true;
	      if (this.iseditmode) {
	        this.saveActiveEdu(data).then(function () {
	          vm.isLoading = false;
	          vm.showModal = false;
	          vm.reset();
	        }).catch(function () {
	          vm.isLoading = false;
	        });
	      } else {
	        this.addNewEdu(data).then(function () {
	          vm.isLoading = false;
	          vm.showModal = false;
	          vm.reset();
	        }).catch(function () {
	          vm.isLoading = false;
	        });
	      }
	    },
	    cancel: function cancel() {
	      this.cancelActiveEdu();
	      this.reset();
	      this.showModal = false;
	    },
	    edit: function edit(record) {
	      for (var k in record) {
	        if (typeof record[k] == 'string') this[k] = record[k];
	      }
	      this.id = record.id;
	      this.iseditmode = true;
	      this.school = record.school;
	      this.degree_id = record.degree_id;
	      _.map(record.skills, function (skill) {
	        $('#skillsEducation').tagsManager('pushTag', skill.name.trim());
	      });
	      this.showModal = true;
	    },
	    delete: function _delete() {
	      var vm = this;
	      this.deleteActiveEdu().then(function () {
	        vm.isLoading = false;
	        vm.showModal = false;
	        vm.reset();
	      });
	    }
	  }
	};

/***/ },

/***/ 138:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof2 = __webpack_require__(42);

	var _typeof3 = _interopRequireDefault(_typeof2);

	var _notifsCenter = __webpack_require__(13);

	var _notifsCenter2 = _interopRequireDefault(_notifsCenter);

	var _actions = __webpack_require__(11);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _ = __webpack_require__(111);
	__webpack_require__(103);
	__webpack_require__(92);
	var modal = __webpack_require__(12);
	var selector = __webpack_require__(51);
	var addcompany = __webpack_require__(132);


	module.exports = {
	  mixins: __webpack_require__(107),
	  vuex: {
	    actions: {
	      saveActiveExp: _actions.saveActiveExp,
	      deleteActiveExp: _actions.deleteActiveExp,
	      addNewExp: _actions.addNewExp,
	      cancelActiveExp: _actions.cancelActiveExp
	    }
	  },
	  data: function data() {
	    return {
	      title: null,
	      isLoading: false,
	      showModal: false,
	      iseditmode: false,
	      current: null,
	      untilMonth: null,
	      untilYear: null,
	      sinceMonth: null,
	      sinceYear: null,
	      description: null,
	      error: '',
	      tags: [],
	      company: null
	    };
	  },
	  components: {
	    modal: modal,
	    selector: selector,
	    addcompany: addcompany
	  },
	  computed: {
	    until: {
	      get: function get() {
	        var _date = new Date();
	        _date.setFullYear(this.untilYear);
	        _date.setMonth(this.untilMonth - 1);
	        _date.setDate(1);
	        return _date.toISOString().slice(0, 10);
	      },

	      set: function set(newValue) {
	        if (newValue) {
	          var until = new Date(newValue);
	          this.untilMonth = until && until.getFullYear() < 2099 ? until.getMonth() + 1 : '';
	          this.untilYear = until && until.getFullYear() < 2099 ? until.getFullYear() : '';
	        }
	      }
	    },
	    since: {
	      get: function get() {
	        var _date = new Date();
	        _date.setFullYear(this.sinceYear);
	        _date.setMonth(this.sinceMonth - 1);
	        _date.setDate(1);
	        return _date.toISOString().slice(0, 10);
	      },

	      set: function set(newValue) {
	        var since = newValue ? new Date(newValue) : null;
	        this.sinceMonth = since ? since.getMonth() + 1 : '';
	        this.sinceYear = since ? since.getFullYear() : '';
	      }
	    },
	    skills: {
	      get: function get() {
	        return this.tags ? this.tags.join(',') : '';
	      }
	    },
	    remainChars: function remainChars() {
	      if (this.description && this.description.length) return 240 - this.description.split('\n').join('  ').length;else return 240;
	    }
	  },
	  ready: function ready() {
	    var vm = this;
	    $('#skillsExperience').tagsManager({
	      initialCap: true,
	      backspaceChars: [8],
	      delimiterChars: [13, 44, 188]
	    });
	    $('#skillsExperience').on('tm:pushed', function (e, tag) {
	      vm.tags.push(tag);
	    });
	    $('#skillsExperience').on('tm:popped', function (e, tag) {
	      vm.tags.$remove(tag);
	    });
	    $('#skillsExperience').on('tm:spliced', function (e, tag) {
	      vm.tags.$remove(tag);
	    });
	    this.$on('addcompany:added', function (comp) {
	      vm.company = comp;
	    });
	  },
	  methods: {
	    new: function _new() {
	      this.reset();
	      this.showModal = true;
	    },

	    addCompany: function addCompany() {
	      this.$refs.companyeditor.showme();
	    },
	    reset: function reset() {
	      if (this.tags.length) $('#skillsExperience').tagsManager('empty');
	      this.title = this.description = this.error = this.untilYear = this.untilMonth = this.sinceMonth = this.sinceYear = '';
	      this.company = null;
	      this.iseditmode = false;
	      this.id = null;
	      this.current = true;
	      this.isLoading = false;
	      this.tags = [];
	      this.id = null;
	    },
	    save: function save() {
	      var vm = this;
	      if (!this.current && this.since >= this.until) {
	        return _notifsCenter2.default.warn('Please set since and until dates correctly!');
	      }
	      if (!this.company || !this.title || !this.sinceYear || !this.sinceMonth || !this.current && (!this.untilMonth || !this.untilYear)) {
	        _notifsCenter2.default.warn('Missing Required Fields');
	        return;
	      }
	      var data = _.pick(this, 'id', 'title', 'since', 'until', 'description', 'skills');
	      if ((0, _typeof3.default)(this.company) == 'object') data.company_id = this.company.id;else data.company_name = this.company;
	      if (this.current) {
	        data.until = null;
	      }

	      this.isLoading = true;
	      if (this.iseditmode) {
	        this.saveActiveExp(data).then(function () {
	          vm.isLoading = false;
	          vm.showModal = false;
	          vm.reset();
	        }).catch(function () {
	          vm.isLoading = false;
	        });
	      } else {
	        this.addNewExp(data).then(function () {
	          vm.isLoading = false;
	          vm.showModal = false;
	          vm.reset();
	        }).catch(function () {
	          vm.isLoading = false;
	        });
	      }
	    },
	    cancel: function cancel() {
	      this.cancelActiveExp();
	      this.reset();
	      this.showModal = false;
	    },
	    edit: function edit(record) {
	      for (var k in record) {
	        if (typeof record[k] == 'string') this[k] = record[k];
	      }
	      this.iseditmode = true;
	      this.id = record.id;
	      this.company = record.company;

	      if (record.until) this.current = false;else this.current = true;
	      _.map(record.skills, function (skill) {
	        $('#skillsExperience').tagsManager('pushTag', skill.name.trim());
	      });
	      this.showModal = true;
	    },
	    delete: function _delete() {
	      var vm = this;
	      vm.isLoading = true;

	      this.deleteActiveExp().then(function () {
	        vm.isLoading = false;
	        vm.showModal = false;
	        vm.reset();
	      });
	    }
	  }
	};

/***/ },

/***/ 139:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _promise = __webpack_require__(9);

	var _promise2 = _interopRequireDefault(_promise);

	var _notifsCenter = __webpack_require__(13);

	var _notifsCenter2 = _interopRequireDefault(_notifsCenter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var connector = __webpack_require__(3);
	var modal = __webpack_require__(12);

	module.exports = {
	  data: function data() {
	    return {
	      school: new School(),
	      isLoading: false,
	      showModal: false,
	      isImageLoading: false
	    };
	  },
	  components: {
	    modal: modal
	  },
	  computed: {
	    remainChars: function remainChars() {
	      if (this.school.description && this.school.description.length) {
	        return 400 - this.school.description.split('\n').join('  ').length;
	      } else return 400;
	    }
	  },
	  methods: {
	    showme: function showme() {
	      this.showModal = true;
	    },
	    reset: function reset() {
	      this.school = new School();
	      this.isLoading = false;
	    },
	    save: function save() {
	      var that = this;
	      this.isLoading = true;
	      this.school.save().then(function (School) {
	        that.isLoading = false;
	        that.$dispatch('addschool:added', School);
	        that.reset();
	        that.showModal = false;
	      }).catch(function (err) {
	        _notifsCenter2.default.error(err);
	        that.isLoading = false;
	      });
	    },
	    cancel: function cancel() {
	      this.reset();
	      this.showModal = false;
	    },
	    uploadImage: function uploadImage() {
	      var that = this;
	      this.isImageLoading = true;
	      var dialog = window.uploadcare.openDialog(null, {
	        imagesOnly: true,
	        crop: '300x300'
	      }).done(function (file) {
	        file.done(function (fileInfo) {
	          that.school.logo = fileInfo.cdnUrl;
	          that.isImageLoading = false;
	        }).fail(function (error, fileInfo) {
	          that.isImageLoading = false;
	          console.warn('Failed upload', error);
	        });
	      });
	      dialog.fail(function (result) {
	        that.isImageLoading = false;
	      });
	    }
	  }
	};

	var School = function School() {
	  this.id = null;
	  this.name = '';
	  this.url = '';
	  this.logo = '';
	  this.description = '';

	  this.address = '';
	  this.city = '';
	  this.country = '';
	  this.zipcode = '';
	  this.region = '';

	  this.phone = '';
	  this.email = '';

	  var self = this;

	  this.toJSON = function () {
	    var object = {
	      name: self.name,
	      url: self.url,
	      logo: self.logo,
	      description: self.description,
	      address: self.address,
	      city: self.city,
	      country: self.country,
	      zipcode: self.zipcode,
	      region: self.region,
	      phone: self.phone,
	      email: self.email
	    };
	    if (self.id) {
	      object['id'] = self.id;
	    }
	    return object;
	  };
	  this.validate = function () {
	    return new _promise2.default(function (resolve, reject) {
	      if (!self.name) {
	        reject('Name missing');
	      } else if (!self.country) {
	        reject('country missing');
	      } else if (!self.validEmail()) {
	        reject('Invalid email');
	      } else if (!self.validPhone()) {
	        reject('invalid phone');
	      } else {
	        resolve();
	      }
	    });
	  };
	  this.validEmail = function () {
	    if (!self.email) return true;
	    var re = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(self.email);
	  };
	  this.validPhone = function () {
	    if (!self.phone) return true;
	    var re = /^[\d\-\(\)\+\s]*$/g;
	    return re.test(self.phone) && self.phone.length > 6;
	  };
	  this.save = function () {
	    return new _promise2.default(function (resolve, reject) {
	      self.validate().then(function () {
	        connector.apiAsync('POST', '/schools', self.toJSON()).then(resolve).catch(function (_ref) {
	          var responseJSON = _ref.responseJSON;
	          return reject(responseJSON.msg);
	        });
	      }).catch(function (err) {
	        reject(err);
	      });
	    });
	  };
	};

/***/ },

/***/ 148:
/***/ function(module, exports) {

	module.exports = "\n<div>\n  <modal :show.sync=\"showModal\">\n      <div class=\"p-sm panel-heading capital\" slot=\"header\">\n        <i class=\"material-icons\">&#xE80C;</i>\n        <span class=\"m-l-sm\" v-ii18n=\"educationRecord\">education record</span>\n      </div>\n     <div class=\"p-l-sm  m-b-md m-t-md row\" slot=\"body\">\n      <div class=\"col s12\">\n       <div class=\"row\">\n        <div class=\"m-r-lg input-field col s5\">\n            <addschool v-ref:schooleditor></addschool>\n            <selector :endpoint=\"'/schools'\" :free='false' :img=\"'logo'\" :insert=\"addSchool\" :insertable=\"true\" :max=\"5\" :value.sync=\"school\" :label=\"'school'\"></selector>\n        </div>\n          <div class=\" col s5 m-t-md row\">\n             <label for=\"degree\" class=\"capital required col s4 m-t-sm\" :class=\"{'active': degree}\">degree</label>\n              <select v-model=\"degree_id\" class=\"browser-default col s8\">\n                 <option v-for=\"item in degrees\" value=\"{{item.id}}\" selected=\"{{$index == 0 }}\">{{item.name}}</option>\n              </select>\n          </div>\n      </div>\n      <div class=\"row\">\n        <div class=\"m-r-lg input-field col s5\">\n          <label for=\"sinceMonth\" class=\"required\" :class=\"{'active': sinceMonth}\">started month</label>\n          <input type=\"text\"  id=\"sinceMonth\" lazy max=\"12\" min=\"1\" name=\"sinceMonth\" v-model=\"sinceMonth | month \">\n        </div>\n        <div class=\"m-l-lg input-field col s5\">\n          <label for=\"startedyear\" class=\"required\" :class=\"{'active': sinceYear}\">started year</label>\n          <input type=\"text\" lazy name=\"startedyear\" v-model=\"sinceYear | year 1940 -1\" id=\"startedyear\">\n        </div>\n      </div>\n      <div class=\"row\" v-if=\"isCurrent | not\">\n        <div class=\"m-r-lg input-field col s5\">\n          <label for=\"endedmonth\" class=\"required\" :class=\"{'active': untilMonth}\">ended month</label>\n          <input id=\"endedmonth\" type=\"text\"  max=\"12\" min=\"1\" v-model=\"untilMonth | month \">\n\n        </div>\n         <div class=\"m-l-lg input-field col s5\">\n          <label for=\"endedyear\" class=\"required\" :class=\"{'active': untilYear}\">ended year</label>\n          <input id=\"endedyear\" name=\"endedyear\" type=\"text\" v-model=\"untilYear | year 1940 -1\">\n        </div>\n      </div>\n        <div class=\"row\">\n           <div class=\"input-field col s12\">\n            <label for=\"role\" class=\"required\" :class=\"{'active': description}\">Brag About Your Role Here </label>\n             <textarea id=\"role\" class=\"materialize-textarea\" v-model=\"description | substring 240\" maxlength=\"240\" name=\"role\"></textarea>\n              </div>\n             <div class=\" font-8 text-warning pull-right\">{{remainChars}}</div>\n         </div>\n          <div class=\"row tags p-l-md p-r-md m-b-md\">\n              <label class=\"col s12 \" for=\"skillsEducation\">\n                <input type=\"text\" name=\"skills\" placeholder=\"Add Skills\" id=\"skillsEducation\" maxlength=\"20\">\n              </label>\n          </div>\n       </div>\n      </div>\n      <div class=\"m-r-md m-t-sm row p-xs \" slot=\"footer\">\n        <button  v-if=\"iseditmode\" @click=\"delete\":disabled=\"isLoading\"  class=\"m-l-lg font-light font-light btn btn-danger text-white hand font-8 uppercase\" name=\"delete\" v-ii18n=\"deleteLbl\">delete</button>\n        <div class=\"pull-right\">\n          <button @click=\"cancel\" :disabled=\"isLoading\"  class=\"font-light btn-flat text-white hand font-8 uppercase\" name=\"cancel\" v-ii18n=\"cancel\">cancel</button>\n          <button  @click=\"save\" :disabled=\"isLoading\" class=\"w-xs font-light btn btn-success m-l-md font-8 uppercase\" name=\"save\" v-ii18n=\"save\">save</button>\n        </div>\n      </div>\n    </modal>\n  </div>\n";

/***/ },

/***/ 149:
/***/ function(module, exports) {

	module.exports = "\n<div>\n  <modal :show.sync=\"showModal\">\n      <div class=\"p-sm panel-heading capital\" slot=\"header\">\n          <i class=\"material-icons\">&#xEB3F;</i>\n          <span class=\"m-l-sm\" v-ii18n=\"experienceRecord\">experience record</sapn>\n      </div>\n\n      <section class=\"row\" slot=\"body\">\n      <div class=\"col s12\">\n         <div class=\"row\">\n        <div class=\"m-r-lg input-field col s5\">\n          <addcompany v-ref:companyeditor></addcompany>\n          <selector :value.sync=\"company\" :endpoint=\"'/companies'\" :img=\"'logo'\" :max=\"5\"  :free='false' :insertable=\"true\" :insert=\"addCompany\" :label=\"'company'\"></selector>\n        </div>\n        <div class=\"m-l-lg input-field col s5\">\n          <label for=\"title\" class=\"required\" :class=\"{'active': title}\">title </label>\n          <input id=\"title\" type=\"text\" v-model=\"title | string\" title=\"title\" name=\"title\" maxlength=\"32\">\n        </div>\n      </div>\n      <div class=\"row\">\n        <div class=\"m-r-lg input-field col s5\">\n          <label  for=\"month\" class=\"required\" :class=\"{'active': sinceMonth}\">started month </label>\n          <input type=\"text\"  v-model=\"sinceMonth | month \" lazy min=\"1\" max=\"12\" name=\"startedmonth\" id=\"month\">\n\n        </div>\n        <div class=\"m-l-lg input-field col s5\">\n          <label  for=\"year\" class=\"required\" :class=\"{'active': sinceYear}\">started year </label>\n          <input type=\"text\" v-model=\"sinceYear | year 1940 -1\" lazy  name=\"startedyear\" id=\"year\">\n        </div>\n      </div>\n      <div class=\"row\">\n        <div class=\"input-field col s12\">\n          <p>\n            <input type=\"checkbox\" checked=\"checked\"  v-model=\"current\" name=\"current\" id=\"current\"/>\n            <label for=\"current\">i currently work here</label>\n          </p>\n        </div>\n      </div>\n      <div class=\"row\" v-if=\"!current\">\n        <div class=\"m-r-lg input-field col s5\">\n          <label  for=\"endedmonth\" :class=\"{'active': untilMonth}\">ended month</label>\n          <input id=\"endedmonth\" type=\"text\"  max=\"12\" min=\"1\" v-model=\"untilMonth | month \" min=\"1\" max=\"12\" name=\"endedmonth\">\n        </div>\n         <div class=\"m-l-lg input-field col s5\">\n          <label for=\"endedyear\" :class=\"{'active': untilYear}\">ended year</label>\n          <input id=\"endedyear\" type=\"text\" v-model=\"untilYear | year 1940 -1\" name=\"endedyear\">\n        </div>\n      </div>\n        <div class=\"row\">\n           <div class=\"input-field col s12\">\n            <label for=\"role\" class=\"required\" :class=\"{'active': description}\">Brag About Your Role Here </label>\n             <textarea id=\"role\" class=\"materialize-textarea\" v-model=\"description | substring 240\" maxlength=\"240\" name=\"role\"></textarea>\n              </div>\n             <div class=\" font-8 text-warning pull-right\">{{remainChars}}</div>\n         </div>\n          <div class=\"row tags p-l-md p-r-md m-b-md\">\n              <label class=\"col s12 \" for=\"skillsExperience\"> <input type=\"text\" name=\"skills\" placeholder=\"Add Skills\" id=\"skillsExperience\" maxlength=\"20\"></label>\n          </div>\n       </div>\n      </section>\n\n      <div class=\"m-r-md m-t-sm row p-xs \" slot=\"footer\">\n        <button  v-if=\"iseditmode\" :disabled=\"isLoading\" @click=\"delete\" class=\"m-l-lg font-light font-light btn btn-danger text-white hand font-8 uppercase\" name=\"delete\" v-ii18n=\"deleteLbl\">delete</button>\n        <div class=\"pull-right\">\n          <button :disabled=\"isLoading\" @click=\"cancel\" class=\"font-light btn-flat text-white hand font-8 uppercase\" name=\"cancel\" v-ii18n=\"cancel\">cancel</button>\n          <button :disabled=\"isLoading\" @click=\"save\" class=\"w-xs font-light btn btn-success m-l-md font-8 uppercase\" name=\"save\" v-ii18n=\"save\">save</button>\n        </div>\n      </div>\n\n    </modal>\n  </div>\n\n";

/***/ },

/***/ 150:
/***/ function(module, exports) {

	module.exports = "\n<modal v-if=\"showModal\" :show.sync=\"showModal\">\n    <div class=\"p-sm panel-heading\" slot=\"header\">\n        <i class=\"material-icons\">&#xE80C;</i><span class=\"m-l-sm capital\" >Add school</span>\n    </div>\n    <div class=\"p-l-sm p-r-sm m-b-md row\" slot=\"body\">\n        <div class=\"col s2\">\n            <div @click=\"uploadImage\" title=\"Logo Of school\" class=\"cd-timeline-img cd-picture size-64 hand uploader\" :class=\"{'progress' : isImageLoading}\">\n                <img :src=\"school.logo\" class=\"uploader size-64 school-logo\" alt=\"school logo\" />\n            </div>\n        </div>\n          <div class=\"row col s10\">\n            <div class=\"col s6\">\n              <div class=\"m-r-lg input-field\">\n                <label class=\"required\" for=\"name\">school name</label>\n                <input type=\"text\"  id=\"name\" v-model=\"school.name\"  maxlength=\"64\" name=\"title\">\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"school\" v-model=\"school.url\"  maxlength=\"64\" name=\"url\">\n                <label for=\"school\">school url </label>\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"email\" v-model=\"school.email\"  maxlength=\"64\" name=\"email\">\n                <label for=\"email\">school email </label>\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"phone\" v-model=\"school.phone\"  maxlength=\"16\" name=\"Phone\">\n                <label for=\"phone\">school phone </label>\n              </div>\n            </div>\n            <div class=\"col s6\">\n               <div class=\"m-r-lg input-field\">\n                <label for=\"country\" class=\"required\">Country</label>\n                <input type=\"text\"  id=\"country\" v-model=\"school.country\"  maxlength=\"32\" name=\"country\">\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"address\" v-model=\"school.address\" maxlength=\"32\" name=\"address\">\n                <label for=\"address\">Address </label>\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"city\" v-model=\"school.city\"  maxlength=\"32\" name=\"city\">\n                <label for=\"city\">City </label>\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"region\" v-model=\"school.region\"  maxlength=\"32\" name=\"region\">\n                <label for=\"region\">Region </label>\n              </div>\n              <div class=\"m-r-lg input-field\">\n                <input type=\"text\"  id=\"zipcode\" v-model=\"school.zipcode\" maxlength=\"16\" name=\"zipcode\">\n                <label for=\"zipcode\">zipcode </label>\n              </div>\n            </div>\n        </div>\n        <div class=\"row\">\n          <div class=\"input-field col s12\">\n            <textarea id=\"description\" class=\"materialize-textarea\"v-model=\"school.description\" maxlength=\"400\" name=\"description\"></textarea>\n            <label for=\"description\">Description</label>\n          </div>\n          <div class=\" font-8 text-warning pull-right\">{{remainChars}}</div>\n       </div>\n    </div>\n    <div slot=\"footer\" class=\"m-r-md m-t-sm row p-xs \">\n        <div class=\"pull-right\">\n            <button @click=\"cancel\" :disabled=\"isLoading\" class=\"font-light btn-link text-white hand font-8 uppercase\" name=\"cancel\" v-ii18n=\"cancel\">cancel</button>\n            <button @click=\"save\" :disabled=\"isLoading\" class=\"w-xs font-light btn btn-success m-l-md font-8 uppercase\" name=\"save\"  v-ii18n=\"save\">save</button>\n        </div>\n    </div>\n</modal>\n";

/***/ },

/***/ 152:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(137)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/education/education.editor.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(148)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 153:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(138)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/experience/experience.editor.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(149)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 154:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(139)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/shared/add_school.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(150)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 223:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(478);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(21)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/less-loader/index.js!./timeline.less", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/less-loader/index.js!./timeline.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 424:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(20);

	var _actions = __webpack_require__(11);

	var aboutModal = __webpack_require__(680);


	module.exports = {
	  vuex: {
	    actions: {
	      setProfileImg: _actions.setProfileImg
	    },
	    getters: {
	      editmode: _getters.isMine,
	      data: _getters.profileAbout
	    }
	  },
	  data: function data() {
	    return {
	      editAboutModal: false,
	      loading: false
	    };
	  },
	  components: {
	    aboutModal: aboutModal
	  },
	  computed: {
	    isReady: function isReady() {
	      if (this.data && this.data.fullname) return true;else return false;
	    }
	  },
	  methods: {
	    editAbout: function editAbout() {
	      this.$refs.modalAbout.show(this.data);
	    },
	    uploadImage: function uploadImage() {
	      if (!this.editmode) return;
	      var vm = this;
	      vm.loading = true;
	      window.uploadcare.openDialog(null, {
	        imagesOnly: true,
	        crop: '300x300'
	      }).done(function (file) {
	        return file.done(function (fileInfo) {
	          return vm.upload(fileInfo);
	        }).fail(function (error, fileInfo) {
	          return vm.upload(null, error);
	        });
	      }).fail(function () {
	        return vm.loading = false;
	      });
	    },
	    upload: function upload(fileInfo, error) {
	      var vm = this;
	      if (fileInfo) vm.setProfileImg(fileInfo.cdnUrl);else console.warn(error);
	      vm.loading = false;
	    }
	  }
	};

/***/ },

/***/ 425:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _assign = __webpack_require__(106);

	var _assign2 = _interopRequireDefault(_assign);

	var _actions = __webpack_require__(11);

	var _notifsCenter = __webpack_require__(13);

	var _notifsCenter2 = _interopRequireDefault(_notifsCenter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var modal = __webpack_require__(12);

	module.exports = {
	  components: {
	    modal: modal
	  },
	  vuex: {
	    actions: {
	      updateAbout: _actions.updateAbout
	    }
	  },
	  data: function data() {
	    return {
	      showModal: false,
	      aboutData: {
	        firstname: '',
	        lastname: '',
	        title: '',
	        about: ''
	      }
	    };
	  },

	  methods: {
	    show: function show(data) {
	      this.aboutData = (0, _assign2.default)({}, data);
	      this.showModal = true;
	    },
	    cancel: function cancel() {
	      this.reset();
	    },
	    save: function save() {
	      var data = this.aboutData;
	      if (!data.firstname || !data.lastname) _notifsCenter2.default.error('first name and last name are required');
	      var newAbout = {
	        firstname: data.firstname,
	        lastname: data.lastname,
	        title: data.title,
	        about: data.about
	      };
	      this.updateAbout(newAbout).then(this.reset, this.reset);
	    },
	    reset: function reset() {
	      this.showModal = false;
	      this.aboutData.firstname = '';
	      this.aboutData.lastname = '';
	      this.aboutData.title = '';
	      this.aboutData.about = '';
	    }
	  }
	};

/***/ },

/***/ 426:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(20);

	var _actions = __webpack_require__(11);

	var categoryList = __webpack_require__(683);
	var categoryEditor = __webpack_require__(682);
	var sectionEditor = __webpack_require__(684);
	var bus = __webpack_require__(6);

	module.exports = {
	  vuex: {
	    actions: {
	      setActiveSec: _actions.setActiveSec
	    },
	    getters: {
	      editmode: _getters.isMine,
	      categories: _getters.customSecs
	    }
	  },
	  components: {
	    categoryList: categoryList,
	    categoryEditor: categoryEditor,
	    sectionEditor: sectionEditor
	  },
	  data: function data() {
	    return {};
	  },
	  methods: {
	    newCategory: function newCategory() {
	      bus.$emit('custom-section:category-editor');
	    }
	  }
	};

/***/ },

/***/ 427:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _actions = __webpack_require__(11);

	var modal = __webpack_require__(12);
	var bus = __webpack_require__(6);

	module.exports = {
	  vuex: {
	    actions: {
	      cancelActiveSec: _actions.cancelActiveSec,
	      addNewSec: _actions.addNewSec,
	      saveActiveSecCat: _actions.saveActiveSecCat,
	      deleteActiveSec: _actions.deleteActiveSec
	    }
	  },
	  data: function data() {
	    return {
	      error: '',
	      isLoading: false,
	      showModal: false,
	      iseditmode: false,
	      title: ''
	    };
	  },
	  components: {
	    modal: modal
	  },
	  ready: function ready() {
	    bus.$on('custom-section:category-editor', this.edit);
	  },
	  destroyed: function destroyed() {
	    bus.$off('custom-section:category-editor');
	  },

	  methods: {
	    edit: function edit(record) {
	      this.iseditmode = !!record;
	      this.title = record ? record.title : '';
	      this.id = record ? record.id : '';
	      this.showModal = true;
	    },
	    save: function save() {
	      var vm = this;
	      if (!this.title) {
	        console.warn('Missing Required Fields');
	        return this.error = 'Missing Required Fields';
	      }
	      this.isLoading = true;

	      var data = { title: vm.title };

	      if (vm.iseditmode) {
	        this.saveActiveSecCat(data).then(function () {
	          return vm.reset();
	        }).catch(function () {
	          return vm.reset();
	        });
	      } else {
	        this.addNewSec(data).then(function () {
	          return vm.reset();
	        }).catch(function () {
	          return vm.reset();
	        });
	      }
	    },
	    cancel: function cancel() {
	      this.reset();
	    },
	    deleteSection: function deleteSection() {
	      var vm = this;
	      this.deleteActiveSec().then(function () {
	        return vm.reset();
	      }).catch(function () {
	        return vm.reset();
	      });
	    },
	    reset: function reset() {
	      this.cancelActiveSec();
	      this.showModal = false;
	      this.isLoading = false;
	      this.title = '';
	      this.iseditmode = false;
	      this.id = null;
	      this.error = '';
	    }
	  }
	};

/***/ },

/***/ 428:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(20);

	var _actions = __webpack_require__(11);

	var sectionList = __webpack_require__(685);
	var bus = __webpack_require__(6);

	module.exports = {
	  vuex: {
	    actions: {
	      setActiveSec: _actions.setActiveSec
	    },
	    getters: {
	      editmode: _getters.isMine,
	      categories: _getters.customSecs
	    }
	  },
	  components: {
	    sectionList: sectionList
	  },
	  methods: {
	    editCategory: function editCategory(data) {
	      this.setActiveSec(data);
	      bus.$emit('custom-section:category-editor', data);
	    }
	  }
	};

/***/ },

/***/ 429:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _actions = __webpack_require__(11);

	var modal = __webpack_require__(12);
	var bus = __webpack_require__(6);


	module.exports = {
	  vuex: {
	    actions: {
	      saveActiveSec: _actions.saveActiveSec,
	      addToActiveSec: _actions.addToActiveSec,
	      cancelActiveSec: _actions.cancelActiveSec,
	      deleteFromActiveSec: _actions.deleteFromActiveSec
	    }
	  },
	  data: function data() {
	    return {
	      lastcategory: '',
	      error: '',
	      isLoading: false,
	      iseditmode: false,
	      url: '',
	      description: '',
	      title: '',
	      itemData: null,
	      showModal: false
	    };
	  },

	  components: {
	    modal: modal
	  },
	  ready: function ready() {
	    bus.$on('custom-section:editor', this.edit);
	  },
	  destroyed: function destroyed() {
	    bus.$off('custom-section:editor');
	  },

	  computed: {
	    remainChars: function remainChars() {
	      if (this.description && this.description.length) return 400 - this.description.split('\n').join('  ').length;else return 400;
	    }
	  },
	  methods: {
	    edit: function edit(item) {
	      this.iseditmode = !!item;
	      this.title = item ? item.title : '';
	      this.url = item ? item.url : '';
	      this.description = item ? item.description : '';
	      this.showModal = true;
	      this.itemData = item;
	    },
	    save: function save() {
	      var vm = this;
	      if (!this.title) {
	        console.log('Missing Required Fields');
	        return this.error = 'Missing Required Fields';
	      }
	      vm.isLoading = true;
	      var data = { title: vm.title, description: vm.description, url: vm.url };

	      if (vm.iseditmode) {
	        var sectionId = vm.itemData.id;
	        this.saveActiveSec(data, sectionId).then(function () {
	          return vm.reset();
	        });
	      } else {
	        this.addToActiveSec(data).then(function () {
	          return vm.reset();
	        });
	      }
	    },
	    cancel: function cancel() {
	      this.reset();
	    },
	    delete: function _delete() {
	      var vm = this;
	      var sectionId = vm.itemData.id;
	      this.deleteFromActiveSec(sectionId).then(function () {
	        return vm.reset();
	      });
	    },
	    reset: function reset() {
	      this.itemData = null;
	      this.cancelActiveSec();
	      this.title = this.description = this.error = this.url = '';
	      this.iseditmode = false;
	      this.id = null;
	      this.error = '';
	      this.showModal = false;
	      this.isLoading = false;
	    }
	  }
	};

/***/ },

/***/ 430:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(20);

	var _actions = __webpack_require__(11);

	var bus = __webpack_require__(6);


	module.exports = {
	  vuex: {
	    actions: {
	      setActiveSec: _actions.setActiveSec
	    },
	    getters: {
	      editmode: _getters.isMine
	    }
	  },
	  props: {
	    section: {
	      type: Object,
	      require: true
	    }
	  },
	  methods: {
	    newSection: function newSection() {
	      this.setActiveSec(this.section);
	      bus.$emit('custom-section:editor');
	    },
	    editSection: function editSection(item) {
	      this.setActiveSec(this.section);
	      bus.$emit('custom-section:editor', item);
	    }
	  }
	};

/***/ },

/***/ 431:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(20);

	var educationEditor = __webpack_require__(152);

	var educationList = __webpack_require__(687);

	module.exports = {
	  events: {
	    'education_record:edit': function education_recordEdit(data) {
	      this.$refs.editor.edit(data);
	    }
	  },

	  components: {
	    educationList: educationList,
	    educationEditor: educationEditor
	  },
	  vuex: {
	    getters: {
	      editmode: _getters.isMine,
	      hasprofileEdus: _getters.hasprofileEdus
	    }
	  },
	  computed: {
	    showContainer: function showContainer() {
	      return this.hasprofileEdus || this.editmode;
	    }
	  },
	  methods: {
	    newEdu: function newEdu() {
	      this.$refs.editor.new();
	    }
	  }
	};

/***/ },

/***/ 432:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(20);

	var education = __webpack_require__(688);

	__webpack_require__(223);
	module.exports = {
	  components: {
	    education: education
	  },
	  vuex: {
	    getters: {
	      data: _getters.profileEdus
	    }
	  }
	};

/***/ },

/***/ 433:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(20);

	var _actions = __webpack_require__(11);

	var schoolImg = __webpack_require__(361);


	module.exports = {
	  vuex: {
	    actions: {
	      setSchoolImg: _actions.setSchoolImg,
	      setActiveEdu: _actions.setActiveEdu
	    },
	    getters: {
	      editmode: _getters.isMine
	    }
	  },
	  props: {
	    record: {
	      type: Object,
	      require: true
	    }
	  },
	  data: function data() {
	    return { loading: false };
	  },

	  computed: {
	    logo: function logo() {
	      return this.record.img || this.record.school.logo || schoolImg;
	    },

	    tags: function tags() {
	      return this.record && this.record.skills ? this.record.skills.split(',') : [];
	    }
	  },
	  methods: {
	    editEducation: function editEducation() {
	      this.setActiveEdu(this.record);
	      this.$dispatch('education_record:edit', this.record);
	    },
	    uploadImage: function uploadImage() {
	      if (!this.editmode) return;
	      var vm = this;
	      vm.loading = true;
	      window.uploadcare.openDialog(null, {
	        imagesOnly: true,
	        crop: '300x300'
	      }).done(function (file) {
	        return file.done(function (fileInfo) {
	          return vm.upload(fileInfo);
	        }).fail(function (error, fileInfo) {
	          return vm.upload(null, error);
	        });
	      }).fail(function () {
	        return vm.loading = false;
	      });
	    },
	    upload: function upload(fileInfo, error) {
	      var vm = this;
	      if (fileInfo) vm.setSchoolImg(fileInfo.cdnUrl, vm.record.id, vm.record.school_id);else console.warn(error);
	      vm.loading = false;
	    }
	  }
	};

/***/ },

/***/ 434:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(20);

	var experienceEditor = __webpack_require__(153);
	var experienceList = __webpack_require__(690);

	__webpack_require__(223);
	module.exports = {
	  components: {
	    experienceList: experienceList,
	    experienceEditor: experienceEditor
	  },
	  vuex: {
	    getters: {
	      editmode: _getters.isMine,
	      hasProfileExps: _getters.hasProfileExps
	    }
	  },
	  computed: {
	    showContainer: function showContainer() {
	      return this.hasProfileExps || this.editmode;
	    }
	  },
	  events: {
	    'experience_record:edit': function experience_recordEdit(data) {
	      this.$refs.editor.edit(data);
	    }
	  },
	  methods: {
	    newExp: function newExp() {
	      this.$refs.editor.new();
	    }
	  }
	};

/***/ },

/***/ 435:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(20);

	var experience = __webpack_require__(691);

	__webpack_require__(223);
	module.exports = {
	  components: {
	    experience: experience
	  },
	  vuex: {
	    getters: {
	      data: _getters.profileExps
	    }
	  }
	};

/***/ },

/***/ 436:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(20);

	var _actions = __webpack_require__(11);

	var companyImg = __webpack_require__(360);
	var moment = __webpack_require__(4);

	module.exports = {
	  vuex: {
	    actions: {
	      setCompanyImg: _actions.setCompanyImg,
	      setActiveExp: _actions.setActiveExp
	    },
	    getters: {
	      editmode: _getters.isMine
	    }
	  },
	  props: {
	    record: {
	      type: Object,
	      require: true
	    }
	  },
	  data: function data() {
	    return { loading: false };
	  },

	  computed: {
	    logo: function logo() {
	      return this.record.img || this.record.company.logo || companyImg;
	    },
	    tags: function tags() {
	      return this.record && this.record.skills ? this.record.skills.split(',') : [];
	    },
	    duration: function duration() {
	      var now = moment();

	      var diff = moment(this.record.since).diff(moment(this.record.until || now));
	      return moment.duration(diff).humanize();
	    }
	  },
	  methods: {
	    editExperience: function editExperience() {
	      this.setActiveExp(this.record);
	      this.$dispatch('experience_record:edit', this.record);
	    },
	    uploadImage: function uploadImage() {
	      if (!this.editmode) return;
	      var vm = this;
	      vm.loading = true;
	      window.uploadcare.openDialog(null, {
	        imagesOnly: true,
	        crop: '300x300'
	      }).done(function (file) {
	        return file.done(function (fileInfo) {
	          return vm.upload(fileInfo);
	        }).fail(function (error, fileInfo) {
	          return vm.upload(null, error);
	        });
	      }).fail(function () {
	        return vm.loading = false;
	      });
	    },
	    upload: function upload(fileInfo, error) {
	      var vm = this;
	      if (fileInfo) vm.setCompanyImg(fileInfo.cdnUrl, vm.record.id, vm.record.company_id);else console.warn(error);
	      vm.loading = false;
	    }
	  }
	};

/***/ },

/***/ 437:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var appConfig = __webpack_require__(34);
	var aboutSection = __webpack_require__(679);
	var expSection = __webpack_require__(689);
	var eduSection = __webpack_require__(686);
	var customSection = __webpack_require__(681);

	var _require = __webpack_require__(11);

	var loadProfile = _require.loadProfile;
	var unloadProfile = _require.unloadProfile;

	var _require2 = __webpack_require__(20);

	var isMine = _require2.isMine;
	var isReady = _require2.isReady;


	module.exports = {
	  vuex: {
	    actions: {
	      loadProfile: loadProfile,
	      unloadProfile: unloadProfile
	    },
	    getters: {
	      editmode: isMine,
	      loaded: isReady
	    }
	  },
	  components: {
	    aboutSection: aboutSection,
	    expSection: expSection,
	    eduSection: eduSection,
	    customSection: customSection
	  },
	  route: {
	    data: function data(_ref) {
	      var to = _ref.to;

	      var vm = this;
	      var _id = to.params.id;
	      if (this.loaded == _id) return;
	      this.unloadProfile();
	      this.loadProfile(_id).then(function () {}).catch(function () {
	        return vm.$router.go('/404');
	      });
	    }
	  },
	  methods: {
	    importLinkedin: function importLinkedin() {
	      window.location.href = appConfig.apiBaseUrl + '/linkedin/auth?redirectUrl=/profile';
	    }
	  }
	};

/***/ },

/***/ 478:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*doc\n---\ntitle: Colors\nname: colors\ncategory: Base CSS\n---\n\nColors: to be able to use the predefined colors, You need to import common/less/colors.less\n\n```html_example\n<style>\n@import \"../src/components/common/less/colors.less\"\n</style>\n<div class=\"size-32\" style=\"background-color: @color-navy-blue\">Click</div>\n```\n*/\n/* Mixin */\n.cd-timeline {\n  position: relative;\n}\n.cd-timeline .cd-timeline-block:after {\n  /* this is the vertical line */\n  content: \"\";\n  display: table;\n  clear: both;\n}\n.cd-timeline .cd-timeline-block {\n  position: relative;\n  margin: 0 0 30px;\n}\n.cd-timeline .cd-timeline-img {\n  position: absolute;\n  background-color: #f1f3f6;\n  top: 0;\n  left: 0;\n  margin-left: -32px;\n  box-shadow: 0 0 0 4px white, inset 0 2px 0 rgba(0, 0, 0, 0.08), 0 3px 0 4px rgba(0, 0, 0, 0.05);\n}\n.cd-timeline .cd-timeline-img img {\n  display: block;\n  position: relative;\n  left: 50%;\n  top: 50%;\n  margin-left: -32px;\n  margin-top: -32px;\n}\n.cd-timeline .cd-timeline-content {\n  position: relative;\n  border: black 1px solid;\n  border-color: #e4e5e7;\n  min-height: 30px;\n  width: 80%;\n  background: rgba(247, 247, 247, 0.76);\n  background: linear-gradient(to right, rgba(247, 247, 247, 0.76) 0%, rgba(247, 247, 247, 0.76) 6%, rgba(246, 246, 246, 0.55) 53%, rgba(255, 255, 255, 0.34) 100%);\n}\n.cd-timeline .cd-timeline-content .\\--edit-delete-menu {\n  float: right;\n  opacity: 0;\n  transition: opacity 200ms;\n}\n.cd-timeline .cd-timeline-content:hover .\\--edit-delete-menu {\n  opacity: 1;\n}\n.cd-timeline .cd-timeline-block-container:nth-child(even) .cd-timeline-img {\n  left: 10%;\n}\n.cd-timeline .cd-timeline-block-container:nth-child(even) .cd-timeline-content:after,\n.cd-timeline .cd-timeline-block-container:nth-child(even) .cd-timeline-content:before {\n  right: 100%;\n}\n.cd-timeline .cd-timeline-block-container:nth-child(even) .cd-timeline-content:before {\n  border-right-color: #e4e5e7;\n}\n.cd-timeline .cd-timeline-block-container:nth-child(even) .cd-timeline-content:after {\n  border-right-color: #ffffff;\n}\n.cd-timeline .cd-timeline-block-container:nth-child(even) .cd-timeline-content {\n  float: right;\n  background: rgba(255, 255, 255, 0.34);\n  background: linear-gradient(to right, rgba(255, 255, 255, 0.34) 0%, rgba(246, 246, 246, 0.55) 47%, rgba(247, 247, 247, 0.76) 94%, rgba(247, 247, 247, 0.76) 100%);\n}\n.cd-timeline .cd-timeline-block-container:nth-child(odd) .cd-timeline-img {\n  left: 90%;\n}\n.cd-timeline .cd-timeline-block-container:nth-child(odd) .cd-timeline-content:after,\n.cd-timeline .cd-timeline-block-container:nth-child(odd) .cd-timeline-content:before {\n  left: 100%;\n}\n.cd-timeline .cd-timeline-block-container:nth-child(odd) .cd-timeline-content:before {\n  border-left-color: #e4e5e7;\n}\n.cd-timeline .cd-timeline-block-container:nth-child(odd) .cd-timeline-content:after {\n  border-left-color: #ffffff;\n}\n.cd-timeline .profile-panel .btn-link:hover,\n.cd-timeline .profile-panel .btn-link:focus,\n.cd-timeline .profile-panel .btn-link:active,\n.cd-timeline .profile-panel .btn-link.active,\n.cd-timeline .profile-panel .open .dropdown-toggle.btn-link {\n  color: #FFF;\n}\n.cd-timeline .cd-timeline-content:after,\n.cd-timeline .cd-timeline-content:before {\n  top: 30px;\n  border: solid transparent;\n  content: '';\n  height: 0;\n  width: 0;\n  position: absolute;\n  pointer-events: none;\n}\n.cd-timeline .cd-timeline-content:after {\n  border-color: rgba(255, 255, 255, 0);\n  border-width: 8px;\n  margin-top: -8px;\n}\n.cd-timeline .cd-timeline-content:before {\n  border-color: rgba(117, 117, 117, 0);\n  border-width: 9px;\n  margin-top: -9px;\n}\n", ""]);

	// exports


/***/ },

/***/ 495:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".profile-panel .btn-link[_v-32407124]:hover,\n.profile-panel .btn-link[_v-32407124]:focus,\n.profile-panel .btn-link[_v-32407124]:active,\n.profile-panel .btn-link.active[_v-32407124],\n.profile-panel .open .dropdown-toggle.btn-link[_v-32407124] {\n  color: #FFF;\n}\n.profile-panel .defaultDescription[_v-32407124] {\n  font-style: italic;\n  color: #AAA;\n}\n.profile-panel .error[_v-32407124] {\n  height: 20px;\n}\n", ""]);

	// exports


/***/ },

/***/ 499:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".edit-section[_v-6cec9edd] {\n  opacity: 0;\n  -webkit-transition: 200ms all;\n  transition: 200ms all;\n}\n.edit-section[_v-6cec9edd]:hover {\n  opacity: 1;\n}\n", ""]);

	// exports


/***/ },

/***/ 526:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(495);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../../node_modules/css-loader/index.js!./../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-32407124&scoped=true!./../../../../../node_modules/less-loader/index.js!./../../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./about.container.vue", function() {
				var newContent = require("!!./../../../../../node_modules/css-loader/index.js!./../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-32407124&scoped=true!./../../../../../node_modules/less-loader/index.js!./../../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./about.container.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 530:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(499);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../../node_modules/css-loader/index.js!./../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-6cec9edd&scoped=true!./../../../../../node_modules/less-loader/index.js!./../../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./section.list.vue", function() {
				var newContent = require("!!./../../../../../node_modules/css-loader/index.js!./../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-6cec9edd&scoped=true!./../../../../../node_modules/less-loader/index.js!./../../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./section.list.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 607:
/***/ function(module, exports) {

	module.exports = "\n<div>\n    <modal :show.sync=\"showModal\">\n        <div slot=\"header\" class=\"p-sm panel-heading\">\n            <i class=\"material-icons\">&#xE7FD;</i><span class=\"m-l-sm capital\" v-ii18n=\"about\">about</span>\n        </div>\n        <div slot=\"body\" class=\"row p-l-sm p-r-sm m-b-md m-t-md\">\n            <div class=\"row\">\n                <div class=\"m-r-lg input-field col s12\">\n                  <label v-ii18n=\"firstNameLbl\" class=\"required\" for=\"firstname\" :class=\"{'active': aboutData.firstname}\">first name</label>\n                    <input type=\"text\" maxlength=\"20\" v-model=\"aboutData.firstname\" name=\"firstname\" id=\"firstname\">\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"m-r-lg input-field col s12\">\n                    <label v-ii18n=\"lastNameLbl\"  class=\"required\"  :class=\"{'active': aboutData.lastname}\" for=\"firstname\">lastname name</label>\n                    <input type=\"text\" maxlength=\"20\" v-model=\"aboutData.lastname\" name=\"lastname\" id=\"lastname\">\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"m-r-lg input-field col s12\">\n                    <label v-ii18n=\"titleLbl\" for=\"title\" :class=\"{'active': aboutData.title}\">title</label>\n                    <input type=\"text\" maxlength=\"32\" v-model=\"aboutData.title\" name=\"title\" id=\"title\">\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"input-field col s12\">\n                    <label for=\"about\" :class=\"{'active': aboutData.about}\">about</label>\n                    <textarea id=\"about\" class=\"materialize-textarea\" v-model=\"aboutData.about | substring\" name=\"about\"></textarea>\n                </div>\n            </div>\n        </div>\n        <div slot=\"footer\" class=\"pull-right m-r-md m-t-sm row \">\n            <button @click=\"cancel\" class=\"font-light btn-flat text-white hand font-8 uppercase\" name=\"cancel\">CANCEL</button>\n            <button @click=\"save\" :class=\"{ 'disabled': isLoading }\" class=\"w-xs font-light btn btn-success m-l-md font-8\" name=\"save\">SAVE</button>\n        </div>\n    </modal>\n</div>\n";

/***/ },

/***/ 608:
/***/ function(module, exports) {

	module.exports = "\n<section>\n  <category-editor></category-editor>\n\n  <category-list></category-list>\n  <div v-if=\"editmode\" class=\"hpanel hyellow profile-panel\">\n    <div class=\" panel-body border m-b-xs p-xs p-r-xs p-l-xs row\">\n      <div class=\"col s6 offset-s4\">\n        <span @click=\"newCategory\" class=\"hand m-t-sm font-9\">\n        <i class=\"material-icons\">&#xE147;</i>\n        <span class=\"capital\" v-ii18n=\"addNewSection\">add new section</span>\n        </span>\n      </div>\n      <div v-if =\"!categories.length\" class=\"empty-data  m-t-lg p-none p-xs word-wrapper\">\n        <span v-ii18n=\"yourPotentialText\">Your potential coworkers and employers would love to know more about you. <br> Sections could be spoken languages, hobbies, publications, certifications, patents, etc.</span>\n      </div>\n    </div>\n  </div>\n <section-editor></section-editor>\n\n</section>\n";

/***/ },

/***/ 609:
/***/ function(module, exports) {

	module.exports = "\n<div>\n  <slot></slot>\n  <modal :show.sync=\"showModal\">\n    <div class=\"p-sm panel-heading capital\" slot=\"header\">\n      <i class=\"material-icons\">&#xE53B;</i>\n      <span v-ii18n=\"customSectionEditor\">custom section editor</span>\n    </div>\n    <div class=\"p-l-sm p-r-sm m-b-md\" slot=\"body\">\n      <!-- <p class=\"text-danger m-b-xs error\" v-if=\"error\">\n        <span>{{error}}</span>\n      </p> -->\n    <div class=\"row\">\n      <div class=\"m-r-lg input-field col s12\">\n        <label  for=\"sectionName\" class=\"required\" :class=\"{'active': title}\" v-ii18n=\"sectionName\">section name</label>\n        <input type=\"text\"  id=\"sectionName\" name=\"title\" v-model=\"title\" maxlength=\"20\">\n      </div>\n    </div>\n    </div>\n    <div class=\"m-r-md m-t-sm row p-xs \" slot=\"footer\">\n      <button v-if=\"iseditmode\" :disabled=\"isLoading\" @click=\"deleteSection\" class=\"m-l-lg font-light font-light btn btn-danger text-white hand font-8 uppercase\" name=\"delete\" v-ii18n=\"deleteLbl\">delete</button>\n      <div class=\"pull-right\">\n        <button :disabled=\"isLoading\" @click=\"cancel\" class=\"font-light btn-flat text-white hand font-8 uppercase\" name=\"cancel\" v-ii18n=\"cancel\">cancel</button>\n        <button :disabled=\"isLoading\" @click=\"save\" class=\"w-xs font-light btn btn-success m-l-md font-8 uppercase\" name=\"save\" v-ii18n=\"save\">save</button>\n      </div>\n    </div>\n  </modal>\n</div>\n";

/***/ },

/***/ 610:
/***/ function(module, exports) {

	module.exports = "\n<section>\n<div class=\"hpanel profile-panel\">\n  <div v-for=\"section in categories\" class=\"panel-body m-none m-b-xs p-none p-b-xs word-wrapper\">\n    <div class=\"panel-heading p-l-sm p-r-sm fx-row fx-space-between-center\">\n        <!-- <i class=\"fa fa-graduation-cap m-r-sm \"></i> -->\n        <span class=\"capital\">{{section.title }}</span>\n        <span v-if=\"editmode\" @click=\"editCategory(section)\"  type=\"button\" class=\"p-r-xs hand\">\n              <i class=\"material-icons\">&#xE254;</i>\n        </span>\n    </div>\n    <section-list :section=\"section\" track-by=\"id\"></section-list>\n  </div>\n</div>\n</section>\n";

/***/ },

/***/ 611:
/***/ function(module, exports) {

	module.exports = "\n<div>\n  <modal :show.sync=\"showModal\">\n    <div class=\"p-sm panel-heading capital\" slot=\"header\">\n      <i class=\"material-icons\">&#xE53B;</i>\n      <span v-ii18n=\"customSectionEditor\">custom section editor</span>\n    </div>\n    <div class=\"p-l-sm p-r-sm m-b-md capital\" slot=\"body\">\n      <!-- <p class=\"text-danger m-b-xs error\" v-if=\"error\">\n        <span>{{error}}</span>\n      </p> -->\n      <div class=\"row\">\n        <div class=\"m-r-lg input-field col s12\">\n          <label  for=\"title\" class=\"required\" :class=\"{'active': title}\" v-ii18n=\"titleLbl\">title</label>\n          <input type=\"text\"  id=\"title\" name=\"title\" v-model=\"title\" maxlength=\"20\">\n        </div>\n      </div>\n      <div class=\"row\">\n         <div class=\"m-r-lg input-field col s12\">\n           <label for=\"link\" v-ii18n=\"titleLbl\" :class=\"{'active': url}\">url </label>\n           <input type=\"text\"  id=\"link\" name=\"link\" v-model=\"url | url\" maxlength=\"100\">\n         </div>\n      </div>\n         <div class=\"row\">\n            <div class=\"input-field col s12\">\n              <label for=\"description\" :class=\"{'active': description}\">description</label>\n               <textarea id=\"description\" class=\"materialize-textarea\" v-model=\"description\" maxlength=\"400\" name=\"description\"></textarea>\n            </div>\n          <div class=\" font-8 text-warning pull-right\">{{remainChars}}</div>\n      </div>\n    </div>\n    <div class=\"m-r-md m-t-sm row p-xs \" slot=\"footer\">\n      <button v-if=\"iseditmode\" :disabled=\"isLoading\" @click=\"delete\" class=\"m-l-lg font-light font-light btn btn-danger text-white hand font-8 uppercase\" name=\"delete\" v-if=\"iseditmode\" v-ii18n=\"deleteLbl\">delete</button>\n      <div class=\"pull-right\">\n        <button :disabled=\"isLoading\" @click=\"cancel\" class=\"font-light btn-flat text-white hand font-8 uppercase\" name=\"cancel\" v-ii18n=\"cancel\">cancel</button>\n        <button :disabled=\"isLoading\" @click=\"save\" class=\"w-xs font-light btn btn-success m-l-md font-8 uppercase\" name=\"save\" v-ii18n=\"save\">save</button>\n      </div>\n    </div>\n  </modal>\n</div>\n";

/***/ },

/***/ 612:
/***/ function(module, exports) {

	module.exports = "\n<div v-if=\"showContainer\" class=\"hpanel hblue profile-panel p-none m-b-lg m-l-xs\" id=\"education\">\n  <div class=\"panel-body m-none p-none\">\n    <div class=\"panel-heading\">\n      <!-- <addkudo v-ref:addkudo></addkudo> -->\n      <!-- <endorsements v-ref:endorsementsmodal></endorsements> -->\n      <div class=\"panel-tools\" v-if=\"editmode\">\n        <span @click=\"newEdu\" class=\"hand m-r-xs pull-right\" name=\"addeducation\"><i class=\"material-icons\">&#xE145;</i></span>\n          <education-editor v-ref:editor></education-editor>\n      </div>\n      <div class=\"m-none p-none p-l-md capital\">\n        <i class=\"material-icons\">&#xE80C;</i>\n        <span v-ii18n=\"education\" class=\"m-l-sm capital\">education</span>\n      </div>\n    </div>\n    <education-list></education-list>\n  </div>\n</div>\n";

/***/ },

/***/ 613:
/***/ function(module, exports) {

	module.exports = "\n<section class=\"cd-timeline cd-container m-t-md m-xs \">\n  <!-- <div class=\"empty-data\" v-if=\"editmode && data && data.length == 0\" v-ii18n=\"educationIndexTxt\">You may provide here more information about your education history. It doesn\\'t take too long and can attract more attention to your profile.</div> -->\n  <education keep-alive  v-for=\"item in data | orderBy 'since' -1\" track-by=\"id\" :record=\"item\" class=\"cd-timeline-block-container\" ></education>\n  <section v-if=\"data && !data.length\" class=\"fx-col fx-start-center placeholder\">\n    <i class=\"material-icons symbol\">&#xE80C;</i>\n    <h4 class=\"m-none font-1-5 capital\" v-ii18n=\"addEducationText\">add your first education</h4>\n    <p class=\"m-none capital\" v-ii18n=\"addEducationText2\">add your education to enhance your profile</p>\n  </section>\n</section>\n";

/***/ },

/***/ 614:
/***/ function(module, exports) {

	module.exports = "\n<section>\n  <div class=\"cd-timeline-block p-none m-none p-l-sm m-b-md\">\n    <div @click=\"uploadImage\" :class=\"{'uploader' : editmode, 'progress' : loading}\" class=\"cd-timeline-img size-64 school-logo\" title=\"change Logo\">\n      <img :src=\"logo\" class=\"size-64\"  alt=\"school logo\"/>\n    </div>\n    <!-- cd-timeline-img -->\n    <div class=\"cd-timeline-content m-none\">\n      <div class=\"p-xs word-wrapper\">\n        <span v-if=\"editmode\" @click=\"editEducation\" class=\"--edit-delete-menu hand\"><i class=\"material-icons\">&#xE254;</i></span>\n        <div class=\"font-9 font-light text-light\">\n          <span class=\"capital\">{{record.since | moment \"MMMM YYYY\" }}</span>\n          <span class=\"m-xs\">-</span>\n          <span class=\"capital\" v-if=\"record.until\">{{record.until | moment \"MMMM YYYY\" }}</span>\n          <span v-else>until now</span>\n\n        </div>\n        <div class=\"font-9 m-t-xs capital\">\n          <h6 class=\"text-light font-1 m-none\">{{record.school.name}}</h6>\n          <h5 class=\"font-1-2 m-t-sm\">{{record.degree.name}}</h5>\n        </div>\n        <p class=\"font-8 font-light m-t-xs\">{{{record.description | lineBreak}}}</p>\n        <div class=\"m-t-sm break-word\">\n           <div track-by=\"$index\" v-for=\"item in record.skills\" class=\"chip font-8 m-l-xs m-b-sm\">{{item.name || item}}</div>\n        </div>\n      </div>\n      <!-- cd-timeline-content -->\n    </div>\n    <!-- cd-timeline-block -->\n  </div>\n</section>\n";

/***/ },

/***/ 615:
/***/ function(module, exports) {

	module.exports = "\n<div v-if=\"showContainer\" class=\"hpanel hblue profile-panel p-none m-b-sm m-l-xs\">\n  <div  class=\"panel-body m-none p-none\">\n    <div class=\"panel-heading\">\n      <!-- <addkudo v-ref:addkudo></addkudo> -->\n      <!-- <endorsements v-ref:endorsementsmodal></endorsements> -->\n      <div class=\"panel-tools\" v-if=\"editmode\">\n        <span @click=\"newExp\" class=\"hand m-r-xs pull-right\" name=\"addexperience\"><i class=\"material-icons\">&#xE145;</i></span>\n          <experience-editor v-ref:editor></experience-editor>\n      </div>\n      <div class=\"m-none p-none p-l-md capital\">\n          <i class=\"material-icons\">&#xEB3F;</i>\n          <span class=\"m-l-sm\" v-ii18n=\"experience\">experience</span>\n      </div>\n    </div>\n\n    <experience-list></experience-list>\n\n  </div>\n</div>\n";

/***/ },

/***/ 616:
/***/ function(module, exports) {

	module.exports = "\n<section class=\"cd-timeline cd-container m-t-md m-xs \">\n    <!-- <div class=\"empty-data\" v-if=\"editmode && data && data.length == 0\" v-ii18n=\"experienceIndexTxt\"></div> -->\n    <experience keep-alive v-for=\"item in data | orderBy 'since' -1\" :record=\"item\" track-by=\"id\" class=\"cd-timeline-block-container\"></experience>\n    <section v-if=\"data && !data.length\" class=\"fx-col fx-start-center placeholder\">\n      <i class=\"material-icons symbol\">&#xEB3F;</i>\n      <h4 class=\"m-none font-1-5 capital\" v-ii18n=\"addExperienceText\">add your first experience</h4>\n      <p class=\"m-none capital\" v-ii18n=\"addExperienceText2\">add your work experience to enhance your profile</p>\n    </section>\n</section>\n";

/***/ },

/***/ 617:
/***/ function(module, exports) {

	module.exports = "\n<section>\n  <div class=\"cd-timeline-block p-none m-none p-l-sm m-b-md\">\n    <div @click=\"uploadImage\" :class=\"{'uploader' : editmode, 'progress' : loading}\" class=\"cd-timeline-img size-64 company-logo\">\n      <img :src=\"logo\" class=\"size-64\" alt=\"company logo\"/>\n    </div>\n    <!-- cd-timeline-img -->\n    <div class=\"cd-timeline-content m-none \">\n      <div class=\"p-xs word-wrapper\">\n        <span v-if=\"editmode\" @click=\"editExperience\" class=\"--edit-delete-menu hand\"><i class=\"material-icons\">&#xE254;</i></span>\n\n        <div class=\"font-9 font-light text-light\">\n          <span class=\"capital\">{{record.since | moment \"MMMM YYYY\" }}</span>\n          <span>-</span>\n          <span class=\"capital\" v-if=\"record.until\">{{record.until | moment \"MMMM YYYY\" }}</span>\n          <span v-else>Present</span>\n          <span class=\"text-red-deep m-l-xs\">\n            {{duration}}\n          </span>\n        </div>\n        <div class=\"font-9 m-t-xs capital\">\n          <h6 class=\"text-light font-1 m-none\">{{record.company.name}}</h6>\n          <h5 class=\"font-1-2 m-t-sm\">{{record.title}}</h5>\n        </div>\n        <p class=\"font-8 font-light m-t-xs\">{{{record.description | lineBreak}}}</p>\n         <div class=\"m-t-sm break-word\">\n             <div track-by=\"$index\" v-for=\"item in record.skills\" class=\"chip font-8 m-l-xs m-b-sm\">{{item.name || item}}</div>\n          </div>\n      </div>\n      <!-- cd-timeline-content -->\n    </div>\n    <!-- cd-timeline-block -->\n  </div>\n</section>\n";

/***/ },

/***/ 618:
/***/ function(module, exports) {

	module.exports = "\n<div v-show=\"loaded\" transition=\"fade-in\" class=\"row\" >\n<!--   <kudos-editor></kudos-editor>\n  <kudosrecord></kudosrecord> -->\n    <div class=\" profile-details col s7 p-none m-t-lg \">\n        <!-- <router-view keep-alive transition-mode=\"out-in\"></router-view> -->\n        <exp-Section></exp-Section>\n        <edu-Section></edu-Section>\n        <section v-if=\"editmode\" class=\"fx-row fx-center-center m-b-lg\">\n          <button @click=\"importLinkedin\" type=\"button\" class=\"btn btn-primary uppercase font-8\">\n            <i class=\"fa fa-linkedin symbol m-r-sm\"></i>\n            <span class=\"capital\" v-ii18n=\"importNow\">Import Linkedin data</span>\n          </button>\n        </section>\n    </div>\n    <div class=\"col s5  m-t-lg p-none\">\n        <about-Section class=\"m-t-xs\"></about-Section>\n        <div class=\"m-none p-none p-l-xs m-t-xs\">\n            <custom-section :editmode=\"editmode\" :categories=\"customsectionscategories\" :profile-id='profileId'></custom-section>\n        </div>\n    </div>\n</div>\n\n";

/***/ },

/***/ 624:
/***/ function(module, exports) {

	module.exports = "\n<div _v-32407124=\"\">\n  <about-modal v-ref:modal-about=\"\" _v-32407124=\"\"></about-modal>\n  <div class=\"m-l-xs\" _v-32407124=\"\">\n    <div class=\"hpanel profile-panel \" id=\"custom-1\" _v-32407124=\"\">\n      <div class=\"panel-body m-none p-none\" _v-32407124=\"\">\n        <div class=\"panel-heading fx-row fx-space-between-center\" _v-32407124=\"\">\n          <div class=\"m-l-md\" _v-32407124=\"\">\n              <i class=\"material-icons\" _v-32407124=\"\"></i><span class=\"m-l-sm capital\" v-ii18n=\"talentHubBadge\" _v-32407124=\"\">JOBI badge</span>\n          </div>\n          <span v-if=\"editmode\" @click=\"editAbout\" type=\"button\" class=\"p-r-xs hand\" name=\"editabout\" _v-32407124=\"\">\n              <i class=\"material-icons\" _v-32407124=\"\"></i>\n          </span>\n        </div>\n\n        <section class=\"p-sm\" _v-32407124=\"\">\n          <div class=\"fx-row p-b-sm fx-start-start\" _v-32407124=\"\">\n            <div @click=\"uploadImage\" :class=\"{'uploader': editmode, 'progress' : loading}\" class=\"m-r-sm\" _v-32407124=\"\">\n              <img :src=\"data.img\" class=\"user-image circle responsive-img size-64\" alt=\"logo\" _v-32407124=\"\">\n            </div>\n\n            <div flex=\"\" _v-32407124=\"\">\n              <span class=\"font-light font-1-5 text-light font-uppercase \" _v-32407124=\"\">{{data.fullname}}</span>\n              <div class=\"font-8 m-t-xs font-uppercase\" _v-32407124=\"\">{{data.title}}</div>\n            </div>\n          </div>\n\n          <div class=\"font-9 font-light word-wrapper\" _v-32407124=\"\">\n            <div v-if=\"editmode &amp;&amp; !data.about\" class=\"empty-data\" _v-32407124=\"\">\n            You may provide here more information about you\n            </div>\n            {{{data.about}}}\n          </div>\n        </section>\n      </div>\n    </div>\n  </div>\n<div _v-32407124=\"\">\n</div></div>";

/***/ },

/***/ 628:
/***/ function(module, exports) {

	module.exports = "\n<div _v-6cec9edd=\"\">\n  <div v-if=\"editmode\" class=\"row\" _v-6cec9edd=\"\">\n    <span @click=\"newSection\" type=\"button\" class=\"hand m-t-sm m-b-sm font-9 col s6 offset-s4\" _v-6cec9edd=\"\">\n      <i class=\"material-icons\" _v-6cec9edd=\"\"></i>\n    <span class=\"capital\" v-ii18n=\"addNewItem\" _v-6cec9edd=\"\">add new item</span>\n    </span>\n  </div>\n\n  <ul class=\"fx-col p-none m-t-md m-l-sm m-r-sm word-wrapper ul-none\" _v-6cec9edd=\"\">\n    <li v-for=\"sec in section.customsections\" class=\"section-item\" _v-6cec9edd=\"\">\n      <div class=\"font-9 fx-row fx-space-between-center\" _v-6cec9edd=\"\">\n        <a v-if=\"sec.url\" :href=\"sec.url\" _v-6cec9edd=\"\">{{sec.title}}</a>\n        <span v-else=\"\" _v-6cec9edd=\"\">{{sec.title}}</span>\n        <div v-if=\"editmode\" @click=\"editSection(sec)\" class=\"edit-section hand\" _v-6cec9edd=\"\">\n            <i class=\"material-icons\" _v-6cec9edd=\"\"></i>\n        </div>\n      </div>\n      <div class=\"font-light font-8 m-t-sm \" _v-6cec9edd=\"\">{{sec.description}}</div>\n    </li>\n  </ul>\n</div>\n";

/***/ },

/***/ 679:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(526)
	__vue_script__ = __webpack_require__(424)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/about/about.container.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(624)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 680:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(425)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/about/about.modal.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(607)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 681:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(426)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/custom-section/custom-section.container.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(608)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 682:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(427)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/custom-section/s-category.editor.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(609)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 683:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(428)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/custom-section/s-category.list.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(610)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 684:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(429)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/custom-section/section.editor.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(611)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 685:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(530)
	__vue_script__ = __webpack_require__(430)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/custom-section/section.list.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(628)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 686:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(431)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/education/education.container.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(612)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 687:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(432)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/education/education.record.list.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(613)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 688:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(433)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/education/education.record.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(614)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 689:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(434)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/experience/experience.container.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(615)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 690:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(435)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/experience/experience.record.list.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(616)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 691:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(436)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/slaves/experience/experience.record.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(617)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 692:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(437)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/profile/view.profile.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(618)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }

});