webpackJsonp([0,16,17],{

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

/***/ 128:
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isReady = isReady;
	exports.isMine = isMine;
	exports.getJoboffer = getJoboffer;
	exports.getJobofferData = getJobofferData;
	exports.getRecommendedIds = getRecommendedIds;
	exports.getRecommendationList = getRecommendationList;
	exports.getAppliedIds = getAppliedIds;
	exports.getApplicationList = getApplicationList;
	exports.jobofferCategories = jobofferCategories;
	exports.jobofferTypes = jobofferTypes;
	exports.jobofferSalaryTypes = jobofferSalaryTypes;
	exports.yearsOfExperience = yearsOfExperience;
	exports.jobofferdegrees = jobofferdegrees;
	function isReady(state) {
	  return state.joboffer.loaded;
	}

	function isMine(state) {
	  if (!state.joboffer.loaded || !state.account.loaded || state.account.loaded == 'unauth') return false;
	  return state.joboffer.data.responsible.id == state.account.data.id;
	}

	function getJoboffer(state) {
	  return state.joboffer;
	}

	function getJobofferData(_ref) {
	  var joboffer = _ref.joboffer;

	  return joboffer.data;
	}

	function getRecommendedIds(_ref2) {
	  var joboffer = _ref2.joboffer;

	  if (!joboffer.data.statistic) return [];
	  return joboffer.data.statistic.recommendations.list.map(function (i) {
	    return i.split(':')[2];
	  });
	}

	function getRecommendationList(_ref3) {
	  var joboffer = _ref3.joboffer;

	  var statistic = joboffer.data.statistic;
	  if (!statistic) return [];
	  return statistic.recommendations.list.map(function (i) {
	    var ids = i.split(':');
	    var rec = { recommenderId: Number(ids[1]), recommendedId: Number(ids[2]), recommendationId: Number(ids[3]) };
	    if (statistic.recpending.list.indexOf(i) > -1) {
	      rec.status = 'pending';
	    } else if (statistic.recpushed.list.indexOf(i) > -1) {
	      rec.status = 'new';
	    }
	    return rec;
	  });
	}

	function getAppliedIds(_ref4) {
	  var joboffer = _ref4.joboffer;

	  if (!joboffer.data.applications) return [];
	  return joboffer.data.applications.map(function (i) {
	    return i.recommended;
	  });
	}

	function getApplicationList(_ref5) {
	  var joboffer = _ref5.joboffer;

	  return joboffer.data.applications;
	}

	function jobofferCategories(state) {
	  return state.joboffer.jobofferCategories;
	}

	function jobofferTypes(state) {
	  return state.joboffer.jobofferTypes;
	}

	function jobofferSalaryTypes(state) {
	  return state.joboffer.salaryTypes;
	}
	function yearsOfExperience(state) {
	  return state.joboffer.yearsOfExperience;
	}
	function jobofferdegrees(state) {
	  return state.joboffer.degrees;
	}

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

/***/ 151:
/***/ function(module, exports) {

	module.exports = "\n <div class=\"hpanel m-none m-b-xs font-8\" _v-1bf56112=\"\">\n   <div class=\"panel-heading\" v-if=\"preview\" _v-1bf56112=\"\">\n     <div class=\"m-l-md\" _v-1bf56112=\"\">\n       <i class=\"fa fa-lightbulb-o\" _v-1bf56112=\"\"></i>\n       <span class=\"capital\" v-ii18n=\"preview\" _v-1bf56112=\"\">preview</span>\n     </div>\n   </div>\n\n   <div class=\"panel-body m-none p-none font-light \" _v-1bf56112=\"\">\n     <section class=\"p-sm\" _v-1bf56112=\"\">\n       <div v-if=\"!preview\" class=\"pull-right\" _v-1bf56112=\"\">\n         <div class=\"panel-tools font-1-2\" _v-1bf56112=\"\">\n           <!-- Reward <span class=\"text-success \">${{data.incentive}}</span> -->\n           <!-- v-link=\"{name: 'joboffer', params: { jobId: data.id }}\" -->\n             <!-- <i class=\"fa fa-th\"></i> -->\n             <a href=\"/joboffer/{{data.slug || data.uuid}}\" class=\"hand text-grey\" _v-1bf56112=\"\">\n                <span class=\"capital middle\" v-ii18n=\"detailLbl\" _v-1bf56112=\"\">View Details <i class=\"material-icons \" _v-1bf56112=\"\"></i></span>\n             </a>\n         </div>\n       </div>\n\n       <div v-if=\"!companylisting\" class=\"fx-row fx-start-center\" _v-1bf56112=\"\">\n         <img :src=\"data.company ? data.company.logo : ''\" alt=\"logo\" class=\"img-rounded border size-48 hand\" _v-1bf56112=\"\">\n         <div class=\"job-title m-l-sm break-word\" flex=\"\" _v-1bf56112=\"\">\n           <a href=\"/company/{{data.company.slug || data.company.uuid}}\" class=\"m-none p-none\" _v-1bf56112=\"\"><h4 class=\"font-1-2 p-none capital m-none hand text-info hand font-light m-b-md\" v-if=\"data.company\" _v-1bf56112=\"\">{{data.company.name || data.company}}</h4></a>\n           <h4 class=\"capital m-none p-none m-t-n-sm font-1-2\" _v-1bf56112=\"\">\n              {{data.title}}\n           </h4>\n         </div>\n       </div>\n       <div v-else=\"\" class=\" \" _v-1bf56112=\"\">\n         <div _v-1bf56112=\"\"><i class=\"fa fa-clock-o m-r-xs\" _v-1bf56112=\"\"></i><span v-from-now=\"data.release_date\" _v-1bf56112=\"\"></span></div>\n         <div _v-1bf56112=\"\">\n           <h4 class=\"capital m-none font-light font-1-5\" _v-1bf56112=\"\">\n             {{data.title}}\n           </h4>\n         </div>\n       </div>\n\n\n       <div class=\"body-container\" _v-1bf56112=\"\">\n         <label class=\"border-bottom font-light font-1-5\" _v-1bf56112=\"\">\n           <span class=\"capital __active\" _v-1bf56112=\"\">summary</span>\n         </label>\n         <div class=\"font-light font-1-2\" _v-1bf56112=\"\">\n           {{{data.summary}}}\n         </div>\n<!--            <label class=\"border-bottom font-light font-1-5\">\n           <span class=\"capital __active\">description</span>\n         </label>\n         <div class=\"font-light font-1-2 joboffer-preview-html-data\">\n           {{{data.description}}}\n         </div>\n\n         <label class=\"border-bottom font-light font-1-5\" v-if=\"data.expectations && data.expectations.length > 0\">\n           <span class=\"capital __active\" v-ii18n=\"requirements\">requirements</span>\n         </label>\n         <div class=\"font-light font-1-2 joboffer-preview-html-data\" v-if=\"data.expectations && data.expectations.length > 0\">\n           {{{data.expectations}}}\n         </div>\n         \n         <label class=\"border-bottom font-light font-1-5\" v-if=\"data.benefits && data.benefits.length > 0\">\n           <span class=\"capital __active\" v-ii18n=\"benefits\">benefits</span>\n         </label>\n         <div class=\"font-light font-1-2 joboffer-preview-html-data\" v-if=\"data.benefits && data.benefits.length > 0\">\n           {{{data.benefits}}}\n         </div> -->\n         <!-- <p class=\"font-light font-1-2\">{{{data.description | lineBreak}}}</p> -->\n         <div class=\"fx-row\" _v-1bf56112=\"\">\n           <span class=\" font-light border p-xxs m-xxs font-1-2\" track-by=\"$index\" v-for=\"item in data.tags\" _v-1bf56112=\"\">\n             {{item.name || item}}</span>\n         </div>\n\n       </div>\n     </section>\n     <div class=\"border-top\" _v-1bf56112=\"\">\n       <div class=\"m-l-md fx-row fx-start-center\" _v-1bf56112=\"\">\n         <section class=\"fx-row fx-start-center\" flex=\"\" _v-1bf56112=\"\">\n           <div class=\"p-r-sm\" _v-1bf56112=\"\">\n              <img :src=\"data.responsible &amp;&amp; data.responsible.img ? data.responsible.img : ''\" class=\"user-image circle responsive-img size-32 m-t-sm m-b-sm hand\" _v-1bf56112=\"\">\n           </div>\n           <div class=\"\" _v-1bf56112=\"\">\n             <div v-if=\"data.responsible\" class=\"hand\" _v-1bf56112=\"\">{{data.responsible.firstname}} {{data.responsible.lastname}}</div>\n             <div v-if=\"!companylisting\" _v-1bf56112=\"\"><i class=\"material-icons md-14 orange600\" _v-1bf56112=\"\"></i><span v-from-now=\"data.release_date\" _v-1bf56112=\"\"></span></div>\n           </div>\n         </section>\n\n\n         <div class=\"\" flex=\"\" _v-1bf56112=\"\">\n           <div class=\"font-uppercase  font-light\" _v-1bf56112=\"\">\n             <i class=\"material-icons md-14 orange600\" _v-1bf56112=\"\"></i>\n             <span class=\"\" _v-1bf56112=\"\">\n               {{data.location.name}}</span>\n           </div>\n         </div>\n\n         <div class=\"\" flex=\"\" _v-1bf56112=\"\">\n           <div class=\"font-uppercase  font-light\" _v-1bf56112=\"\">\n             <i class=\"material-icons md-14 orange600\" _v-1bf56112=\"\"></i>\n             <span _v-1bf56112=\"\">{{data.job_type.name}}</span>\n           </div>\n         </div>\n\n         <div class=\"\" flex=\"\" _v-1bf56112=\"\">\n           <div class=\"font-uppercase font-light fx-col\" v-if=\"data.salary_min || data.salary_max\" _v-1bf56112=\"\">\n             <span class=\"\" _v-1bf56112=\"\">{{data.salary_min | currency}} - {{data.salary_max | currency}}</span>\n             <span _v-1bf56112=\"\">/month</span>\n           </div>\n         </div>\n\n       </div>\n     </div>\n\n\n\n     <div class=\"border-top text-left bg-light m-none p-none\" _v-1bf56112=\"\">\n       <div v-if=\"!preview\" class=\"row \" _v-1bf56112=\"\">\n\n         <!-- <div class=\"p-l-sm col m10\">\n           <ul class=\"social-icons icon-circle icon-zoom  sml list-unstyled list-inline p-l-sm\">\n             <i class=\"material-icons m-r-md\">&#xE80D;</i>\n             <li @click=\"share(data)\" class=\"hand\">\n               <svg style=\"width:32px;height:32px\" viewBox=\"0 0 24 24\"><path fill=\"#BEBEBE\" d=\"M19,4V7H17A1,1 0 0,0 16,8V10H19V13H16V20H13V13H11V10H13V7.5C13,5.56 14.57,4 16.5,4M20,2H4A2,2 0 0,0 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z\" /></svg>\n             </li>\n             <li><a :href=\"twitterLink(data)\" onclick=\"javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;\">\n               <svg style=\"width:32px;height:32px\" viewBox=\"0 0 24 24\"><path fill=\"#BEBEBE\" d=\"M17.71,9.33C17.64,13.95 14.69,17.11 10.28,17.31C8.46,17.39 7.15,16.81 6,16.08C7.34,16.29 9,15.76 9.9,15C8.58,14.86 7.81,14.19 7.44,13.12C7.82,13.18 8.22,13.16 8.58,13.09C7.39,12.69 6.54,11.95 6.5,10.41C6.83,10.57 7.18,10.71 7.64,10.74C6.75,10.23 6.1,8.38 6.85,7.16C8.17,8.61 9.76,9.79 12.37,9.95C11.71,7.15 15.42,5.63 16.97,7.5C17.63,7.38 18.16,7.14 18.68,6.86C18.47,7.5 18.06,7.97 17.56,8.33C18.1,8.26 18.59,8.13 19,7.92C18.75,8.45 18.19,8.93 17.71,9.33M20,2H4A2,2 0 0,0 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z\" /></svg>\n             </li>\n             <li>\n               <a :href=\"gPlusLink(data)\" onclick=\"javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;\">\n                 <svg style=\"width:32px;height:32px\" viewBox=\"0 0 24 24\"><path fill=\"#BEBEBE\" d=\"M20,2A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V4C2,2.89 2.9,2 4,2H20M20,12H18V10H17V12H15V13H17V15H18V13H20V12M9,11.29V13H11.86C11.71,13.71 11,15.14 9,15.14C7.29,15.14 5.93,13.71 5.93,12C5.93,10.29 7.29,8.86 9,8.86C10,8.86 10.64,9.29 11,9.64L12.36,8.36C11.5,7.5 10.36,7 9,7C6.21,7 4,9.21 4,12C4,14.79 6.21,17 9,17C11.86,17 13.79,15 13.79,12.14C13.79,11.79 13.79,11.57 13.71,11.29H9Z\" /></svg>\n               </a>\n             </li>\n             <li>\n               <a :href=\"linkedInLink(data)\" onclick=\"javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;\">\n                 <svg style=\"width:32px;height:32px\" viewBox=\"0 0 24 24\"><path fill=\"#BEBEBE\" d=\"M19,19H16V13.7A1.5,1.5 0 0,0 14.5,12.2A1.5,1.5 0 0,0 13,13.7V19H10V10H13V11.2C13.5,10.36 14.59,9.8 15.5,9.8A3.5,3.5 0 0,1 19,13.3M6.5,8.31C5.5,8.31 4.69,7.5 4.69,6.5A1.81,1.81 0 0,1 6.5,4.69C7.5,4.69 8.31,5.5 8.31,6.5A1.81,1.81 0 0,1 6.5,8.31M8,19H5V10H8M20,2H4C2.89,2 2,2.89 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z\" /></svg>\n               </a>\n             </li>\n             <li>\n               <a :href=\"tumblrLink(data)\" onclick=\"javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;\">\n                 <svg style=\"width:32px;height:32px\" viewBox=\"0 0 24 24\"><path fill=\"#BEBEBE\" d=\"M16,11H13V14.9C13,15.63 13.14,16 14.1,16H16V19C16,19 14.97,19.1 13.9,19.1C11.25,19.1 10,17.5 10,15.7V11H8V8.2C10.41,8 10.62,6.16 10.8,5H13V8H16M20,2H4C2.89,2 2,2.89 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z\" /></svg>\n               </a>\n             </li>\n           </ul>\n         </div> -->\n\n       <div v-if=\"!isMine &amp;&amp; !data.apply &amp;&amp; !anonym\" class=\"m-none p-none right p-t-sm p-r-sm \" _v-1bf56112=\"\">\n\n         <div class=\"p-t-xs \" _v-1bf56112=\"\">\n           <div title=\"you already applied for this job offer\" id=\"applied-preview-{{data.id}}\" class=\"font-light font-9 m-l-xs p-r-sm uppercase cursor \" _v-1bf56112=\"\"><i class=\"material-icons\" _v-1bf56112=\"\"></i></div>\n\n         </div>\n\n       </div>\n\n\n       </div>\n\n       <div class=\"clearfix\" _v-1bf56112=\"\"></div>\n     </div>\n   </div>\n </div>\n";

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

/***/ 156:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.loadDegrees = exports.loadYearOfExperience = exports.loadSalaryTypes = exports.loadjobTypes = exports.loadjobCategories = exports.saveJobofferQuiz = exports.saveJoboffer = exports.resetJoboffer = exports.loadJoboffer = undefined;

	var _typeof2 = __webpack_require__(42);

	var _typeof3 = _interopRequireDefault(_typeof2);

	var _assign = __webpack_require__(106);

	var _assign2 = _interopRequireDefault(_assign);

	var _promise = __webpack_require__(9);

	var _promise2 = _interopRequireDefault(_promise);

	var _notifsCenter = __webpack_require__(13);

	var _notifsCenter2 = _interopRequireDefault(_notifsCenter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var connect = __webpack_require__(3);

	var loadJoboffer = exports.loadJoboffer = function loadJoboffer(_ref, jobofferId, persist) {
	  var dispatch = _ref.dispatch;
	  var state = _ref.state;

	  return new _promise2.default(function (resolve, reject) {
	    if (state.joboffer.loaded == jobofferId) resolve(state.joboffer.data);else {
	      connect.apiAsync('GET', '/joboffers/' + jobofferId).then(function (res) {
	        resolve(res);
	        dispatch('SET_JOBOFFER_DATA', res, persist);
	      }).catch(function (err) {
	        _notifsCenter2.default.fail(err);
	        reject(err);
	      });
	    }
	  });
	};

	var resetJoboffer = exports.resetJoboffer = function resetJoboffer(_ref2, force) {
	  var dispatch = _ref2.dispatch;
	  var state = _ref2.state;

	  dispatch('RESET_JOBOFFER_DATA', force);
	};

	var saveJoboffer = exports.saveJoboffer = function saveJoboffer(_ref3, data) {
	  var dispatch = _ref3.dispatch;
	  var state = _ref3.state;

	  var jobId = data.id;
	  return new _promise2.default(function (resolve, reject) {
	    var url = jobId ? '/joboffers/' + jobId : '/joboffers';
	    var method = jobId ? 'PUT' : 'POST';
	    data = $formatJob((0, _assign2.default)({}, data));
	    connect.apiAsync(method, url, data).then(function (res) {
	      resolve(res);
	    }).catch(function (err) {
	      _notifsCenter2.default.fail(err);
	      reject(err);
	    });
	  });
	};

	var saveJobofferQuiz = exports.saveJobofferQuiz = function saveJobofferQuiz(_ref4, data, jobId) {
	  var dispatch = _ref4.dispatch;
	  var state = _ref4.state;

	  return new _promise2.default(function (resolve, reject) {
	    if (!data.questions || !data.questions[0] || !jobId) return resolve();
	    data.questions = data.questions.map(function (i) {
	      return { subject: i.subject, target: i.target, type: i.type };
	    });
	    connect.apiAsync('PUT', '/joboffers/' + jobId, data).then(function (res) {
	      resolve(res);
	    }).catch(function (err) {
	      _notifsCenter2.default.fail(err);
	      reject(err);
	    });
	  });
	};

	var loadjobCategories = exports.loadjobCategories = function loadjobCategories(_ref5) {
	  var dispatch = _ref5.dispatch;
	  var state = _ref5.state;

	  if (state.joboffer.jobofferCategories) return;
	  connect.apiAsync('GET', '/jobofferCategories').then(function (res) {
	    return dispatch('SET_JOBOFFER_CATEGORIES', res);
	  }, function (err) {
	    return console.warn('err load joboffer Categories', err.responseText);
	  });
	};

	var loadjobTypes = exports.loadjobTypes = function loadjobTypes(_ref6) {
	  var dispatch = _ref6.dispatch;
	  var state = _ref6.state;

	  if (state.joboffer.jobofferTypes) return;
	  connect.apiAsync('GET', '/jobofferTypes').then(function (res) {
	    return dispatch('SET_JOBOFFER_TYPES', res);
	  }, function (err) {
	    return console.warn('err load joboffer Types', err.responseText);
	  });
	};

	var loadSalaryTypes = exports.loadSalaryTypes = function loadSalaryTypes(_ref7) {
	  var dispatch = _ref7.dispatch;
	  var state = _ref7.state;

	  if (state.joboffer.salaryTypes) return;
	  connect.apiAsync('GET', '/salaryTypes').then(function (res) {
	    return dispatch('SET_JOBOFFER_SALARYTYPES', res);
	  }, function (err) {
	    return console.warn('err load joboffer salary Types', err.responseText);
	  });
	};
	var loadYearOfExperience = exports.loadYearOfExperience = function loadYearOfExperience(_ref8) {
	  var dispatch = _ref8.dispatch;
	  var state = _ref8.state;

	  if (state.joboffer.yearsOfExperience) return;
	  connect.apiAsync('GET', '/jobofferExperience').then(function (res) {
	    return dispatch('SET_JOBOFFER_YEARSEXPERIENCE', res);
	  }, function (err) {
	    return console.warn('err load joboffer years of experience', err.responseText);
	  });
	};

	var loadDegrees = exports.loadDegrees = function loadDegrees(_ref9) {
	  var dispatch = _ref9.dispatch;
	  var state = _ref9.state;

	  if (state.joboffer.degrees) return;
	  connect.apiAsync('GET', '/degrees').then(function (res) {
	    return dispatch('SET_JOBOFFER_DEGREES', res);
	  }, function (err) {
	    return console.warn('err load joboffer degrees', err.responseText);
	  });
	};

	function $formatJob(src) {
	  var fields = ['questions', 'tags', 'targets', 'title', 'company_id', 'description', 'incentive', 'salary_type', 'salary_min', 'salary_max', 'city_id', 'degree', 'jobtype_id', 'experience_id', 'release_date', 'type', 'requirements', 'state'];
	  var data = {};
	  fields.map(function (i) {
	    return data[i] = src[i];
	  });
	  if (!data.company_id) data.company_id = $isObject(src.company) ? src.company.id : src.company;
	  if (!data.city_id) data.city_id = $isObject(src.location) ? src.location.id : src.location;
	  if (!data.release_date) delete data.release_date;
	  if (!data.type) data.type = 'public';
	  return data;
	}

	function $isObject(obj) {
	  return (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object';
	}

/***/ },

/***/ 161:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _promise = __webpack_require__(9);

	var _promise2 = _interopRequireDefault(_promise);

	var _actions = __webpack_require__(11);

	var _getters = __webpack_require__(20);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var educationEditor = __webpack_require__(152);

	module.exports = {
	  vuex: {
	    actions: {
	      setActiveEdu: _actions.setActiveEdu
	    },
	    getters: {
	      educations: _getters.profileEdus
	    }
	  },
	  components: {
	    educationEditor: educationEditor
	  },
	  computed: {
	    empty: function empty() {
	      return this.educations ? !this.educations[0] : true;
	    }
	  },
	  methods: {
	    edit: function edit(item) {
	      this.setActiveEdu(item);
	      this.$refs.editor.edit(item);
	    },
	    addEducation: function addEducation() {
	      this.$refs.editor.new();
	    },
	    next: function next() {
	      return new _promise2.default(function (resolve, reject) {
	        resolve();
	      });
	    }
	  }
	};

/***/ },

/***/ 162:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _promise = __webpack_require__(9);

	var _promise2 = _interopRequireDefault(_promise);

	var _actions = __webpack_require__(11);

	var _getters = __webpack_require__(20);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var experienceEditor = __webpack_require__(153);

	module.exports = {
	  vuex: {
	    actions: {
	      setActiveExp: _actions.setActiveExp
	    },
	    getters: {
	      experiences: _getters.profileExps
	    }
	  },
	  components: {
	    experienceEditor: experienceEditor
	  },
	  computed: {
	    empty: function empty() {
	      return this.experiences ? !this.experiences[0] : true;
	    }
	  },
	  methods: {
	    edit: function edit(item) {
	      this.setActiveExp(item);
	      this.$refs.editor.edit(item);
	    },
	    addWork: function addWork() {
	      this.$refs.editor.new();
	    },
	    next: function next() {
	      return new _promise2.default(function (resolve, reject) {
	        resolve();
	      });
	    }
	  }
	};

/***/ },

/***/ 163:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".work-body[_v-745a3c60] {\n  max-height: 300px;\n  overflow-y: auto;\n  overflow-x: none;\n}\n.work-body .work-edit[_v-745a3c60] {\n  opacity: 0;\n  -webkit-transition: 200ms all;\n  transition: 200ms all;\n}\n.work-body .fx-row:hover .work-edit[_v-745a3c60] {\n  opacity: 1;\n}\n", ""]);

	// exports


/***/ },

/***/ 165:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".work-body[_v-d95e852e] {\n  max-height: 300px;\n  overflow-y: auto;\n  overflow-x: none;\n}\n.work-body .work-edit[_v-d95e852e] {\n  opacity: 0;\n  -webkit-transition: 200ms all;\n  transition: 200ms all;\n}\n.work-body .fx-row:hover .work-edit[_v-d95e852e] {\n  opacity: 1;\n}\n", ""]);

	// exports


/***/ },

/***/ 166:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(163);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-745a3c60&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.work.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-745a3c60&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.work.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 168:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(165);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-d95e852e&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.education.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-d95e852e&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.education.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 170:
/***/ function(module, exports) {

	module.exports = "\n<div _v-745a3c60=\"\">\n  <h4 class=\"capital m-none center\" v-ii18n=\"experience\" _v-745a3c60=\"\">experience</h4>\n\n  <div class=\"panel panel-default\" _v-745a3c60=\"\">\n    <div class=\"panel-body fx-col fx-center-start\" _v-745a3c60=\"\">\n\n      <div class=\"fx-col\" _v-745a3c60=\"\">\n        <section v-if=\"empty\" class=\"fx-col fx-start-center placeholder\" _v-745a3c60=\"\">\n          <i class=\"material-icons symbol\" _v-745a3c60=\"\"></i>\n          <h4 class=\"m-none font-1-5 capital\" v-ii18n=\"addExperienceText\" _v-745a3c60=\"\">add your first experience</h4>\n          <p class=\"m-none capital\" v-ii18n=\"addExperienceText2\" _v-745a3c60=\"\">add your work experience to enhance your profile</p>\n        </section>\n\n        <section v-else=\"\" class=\"work-body\" _v-745a3c60=\"\">\n          <ul class=\"lv-list\" _v-745a3c60=\"\">\n            <li v-for=\"experience in experiences\" class=\"fx-row fx-space-between-center lv-item\" _v-745a3c60=\"\">\n              <div class=\"fx-row\" _v-745a3c60=\"\">\n                <img :src=\"experience.company.logo\" class=\"company-logo img-rounded border size-48\" alt=\"company logo\" _v-745a3c60=\"\">\n                <div class=\"m-l-sm font-9\" _v-745a3c60=\"\">\n                  <h6 class=\"font-1-2 m-none\" _v-745a3c60=\"\">{{experience.company.name}}</h6>\n                  <h5 class=\"font-1-2 m-none\" _v-745a3c60=\"\">{{experience.title}}</h5>\n                  <div class=\"capital m-none font-light text-light\" _v-745a3c60=\"\">\n                  <span class=\"capital\" _v-745a3c60=\"\">{{experience.since | moment \"MMMM YYYY\" }} </span>\n                  <span class=\"m-xs\" _v-745a3c60=\"\"> - </span>\n                  <span class=\"capital\" v-if=\"experience.until\" _v-745a3c60=\"\">{{experience.until | moment \"MMMM YYYY\" }}</span>\n                  <span class=\"capital\" v-ii18n=\"present\" v-else=\"\" _v-745a3c60=\"\">present</span>\n                  </div>\n                </div>\n              </div>\n              <span @click=\"edit(experience)\" class=\"work-edit m-r-md hand\" _v-745a3c60=\"\"><i class=\"material-icons\" _v-745a3c60=\"\"></i></span>\n             <!--  <button  class=\"btn btn-ghost -edit-btn\"><i class=\"fa fa-pencil\" aria-hidden=\"true\"></i></button> -->\n            </li>\n          </ul>\n        </section>\n\n        <section class=\"fx-col fx-start-center m-t-sm\" _v-745a3c60=\"\">\n          <a @click=\"addWork\" class=\"waves-effect waves-light btn\" _v-745a3c60=\"\"><i class=\"material-icons md-14 text-white\" _v-745a3c60=\"\"></i> Add experience</a>\n        </section>\n      </div>\n\n    </div>\n  </div>\n\n  <experience-editor v-ref:editor=\"\" _v-745a3c60=\"\"></experience-editor>\n\n</div>\n";

/***/ },

/***/ 172:
/***/ function(module, exports) {

	module.exports = "\n<div _v-d95e852e=\"\">\n  <h4 class=\"capital m-none center m-b-sm\" v-ii18n=\"education\" _v-d95e852e=\"\">education</h4>\n  <div class=\"panel panel-default\" _v-d95e852e=\"\">\n    <div class=\"panel-body fx-col fx-center-start\" _v-d95e852e=\"\">\n\n      <div class=\"fx-col\" _v-d95e852e=\"\">\n        <section v-if=\"empty\" class=\"fx-col fx-start-center placeholder capital\" _v-d95e852e=\"\">\n          <i class=\"material-icons symbol\" _v-d95e852e=\"\"></i>\n          <h4 class=\"m-none font-1-5 capital\" v-ii18n=\"addEducationText\" _v-d95e852e=\"\">add your first education</h4>\n          <p class=\"m-none capital\" v-ii18n=\"addEducationText2\" _v-d95e852e=\"\">add your education to enhance your profile</p>\n        </section>\n\n        <section v-else=\"\" class=\"work-body\" _v-d95e852e=\"\">\n          <ul class=\"lv-list\" _v-d95e852e=\"\">\n            <li v-for=\"education in educations\" class=\"fx-row fx-space-between-center lv-item \" _v-d95e852e=\"\">\n              <div class=\"fx-row\" _v-d95e852e=\"\">\n                <img :src=\"education.school.logo ? education.school.logo : '/assets/images/no-img.png'\" class=\"img-rounded border size-48\" _v-d95e852e=\"\">\n                <div class=\"m-l-sm font-9\" _v-d95e852e=\"\">\n                  <h6 class=\"font-1-2 m-none\" _v-d95e852e=\"\">{{education.degree.name}}</h6>\n                  <h5 class=\"capital font-1-2 m-none\" _v-d95e852e=\"\">{{education.school.name}}</h5>\n                  <div class=\"capital m-none font-light text-light\" _v-d95e852e=\"\">\n                    <span class=\"capital\" _v-d95e852e=\"\">{{education.since | moment \"MMMM YYYY\" }} </span>\n                    <span class=\"m-xs\" _v-d95e852e=\"\"> - </span>\n                    <span class=\"capital\" v-if=\"education.until\" _v-d95e852e=\"\">{{education.until | moment \"MMMM YYYY\" }}</span>\n                    <span class=\"capital\" v-else=\"\" _v-d95e852e=\"\">Present</span>\n                  </div>\n                </div>\n              </div>\n              <span @click=\"edit(education)\" class=\"work-edit m-l-md hand\" _v-d95e852e=\"\"><i class=\"material-icons\" _v-d95e852e=\"\"></i></span>\n              <!-- <button @click=\"edit(education)\" class=\"btn btn-ghost -edit-btn\"><i class=\"fa fa-pencil\" aria-hidden=\"true\"></i></button> -->\n            </li>\n          </ul>\n        </section>\n\n        <section class=\"fx-col fx-start-center m-t-sm\" _v-d95e852e=\"\">\n           <a @click=\"addEducation\" class=\"waves-effect waves-light btn\" _v-d95e852e=\"\"><i class=\"material-icons md-14 text-white\" _v-d95e852e=\"\"></i> Add education</a>\n        </section>\n      </div>\n\n    </div>\n  </div>\n\n    <education-editor v-ref:editor=\"\" _v-d95e852e=\"\"></education-editor>\n    <!-- <addeducation v-ref:addeducation></addeducation> -->\n</div>\n\n";

/***/ },

/***/ 174:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(168)
	__vue_script__ = __webpack_require__(161)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/welcome/view.education.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(172)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 175:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(166)
	__vue_script__ = __webpack_require__(162)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/welcome/view.work.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(170)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 179:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.filterUpdate = exports.goToPage = exports.orderUpdate = exports.termUpdate = exports.loadJoboffers = undefined;

	var _promise = __webpack_require__(9);

	var _promise2 = _interopRequireDefault(_promise);

	var _assign = __webpack_require__(106);

	var _assign2 = _interopRequireDefault(_assign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var connect = __webpack_require__(3);
	var tungolia = __webpack_require__(34).tungolia;
	var loadJoboffers = exports.loadJoboffers = function loadJoboffers(_ref) {
	  var dispatch = _ref.dispatch;
	  var state = _ref.state;

	  var _options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	  (0, _assign2.default)(options, _options);
	  return new _promise2.default(function (resolve, reject) {
	    connect.apiCall(options, tungolia.url + '/filter/joboffer', 'POST', function (err, res, header) {
	      if (err) {
	        console.log(err);
	        reject(err);
	      } else {
	        dispatch('SET_FILTER_RESULT', res, options);
	        resolve();
	      }
	    });
	  });
	};

	var termUpdate = exports.termUpdate = function termUpdate(_ref2, config) {
	  var dispatch = _ref2.dispatch;
	  var state = _ref2.state;

	  loadJoboffers({ dispatch: dispatch, state: state }, config);
	};

	var orderUpdate = exports.orderUpdate = function orderUpdate(_ref3, sortBy, orderby) {
	  var dispatch = _ref3.dispatch;
	  var state = _ref3.state;

	  var query = { 'sortBy': sortBy, 'sortOrder': orderby };
	  console.log(query);
	  loadJoboffers({ dispatch: dispatch, state: state }, query);
	};

	var goToPage = exports.goToPage = function goToPage(_ref4, page) {
	  var dispatch = _ref4.dispatch;
	  var state = _ref4.state;

	  var query = { page: page };
	  loadJoboffers({ dispatch: dispatch, state: state }, query).then(function () {
	    return window.$('html, body').animate({ scrollTop: '0px' });
	  });
	};

	var filterUpdate = exports.filterUpdate = function filterUpdate(_ref5, data) {
	  var dispatch = _ref5.dispatch;
	  var state = _ref5.state;

	  if (data.category == 'salary') {
	    filterBase[data.category][0] = data;
	  } else {
	    var item = filterBase[data.category].find(function (i) {
	      return i.value == data.value;
	    });
	    if (item) filterBase[data.category].$remove(item);else filterBase[data.category].push(data);
	  }
	  console.info('filterBase[data.category]', filterBase[data.category]);
	  var filters = parseFilters();
	  loadJoboffers({ dispatch: dispatch, state: state }, { filters: filters });
	};

	function parseFilters() {
	  var filters = [];
	  filters = filters.concat(filterBase.category.map(function (i) {
	    return { field: 'category.name.full', type: 'term', value: i.value };
	  }));
	  filters = filters.concat(filterBase.company.map(function (i) {
	    return { field: 'company.name.full', type: 'term', value: i.value };
	  }));
	  filters = filters.concat(filterBase.jobtype.map(function (i) {
	    return { field: 'job_type.full', type: 'term', value: i.value };
	  }));
	  filters = filters.concat(filterBase.salary.map(function (i) {
	    return { field: 'salary_min', type: 'range', from: i.value[0], to: i.value[1] };
	  }));
	  filters = filters.concat(filterBase.salary.map(function (i) {
	    return { field: 'salary_max', type: 'range', from: i.value[0], to: i.value[1] };
	  }));
	  filters = filters.concat(filterBase.tags.map(function (i) {
	    return { field: 'tags', type: 'term', value: i.value };
	  }));
	  return filters;
	}

	var filterBase = {
	  category: [],
	  company: [],
	  jobtype: [],
	  salary: [],
	  tags: []
	};

	var options = {
	  parser: 'source',
	  page: 1,
	  hitsPerPage: 10,
	  facets: [{ 'field': 'incentive', 'type': 'stats' }, { 'field': 'salary_min', 'type': 'min' }, { 'field': 'salary_max', 'type': 'max' }, { 'field': 'job_type.full', 'type': 'terms' }, { 'field': 'experience', 'type': 'terms' }, { 'field': 'company.name.full', 'type': 'terms' }, { 'field': 'category.name.full', 'type': 'terms' }]
	};

/***/ },

/***/ 181:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _actions = __webpack_require__(105);

	var _actions2 = __webpack_require__(156);

	var _getters = __webpack_require__(128);

	var _actions3 = __webpack_require__(11);

	var _getters2 = __webpack_require__(20);

	var modal = __webpack_require__(12);
	var question = __webpack_require__(193);
	var experience = __webpack_require__(175);
	var education = __webpack_require__(174);
	var connector = __webpack_require__(3);
	var bus = __webpack_require__(6);


	module.exports = {
	  vuex: {
	    actions: {
	      loadJoboffer: _actions2.loadJoboffer,
	      resetJoboffer: _actions2.resetJoboffer,
	      setJApply: function setJApply(_ref) {
	        var dispatch = _ref.dispatch;
	        return dispatch('SET_JOBOFFER_APPLY');
	      },
	      setTApply: function setTApply(_ref2, id) {
	        var dispatch = _ref2.dispatch;
	        return dispatch('SET_TIMELINE_APPLY', id);
	      },
	      loadProfile: _actions3.loadProfile,
	      notify: _actions.notify
	    },
	    getters: {
	      joboffer: _getters.getJobofferData,
	      questions: function questions(state) {
	        return state.joboffer.data.applicationQuestions;
	      },
	      profile: _getters2.profileData
	    }
	  },
	  data: function data() {
	    return {
	      isLoading: false,
	      showModal: false,
	      error: null,
	      answers: [],
	      authorised: true,
	      nextstep: false
	    };
	  },

	  components: {
	    modal: modal,
	    question: question,
	    experience: experience,
	    education: education
	  },
	  ready: function ready() {
	    this.loadProfile();
	    bus.$on('joboffer:apply', this.show);
	  },
	  destroyed: function destroyed() {
	    bus.$off('joboffer:apply');
	  },

	  methods: {
	    show: function show(joboffer) {
	      var _this = this;

	      var vm = this;
	      var id = joboffer.slug ? joboffer.slug : joboffer.uuid;
	      this.isLoading = true;
	      this.reset();
	      this.loadJoboffer(id).then(function () {
	        if (!vm.check()) _this.showModal = true;
	        vm.isLoading = false;
	      });
	    },
	    check: function check() {
	      if (this.profile && this.profile.experience.length > 0 && this.profile.education.length > 0) {
	        if (!this.joboffer.applicationQuestions.length) {
	          this.sendApply();
	          return true;
	        } else return false;
	      } else {
	        this.authorised = false;
	        return false;
	      }
	    },
	    sendApply: function sendApply() {
	      var _this2 = this;

	      var application = { joboffer_id: this.joboffer.id };
	      var vm = this;
	      if (vm.questions.length) {
	        application.responses = vm.questions.map(function (i, j) {
	          return { question: i.id, content: vm.answers[j] };
	        });
	      }
	      vm.isLoading = true;
	      this.error = null;
	      connector.apiAsync('POST', '/applications', application).then(function (res) {
	        vm.isLoading = false;
	        vm.setJApply();
	        vm.setTApply(_this2.joboffer.id);
	        vm.close();
	      }).catch(function (err) {
	        vm.error = err.responseJSON.msg;
	        vm.isLoading = false;
	      });
	    },
	    reset: function reset() {
	      this.resetJoboffer();
	      this.isLoading = false;
	      this.error = null;
	      this.answers = [];
	      this.nextstep = false;
	      this.authorised = true;
	    },
	    close: function close() {
	      this.reset();
	      this.showModal = false;
	    },
	    next: function next() {
	      if (this.profile.experience.length == 0) this.notify('error', 'You must add at least one experience.');else if (this.profile.education.length == 0) this.nextstep = true;else this.authorised = true;
	    }
	  }
	};

/***/ },

/***/ 182:
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  data: function data() {
	    return {
	      preview: false
	    };
	  },

	  props: {
	    question: {
	      type: Object,
	      required: true
	    },
	    answer: {
	      required: true
	    },
	    index: {
	      type: Number,
	      required: true
	    }
	  },
	  computed: {
	    remainChars: function remainChars() {
	      if (this.answer && this.answer.length) {
	        return 240 - this.answer.split('\n').join('  ').length;
	      } else return 240;
	    }
	  }
	};

/***/ },

/***/ 183:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bus = __webpack_require__(6);

	module.exports = {
	  data: function data() {
	    return {
	      autoResult: []
	    };
	  },
	  ready: function ready() {
	    bus.$on('joboffer:share', this.share);
	  },
	  destroyed: function destroyed() {
	    bus.$off('joboffer:share');
	  },

	  methods: {
	    share: function share(joboffer) {
	      var url = window.location.href + 'joboffer/' + joboffer.id;
	      var logo = 'https://ucarecdn.com/3c46a4cb-c899-4e7c-9513-0e642ae6899a/-/crop/266x266/0,0/-/preview/';
	      var meta = {
	        method: 'share',
	        mobile_iframe: true,
	        title: joboffer.title + ' at ' + joboffer.company.name,
	        href: url,
	        picture: joboffer.company.logo || logo,
	        caption: 'Talenthub.io | Millions of recruiters',
	        description: joboffer.description
	      };
	      console.info('meta', meta);
	      window.FB.ui(meta);
	    }
	  }
	};

/***/ },

/***/ 185:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "", ""]);

	// exports


/***/ },

/***/ 186:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(185);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./refer.questions.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./refer.questions.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 188:
/***/ function(module, exports) {

	module.exports = "\n<modal :show.sync=\"showModal\">\n  <div class=\"m-b-md m-t-md p-l-lg p-r-lg\" slot=\"body\">\n  <div v-if=\"authorised\">\n    <div class=\"m-b-xs capital\">\n      <p>In order for your Application to go through, you need to answer to the following Quiz posted by the recruiter.</p>\n    </div>\n    <div v-if=\"questions && questions.length\">\n      <h4 class=\"p-none m-none m-t-md m-b-xs capital\" v-ii18n=\"quiz\">quiz</h4>\n       <div v-for=\"question in questions\" trak-by=\"$index\" class=\"h-max-250 p-none border-top\" v-if=\"showModal\">\n        <question :index=\"$index\" :question=\"question\" :answer.sync=\"answers[$index]\"></question>\n      </div>\n    </div>\n  </div>\n  <div v-else>\n    <div class=\"m-b-xs capital\">\n      <p>In order for your Application to go through, you need to have at least one experience and one education record.</p>\n    <experience v-if=\"!nextstep\"></experience>\n    <education v-if=\"nextstep\"></education>\n    </div>\n  </div>\n  </div>\n </div>\n  <div class=\"pull-right m-r-md m-t-sm row\" slot=\"footer\">\n    <button :disabled=\"isLoading\" @click=\"close\" class=\"font-light btn-flat text-white hand font-8 uppercase\" v-ii18n=\"cancel\">cancel</button>\n     <button v-if=\"!authorised\" @click=\"next\" class=\"btn btn-xs btn-success font-light font-1-1 m-l-xs uppercase pull-right\" v-ii18n=\"apply\">next</button>\n     <button v-if=\"authorised\" :disabled=\"isLoading\" @click=\"sendApply\" class=\"btn btn-xs btn-success font-light font-1-1 uppercaset\" v-ii18n=\"apply\">apply</button>\n  </div>\n  </div>\n</modal>\n";

/***/ },

/***/ 189:
/***/ function(module, exports) {

	module.exports = "\n<div class=\"p-none m-none\">\n    <h5 class=\"break-word\">{{question.subject}}</h5>\n    <div v-if=\"question.type=='Y/N'\">\n        <div>\n              <p>\n                <input class=\"with-gap\" type=\"radio\" id=\"yes-{{_index}}\" value=\"Yes\" v-model=\"answer\" name=\"inpt-{{_index}}\"/>\n                <label for=\"yes-{{_index}}\" v-ii18n=\"yes\">yes</label>\n              </p>\n              <p>\n                <input class=\"with-gap\" type=\"radio\" id=\"no-{{_index}}\" value=\"No\" v-model=\"answer\" name=\"inpt-{{_index}}\" />\n                <label for=\"no-{{_index}}\" v-ii18n=\"no\">no</label>\n              </p>\n        </div>\n    </div>\n    <div v-if=\"question.type=='Free'\">\n       <div class=\"row\">\n           <form class=\"col s12\">\n            <div class=\"row\">\n              <div class=\"input-field col s12\">\n                 <textarea id=\"textarea1\" class=\"materialize-textarea\" v-model=\"answer | substring 240\" maxlength=\"240\"></textarea>\n                  <label for=\"textarea1\">Question Response</label>\n              </div>\n              <div class=\" font-8 text-warning pull-right\">{{remainChars}}</div>\n             </div>\n         </form>\n       </div>\n    </div>\n</div>\n";

/***/ },

/***/ 190:
/***/ function(module, exports) {

	module.exports = "<div id=\"fb-root\"></div>";

/***/ },

/***/ 192:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(181)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/home/slaves/apply.container.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(188)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 193:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(186)
	__vue_script__ = __webpack_require__(182)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/home/slaves/refer.questions.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(189)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 194:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(183)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/home/slaves/share.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(190)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 196:
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isReady = isReady;
	exports.filterResult = filterResult;
	exports.filterTotal = filterTotal;
	exports.filterMaxPage = filterMaxPage;
	exports.filterPage = filterPage;
	exports.filterLimit = filterLimit;
	exports.filterCategory = filterCategory;
	exports.filterCompany = filterCompany;
	exports.filterJobtype = filterJobtype;
	exports.filterExperience = filterExperience;
	exports.filterSalary = filterSalary;
	function isReady(state) {
	  return state.filter.loaded;
	}

	function filterResult(_ref) {
	  var filter = _ref.filter;

	  return filter.result;
	}

	function filterTotal(_ref2) {
	  var filter = _ref2.filter;

	  return filter.total;
	}

	function filterMaxPage(_ref3) {
	  var filter = _ref3.filter;

	  return filter.maxPage;
	}

	function filterPage(_ref4) {
	  var filter = _ref4.filter;

	  return filter.page;
	}

	function filterLimit(_ref5) {
	  var filter = _ref5.filter;

	  return filter.limit;
	}

	function filterCategory(_ref6) {
	  var filter = _ref6.filter;

	  if (!filter.facets || !filter.facets['category.name.full']) return [];
	  return filter.facets['category.name.full'].map(function (i) {
	    return { name: i.key, count: i.doc_count, value: i.key };
	  });
	}

	function filterCompany(_ref7) {
	  var filter = _ref7.filter;

	  if (!filter.facets || !filter.facets['company.name.full']) return [];
	  return filter.facets['company.name.full'].map(function (i) {
	    return { name: i.key, count: i.doc_count, value: i.key };
	  });
	}

	function filterJobtype(_ref8) {
	  var filter = _ref8.filter;

	  if (!filter.facets || !filter.facets['job_type.full']) return [];
	  return filter.facets['job_type.full'].map(function (i) {
	    return { name: i.key, count: i.doc_count, value: i.key };
	  });
	}

	function filterExperience(_ref9) {
	  var filter = _ref9.filter;

	  if (!filter.facets || !filter.facets['experience']) return [];
	  return filter.facets['experience'].map(function (i) {
	    return { name: experience[i.key], count: i.doc_count, value: i.key };
	  });
	}

	function filterSalary(_ref10) {
	  var filter = _ref10.filter;

	  if (!filter.facets) return null;

	  return { min: filter.facets['salary_min'].value, max: filter.facets['salary_max'].value };
	}

	var experience = {
	  1: 'junior',
	  2: 'senior',
	  3: 'director'
	};

/***/ },

/***/ 207:
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  data: function data() {
	    return {
	      isLoading: 0
	    };
	  }
	};

/***/ },

/***/ 216:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*doc\n---\ntitle: Colors\nname: colors\ncategory: Base CSS\n---\n\nColors: to be able to use the predefined colors, You need to import common/less/colors.less\n\n```html_example\n<style>\n@import \"../src/components/common/less/colors.less\"\n</style>\n<div class=\"size-32\" style=\"background-color: @color-navy-blue\">Click</div>\n```\n*/\n/* Mixin */\n", ""]);

	// exports


/***/ },

/***/ 222:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(216);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-f71ee0ca&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./advanced-filter.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-f71ee0ca&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./advanced-filter.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 234:
/***/ function(module, exports) {

	module.exports = "\n<section class=\"advanced-filter\" _v-f71ee0ca=\"\">\n\n\n\n</section>\n";

/***/ },

/***/ 242:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(222)
	__vue_script__ = __webpack_require__(207)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/shared/layout/advanced-filter.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(234)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 364:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(537)
	__vue_script__ = __webpack_require__(412)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/filter/view.filter.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(635)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 403:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bus = __webpack_require__(6);
	module.exports = {
		props: {
			options: {
				type: Array
			},
			category: {
				type: String
			},
			statistic: {
				type: Boolean,
				default: false
			}
		},
		data: function data() {
			return {
				componentId: Math.floor(Math.random() * 1000),
				selected: []
			};
		},

		methods: {
			filterChange: function filterChange(item) {
				var vm = this;
				bus.$emit('filter:changed', {
					category: vm.category,
					value: item.name
				});
			}
		}
	};

/***/ },

/***/ 404:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(196);

	var _actions = __webpack_require__(179);

	var checkList = __webpack_require__(658);
	var radioList = __webpack_require__(660);
	var range = __webpack_require__(661);
	var tags = __webpack_require__(662);
	var bus = __webpack_require__(6);


	module.exports = {
		vuex: {
			actions: {
				filterUpdate: _actions.filterUpdate
			},
			getters: {
				categoryList: _getters.filterCategory,
				companyList: _getters.filterCompany,
				jobtypeList: _getters.filterJobtype,
				experienceList: _getters.filterExperience,
				salaryRange: _getters.filterSalary
			}
		},
		components: {
			checkList: checkList,
			radioList: radioList,
			range: range,
			tags: tags
		},
		ready: function ready() {
			$(document).ready(function () {
				return $('.-filter-list').collapsible({ accordion: false });
			});
			bus.$on('filter:changed', this.filterUpdate);
		},
		destoyed: function destoyed() {
			bus.$off('filter:changed');
		},

		methods: {}
	};

/***/ },

/***/ 405:
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  props: {
	    options: {
	      type: Array
	    }
	  },
	  data: function data() {
	    return {
	      componentId: Math.floor(Math.random() * 100)
	    };
	  }
	};

/***/ },

/***/ 406:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bus = __webpack_require__(6);
	__webpack_require__(553);
	var noUiSlider = __webpack_require__(545);
	var slider;
	module.exports = {
		props: {
			options: {
				type: Object
			},
			category: {
				type: String
			}
		},
		data: function data() {
			return {
				componentId: Math.floor(Math.random() * 100),
				created: false,
				from: 0,
				to: 0,
				selection: null
			};
		},
		ready: function ready() {
			var vm = this;
			if (vm.options) vm.init(vm.options);
			vm.$watch('options', vm.init);
		},

		methods: {
			init: function init(_ref) {
				var min = _ref.min;
				var max = _ref.max;

				var vm = this;
				if (!max) return;
				if (min < vm.from) vm.from = min;
				if (max > vm.to) vm.to = max;
				vm.selection = [min, max];
				vm.createSlider(vm.from, vm.to, vm.selection);
			},
			createSlider: function createSlider(min, max, position) {
				if (slider) slider.noUiSlider.destroy();
				slider = document.getElementById('slider');
				noUiSlider.create(slider, {
					start: position || [min, max],
					connect: true,
					behaviour: 'drag',
					margin: 1,
					step: 1,
					animate: true,
					animationDuration: 300,
					range: {
						'min': min,
						'max': max
					},
					format: {
						to: function to(value) {
							return Math.floor(value);
						},
						from: function from(value) {
							return Math.floor(value);
						}
					}
				});
				this.updateListener();
			},
			updateListener: function updateListener() {
				var vm = this;
				slider.noUiSlider.on('change', function (values, handle) {
					var selection = vm.selection || [];
					if (selection.toString() == values.toString()) return;
					vm.selection = values;
					bus.$emit('filter:changed', {
						category: vm.category,
						value: values
					});
				});
			}
		}
	};

/***/ },

/***/ 407:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bus = __webpack_require__(6);
	__webpack_require__(546);

	module.exports = {
		props: {
			options: {
				type: Object
			},
			category: {
				type: String
			},
			statistic: {
				type: Boolean,
				default: false
			}
		},
		data: function data() {
			return {
				componentId: Math.floor(Math.random() * 1000),
				tags: '',
				selected: []
			};
		},
		ready: function ready() {
			var _this = this;

			var $input = $('input#' + this.componentId);
			$input.materialtags();
			$input.on('itemAdded', function (_ref) {
				var item = _ref.item;
				return _this.filterChange(item);
			});
			$input.on('itemRemoved', function (_ref2) {
				var item = _ref2.item;
				return _this.filterChange(item);
			});
		},

		methods: {
			filterChange: function filterChange(item) {
				var vm = this;
				bus.$emit('filter:changed', {
					category: vm.category,
					value: item
				});
			}
		}
	};

/***/ },

/***/ 408:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _actions = __webpack_require__(179);

	var _getters = __webpack_require__(196);

	module.exports = {
	    vuex: {
	        actions: {
	            orderUpdate: _actions.orderUpdate
	        },
	        getters: {
	            total: _getters.filterTotal
	        }
	    },
	    data: function data() {
	        return {
	            options: [{ name: 'Title', value: 'title.full' }, { name: 'Job Type', value: 'job_type.full' }, { name: 'Incentive', value: 'incentive' }, { name: 'Release date', value: 'release_date' }, { name: 'Salary', value: 'salary_min' }],
	            sortBy: null,
	            orderBy: null
	        };
	    },
	    ready: function ready() {
	        $('select').material_select();
	    },

	    methods: {
	        order: function order() {
	            var vm = this;
	            vm.orderUpdate(vm.sortBy, vm.orderBy);
	        }
	    }
	};

/***/ },

/***/ 409:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _trunc = __webpack_require__(244);

	var _trunc2 = _interopRequireDefault(_trunc);

	var _actions = __webpack_require__(179);

	var _getters = __webpack_require__(196);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {
		vuex: {
			actions: {
				goToPage: _actions.goToPage
			},
			getters: {
				maxPage: _getters.filterMaxPage,
				currentPage: _getters.filterPage,
				limit: _getters.filterLimit,
				total: _getters.filterTotal
			}
		},
		computed: {
			pagesRange: function pagesRange() {
				if (!this.limit || !this.currentPage || !this.maxPage) return null;
				var n = this.limit;
				var add = this.currentPage % n == 0 ? this.currentPage - (n - 1) : (0, _trunc2.default)(this.currentPage / n) * n + 1;
				var range = Array(n).fill(1).map(function (i, j) {
					return j + add;
				});
				while (range[range.length - 1] > this.maxPage) {
					range.pop();
				}
				return range;
			},
			hasPrev: function hasPrev() {
				if (!Array.isArray(this.pagesRange)) return false;
				return !(this.pagesRange[0] <= 1);
			},
			hasNext: function hasNext() {
				if (!Array.isArray(this.pagesRange)) return false;
				return !(this.pagesRange[this.pagesRange.length - 1] >= this.maxPage);
			}
		},
		ready: function ready() {},

		methods: {
			goTo: function goTo(p) {
				this.goToPage(p);
			},
			nextRange: function nextRange() {
				var n = this.limit;
				var next = (0, _trunc2.default)(this.currentPage / n) * n + (n + 1);
				this.goToPage(next);
			},
			prevRange: function prevRange() {
				var n = this.limit;
				var prev = (0, _trunc2.default)(this.currentPage / n) * n - (n - 1);
				this.goToPage(prev);
			}
		}
	};

/***/ },

/***/ 410:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _actions = __webpack_require__(179);

	var _getters = __webpack_require__(196);

	var joboffer = __webpack_require__(155);
	var advancedFilter = __webpack_require__(242);
	var share = __webpack_require__(194);
	var apply = __webpack_require__(192);

	module.exports = {
	  vuex: {
	    actions: {
	      loadJoboffers: _actions.loadJoboffers
	    },
	    getters: {
	      joboffers: _getters.filterResult,
	      isReady: _getters.isReady
	    }
	  },
	  data: function data() {
	    return {
	      type: ['public', 'private'],
	      data: null,
	      source: 'self',
	      total: null
	    };
	  },

	  components: {
	    joboffer: joboffer,
	    share: share,
	    apply: apply,
	    advancedFilter: advancedFilter
	  },
	  ready: function ready() {
	    this.getJobOffer();
	  },

	  methods: {
	    getJobOffer: function getJobOffer() {
	      this.loadJoboffers();
	    }
	  }
	};

/***/ },

/***/ 411:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _actions = __webpack_require__(179);

	var config = {
		attributesToSearch: ['title', 'company.name', 'tags', 'description'],
		typoTolerance: 'max',
		term: ''
	};

	module.exports = {
		vuex: {
			actions: {
				termUpdate: _actions.termUpdate
			}
		},
		data: function data() {
			return {
				term: ''
			};
		},

		methods: {
			search: function search() {
				config.term = this.term;
				this.termUpdate(config);
			}
		}
	};

/***/ },

/***/ 412:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var filterContainer = __webpack_require__(659);
	var resultContainer = __webpack_require__(665);
	var searchboxContainer = __webpack_require__(666);
	var infobarContainer = __webpack_require__(663);
	var paginationContainer = __webpack_require__(664);

	module.exports = {
	  components: {
	    filterContainer: filterContainer,
	    searchboxContainer: searchboxContainer,
	    resultContainer: resultContainer,
	    infobarContainer: infobarContainer,
	    paginationContainer: paginationContainer
	  }
	};

/***/ },

/***/ 480:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*!\n * Materialize v0.97.6 (http://materializecss.com)\n * Copyright 2014-2015 Materialize\n * MIT License (https://raw.githubusercontent.com/Dogfalo/materialize/master/LICENSE)\n */\n\n/* Functional styling;\n * These styles are required for noUiSlider to function.\n * You don't need to change these rules to apply your design.\n */\n.noUi-target,\n.noUi-target * {\n-webkit-touch-callout: none;\n-webkit-user-select: none;\n-ms-touch-action: none;\n-ms-user-select: none;\n-moz-user-select: none;\n-moz-box-sizing: border-box;\n\tbox-sizing: border-box;\n}\n.noUi-target {\n\tposition: relative;\n\tdirection: ltr;\n}\n.noUi-base {\n\twidth: 100%;\n\theight: 100%;\n\tposition: relative;\n\tz-index: 1; /* Fix 401 */\n}\n.noUi-origin {\n\tposition: absolute;\n\tright: 0;\n\ttop: 6px;\n\tleft: 0;\n\tbottom: 0;\n}\n.noUi-handle {\n\tposition: relative;\n\tz-index: 1;\n}\n.noUi-stacking .noUi-handle {\n/* This class is applied to the lower origin when\n   its values is > 50%. */\n\tz-index: 10;\n}\n.noUi-state-tap .noUi-origin {\n-webkit-transition: left 0.25s, top 0.25s;\n\ttransition: left 0.25s, top 0.25s;\n}\n.noUi-state-drag * {\n\tcursor: inherit !important;\n}\n\n/* Painting and performance;\n * Browsers can paint handles in their own layer.\n */\n.noUi-base {\n\t-webkit-transform: translate3d(0,0,0);\n\ttransform: translate3d(0,0,0);\n}\n\n/* Slider size and handle placement;\n */\n.noUi-horizontal {\n\theight: 18px;\n}\n.noUi-horizontal .noUi-handle {\n\twidth: 34px;\n\theight: 28px;\n\tleft: -17px;\n\ttop: -6px;\n}\n.noUi-vertical {\n\twidth: 18px;\n}\n.noUi-vertical .noUi-handle {\n\twidth: 28px;\n\theight: 34px;\n\tleft: -6px;\n\ttop: -17px;\n}\n\n/* Styling;\n */\n.noUi-background {\n\tbackground: #FAFAFA;\n\tbox-shadow: inset 0 1px 1px #f0f0f0;\n}\n.noUi-connect {\n\tbackground: #3FB8AF;\n\tbox-shadow: inset 0 0 3px rgba(51,51,51,0.45);\n-webkit-transition: background 450ms;\n\ttransition: background 450ms;\n}\n.noUi-origin {\n\tborder-radius: 2px;\n}\n.noUi-target {\n\tborder-radius: 4px;\n\tborder: 1px solid #D3D3D3;\n\tbox-shadow: inset 0 1px 1px #F0F0F0, 0 3px 6px -5px #BBB;\n}\n.noUi-target.noUi-connect {\n\tbox-shadow: inset 0 0 3px rgba(51,51,51,0.45), 0 3px 6px -5px #BBB;\n}\n\n/* Handles and cursors;\n */\n.noUi-dragable {\n\tcursor: w-resize;\n}\n.noUi-vertical .noUi-dragable {\n\tcursor: n-resize;\n}\n.noUi-handle {\n\tborder: 1px solid #D9D9D9;\n\tborder-radius: 3px;\n\tbackground: #FFF;\n\tcursor: default;\n\tbox-shadow: inset 0 0 1px #FFF,\n\t\t\t\tinset 0 1px 7px #EBEBEB,\n\t\t\t\t0 3px 6px -3px #BBB;\n}\n.noUi-active {\n\tbox-shadow: inset 0 0 1px #FFF,\n\t\t\t\tinset 0 1px 7px #DDD,\n\t\t\t\t0 3px 6px -3px #BBB;\n}\n\n/* Handle stripes;\n */\n.noUi-handle:before,\n.noUi-handle:after {\n\tcontent: \"\";\n\tdisplay: block;\n\tposition: absolute;\n\theight: 14px;\n\twidth: 1px;\n\tbackground: #E8E7E6;\n\tleft: 14px;\n\ttop: 6px;\n}\n.noUi-handle:after {\n\tleft: 17px;\n}\n.noUi-vertical .noUi-handle:before,\n.noUi-vertical .noUi-handle:after {\n\twidth: 14px;\n\theight: 1px;\n\tleft: 6px;\n\ttop: 14px;\n}\n.noUi-vertical .noUi-handle:after {\n\ttop: 17px;\n}\n\n/* Disabled state;\n */\n[disabled].noUi-connect,\n[disabled] .noUi-connect {\n\tbackground: #B8B8B8;\n}\n[disabled].noUi-origin,\n[disabled] .noUi-handle {\n\tcursor: not-allowed;\n}\n\n/*Materialize Theming*/\n\n.noUi-target {\n\n  box-shadow: none;\n  border: none;\n}\n.noUi-base {\n  height: 15px;\n  top: -6px;\n}\n.noUi-background {\n  height: 3px;\n  top: 6px;\n  background-color: #bfbfbf;\n  box-shadow: none;\n}\n.noUi-horizontal {\n  height: 3px;\n}\n.noUi-connect {\n  height: 3px;\n  top: 6px;\n  background-color: #26A69A;\n  box-shadow: none;\n}\n\n/*Handle*/\n.noUi-horizontal .noUi-handle {\n  width: 15px;\n  height: 15px;\n  border-radius: 50%;\n  box-shadow: none;\n  background-color: #26A69A;\n  border: none;\n  left: -5px;\n  top: -6px;\n  transition: width .2s cubic-bezier(0.215, 0.610, 0.355, 1.000),\n              height .2s cubic-bezier(0.215, 0.610, 0.355, 1.000),\n              left .2s cubic-bezier(0.215, 0.610, 0.355, 1.000),\n              top .2s cubic-bezier(0.215, 0.610, 0.355, 1.000);\n}\n.noUi-handle:before {\n  content: none;\n}\n.noUi-handle:after {\n  content: none;\n}\n/*Handle on Drag*/\n.noUi-target .noUi-active.noUi-handle {\n  width: 3px;\n  height: 3px;\n  left: 0;\n  top: 0;\n}\n\n.noUi-target .noUi-active .range-label span {\n}\n.noUi-target .range-label {\n  position: absolute;\n  height: 30px;\n  width: 30px;\n  top: -17px;\n  left: -2px;\n  background-color: #26A69A;\n  border-radius: 50%;\n  transition: border-radius .25s cubic-bezier(0.215, 0.610, 0.355, 1.000),\n              transform .25s cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  transform: scale(.5) rotate(-45deg);\n  transform-origin: 50% 100%;\n}\n.noUi-target .noUi-active .range-label {\n  border-radius: 15px 15px 15px 0;\n  transform: rotate(-45deg) translate(23px, -25px);\n\n}\n.range-label span {\n  width: 100%;\n  text-align: center;\n  color: #fff;\n  font-size: 12px;\n  transform: rotate(45deg);\n  opacity: 0;\n  position: absolute;\n  top: 7px;\n  left: -1px;\n  transition: opacity .25s cubic-bezier(0.215, 0.610, 0.355, 1.000);\n}\n.noUi-active .range-label span {\n  opacity: 1;\n}\n", ""]);

	// exports


/***/ },

/***/ 486:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".-tag-filter .chip {\n  margin-top: 5px;\n}\n", ""]);

	// exports


/***/ },

/***/ 487:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*doc\n---\ntitle: Colors\nname: colors\ncategory: Base CSS\n---\n\nColors: to be able to use the predefined colors, You need to import common/less/colors.less\n\n```html_example\n<style>\n@import \"../src/components/common/less/colors.less\"\n</style>\n<div class=\"size-32\" style=\"background-color: @color-navy-blue\">Click</div>\n```\n*/\n/* Mixin */\n.-filter-container span.caret {\n  top: 8px;\n}\n.-filter-container select,\n.-filter-container input.select-dropdown {\n  margin: 0;\n  line-height: 2.4rem;\n  height: 2.4rem;\n  width: 120px;\n}\n", ""]);

	// exports


/***/ },

/***/ 488:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*doc\n---\ntitle: Colors\nname: colors\ncategory: Base CSS\n---\n\nColors: to be able to use the predefined colors, You need to import common/less/colors.less\n\n```html_example\n<style>\n@import \"../src/components/common/less/colors.less\"\n</style>\n<div class=\"size-32\" style=\"background-color: @color-navy-blue\">Click</div>\n```\n*/\n/* Mixin */\n.-pagination-container .pagination li {\n  -webkit-transition: 200ms;\n  transition: 200ms;\n  font-size: 1rem;\n  line-height: 1rem;\n  padding: 8px;\n}\n.-pagination-container .pagination li.disabled {\n  opacity: 0;\n}\n", ""]);

	// exports


/***/ },

/***/ 491:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*doc\n---\ntitle: Colors\nname: colors\ncategory: Base CSS\n---\n\nColors: to be able to use the predefined colors, You need to import common/less/colors.less\n\n```html_example\n<style>\n@import \"../src/components/common/less/colors.less\"\n</style>\n<div class=\"size-32\" style=\"background-color: @color-navy-blue\">Click</div>\n```\n*/\n/* Mixin */\n.-search-wrapper #search[_v-136b48ed] {\n  display: block;\n  font-size: 16px;\n  font-weight: 300;\n  height: 45px;\n  margin: 0;\n  padding: 0 45px 0 15px;\n  border: 0;\n}\n", ""]);

	// exports


/***/ },

/***/ 500:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "span[_v-762b109d] {\n  font-weight: 400;\n  font-size: 1rem;\n}\n", ""]);

	// exports


/***/ },

/***/ 501:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".-range-filter .input-field[_v-77173d40] {\n  width: 3rem;\n}\n.-range-filter .input-field input[_v-77173d40] {\n  height: 2rem;\n}\n.-pipe[_v-77173d40] {\n  height: 1.4rem;\n  width: 1px;\n}\n.-pipe.-to[_v-77173d40] {\n  right: -2px;\n  position: relative;\n}\n", ""]);

	// exports


/***/ },

/***/ 502:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "span[_v-78f11e30] {\n  font-weight: 300;\n  font-size: .8rem;\n}\n.-item label[_v-78f11e30] {\n  word-break: break-all;\n  word-wrap: normal;\n  white-space: pre-line;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n", ""]);

	// exports


/***/ },

/***/ 504:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*doc\n---\ntitle: Colors\nname: colors\ncategory: Base CSS\n---\n\nColors: to be able to use the predefined colors, You need to import common/less/colors.less\n\n```html_example\n<style>\n@import \"../src/components/common/less/colors.less\"\n</style>\n<div class=\"size-32\" style=\"background-color: @color-navy-blue\">Click</div>\n```\n*/\n/* Mixin */\n.collapsible-body[_v-7e8b3524] {\n  border: none;\n}\n.-filter-containre[_v-7e8b3524] {\n  background: #fafbfc;\n  border: none;\n}\n.material-icons[_v-7e8b3524] {\n  font-size: 16px;\n  padding-top: 4px;\n  font-weight: 300;\n  color: #9d9fa2 !important;\n}\n.-section-title[_v-7e8b3524] {\n  font-size: 1rem;\n  font-weight: 300;\n  text-transform: capitalize;\n}\n.-filter-list .collapsible-header[_v-7e8b3524] {\n  border: #FFF .25px solid;\n  padding: 0 8px;\n  margin-bottom: 2px;\n}\n.-filter-list .collapsible-header .material-icons[_v-7e8b3524] {\n  color: #6a6c6f;\n  margin-right: 8px;\n}\n.-filter-list .collapsible-header .-arrow[_v-7e8b3524] {\n  opacity: .8;\n  font-size: 1rem;\n  margin: 0;\n  -webkit-transition: 200ms;\n  transition: 200ms;\n}\n.-filter-list .collapsible-header.active .-arrow[_v-7e8b3524] {\n  -webkit-transform: rotate(90deg);\n          transform: rotate(90deg);\n}\n.-filter-list .collapsible-header:hover .-arrow[_v-7e8b3524] {\n  opacity: 1;\n  -webkit-transform: rotate(45deg);\n          transform: rotate(45deg);\n}\n", ""]);

	// exports


/***/ },

/***/ 506:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".main-view[_v-bb706472] {\n  /* margin-top: 140px */\n}\n", ""]);

	// exports


/***/ },

/***/ 517:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(486);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./filter.tags.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./filter.tags.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 518:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(487);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./infobar.container.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./infobar.container.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 519:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(488);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./pagination.container.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./pagination.container.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 522:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(491);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-136b48ed&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./searchbox.container.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-136b48ed&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./searchbox.container.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 531:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(500);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-762b109d&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./filter.radio-list.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-762b109d&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./filter.radio-list.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 532:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(501);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-77173d40&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./filter.range.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-77173d40&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./filter.range.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 533:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(502);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-78f11e30&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./filter.check-list.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-78f11e30&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./filter.check-list.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 535:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(504);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-7e8b3524&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./filter.container.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-7e8b3524&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./filter.container.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 537:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(506);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-bb706472&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.filter.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-bb706472&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.filter.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 545:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!function(){function a(a){return a.split("").reverse().join("")}function b(a,b,c){if((a[b]||a[c])&&a[b]===a[c])throw Error(b)}function c(b,c,d,e,f,g,h,i,j,k,l,m){h=m;var n,o=l="";return g&&(m=g(m)),"number"==typeof m&&isFinite(m)?(b&&0===parseFloat(m.toFixed(b))&&(m=0),0>m&&(n=!0,m=Math.abs(m)),b&&(g=Math.pow(10,b),m=(Math.round(m*g)/g).toFixed(b)),m=m.toString(),-1!==m.indexOf(".")&&(b=m.split("."),m=b[0],d&&(l=d+b[1])),c&&(m=a(m).match(/.{1,3}/g),m=a(m.join(a(c)))),n&&i&&(o+=i),e&&(o+=e),n&&j&&(o+=j),o=o+m+l,f&&(o+=f),k&&(o=k(o,h)),o):!1}function d(a,b,c,d,e,f,g,h,i,j,k,l){var m;return a="",k&&(l=k(l)),l&&"string"==typeof l?(h&&l.substring(0,h.length)===h&&(l=l.replace(h,""),m=!0),d&&l.substring(0,d.length)===d&&(l=l.replace(d,"")),i&&l.substring(0,i.length)===i&&(l=l.replace(i,""),m=!0),e&&l.slice(-1*e.length)===e&&(l=l.slice(0,-1*e.length)),b&&(l=l.split(b).join("")),c&&(l=l.replace(c,".")),m&&(a+="-"),a=Number((a+l).replace(/[^0-9\.\-.]/g,"")),g&&(a=g(a)),"number"==typeof a&&isFinite(a)?a:!1):!1}function e(a){var c,d,e,f={};for(c=0;c<h.length;c+=1)d=h[c],e=a[d],void 0===e?f[d]="negative"!==d||f.negativeBefore?"mark"===d&&"."!==f.thousand?".":!1:"-":"decimals"===d?e>0&&8>e&&(f[d]=e):"encoder"===d||"decoder"===d||"edit"===d||"undo"===d?"function"==typeof e&&(f[d]=e):"string"==typeof e&&(f[d]=e);return b(f,"mark","thousand"),b(f,"prefix","negative"),b(f,"prefix","negativeBefore"),f}function f(a,b,c){var d,e=[];for(d=0;d<h.length;d+=1)e.push(a[h[d]]);return e.push(c),b.apply("",e)}function g(a){return this instanceof g?void("object"==typeof a&&(a=e(a),this.to=function(b){return f(a,c,b)},this.from=function(b){return f(a,d,b)})):new g(a)}var h="decimals thousand mark prefix postfix encoder decoder negativeBefore negative edit undo".split(" ");window.wNumb=g}(),function(a){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (a), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else if("object"==typeof exports){var b=require("fs");module.exports=a(),module.exports.css=function(){return b.readFileSync(__dirname+"/nouislider.min.css","utf8")}}else window.noUiSlider=a()}(function(){"use strict";function a(a){return a.filter(function(a){return this[a]?!1:this[a]=!0},{})}function b(a,b){return Math.round(a/b)*b}function c(a){var b=a.getBoundingClientRect(),c=a.ownerDocument,d=c.defaultView||c.parentWindow,e=c.documentElement,f=d.pageXOffset;return/webkit.*Chrome.*Mobile/i.test(navigator.userAgent)&&(f=0),{top:b.top+d.pageYOffset-e.clientTop,left:b.left+f-e.clientLeft}}function d(a){return"number"==typeof a&&!isNaN(a)&&isFinite(a)}function e(a){var b=Math.pow(10,7);return Number((Math.round(a*b)/b).toFixed(7))}function f(a,b,c){j(a,b),setTimeout(function(){k(a,b)},c)}function g(a){return Math.max(Math.min(a,100),0)}function h(a){return Array.isArray(a)?a:[a]}function i(a){var b=a.split(".");return b.length>1?b[1].length:0}function j(a,b){a.classList?a.classList.add(b):a.className+=" "+b}function k(a,b){a.classList?a.classList.remove(b):a.className=a.className.replace(new RegExp("(^|\\b)"+b.split(" ").join("|")+"(\\b|$)","gi")," ")}function l(a,b){a.classList?a.classList.contains(b):new RegExp("(^| )"+b+"( |$)","gi").test(a.className)}function m(a,b){return 100/(b-a)}function n(a,b){return 100*b/(a[1]-a[0])}function o(a,b){return n(a,a[0]<0?b+Math.abs(a[0]):b-a[0])}function p(a,b){return b*(a[1]-a[0])/100+a[0]}function q(a,b){for(var c=1;a>=b[c];)c+=1;return c}function r(a,b,c){if(c>=a.slice(-1)[0])return 100;var d,e,f,g,h=q(c,a);return d=a[h-1],e=a[h],f=b[h-1],g=b[h],f+o([d,e],c)/m(f,g)}function s(a,b,c){if(c>=100)return a.slice(-1)[0];var d,e,f,g,h=q(c,b);return d=a[h-1],e=a[h],f=b[h-1],g=b[h],p([d,e],(c-f)*m(f,g))}function t(a,c,d,e){if(100===e)return e;var f,g,h=q(e,a);return d?(f=a[h-1],g=a[h],e-f>(g-f)/2?g:f):c[h-1]?a[h-1]+b(e-a[h-1],c[h-1]):e}function u(a,b,c){var e;if("number"==typeof b&&(b=[b]),"[object Array]"!==Object.prototype.toString.call(b))throw new Error("noUiSlider: 'range' contains invalid value.");if(e="min"===a?0:"max"===a?100:parseFloat(a),!d(e)||!d(b[0]))throw new Error("noUiSlider: 'range' value isn't numeric.");c.xPct.push(e),c.xVal.push(b[0]),e?c.xSteps.push(isNaN(b[1])?!1:b[1]):isNaN(b[1])||(c.xSteps[0]=b[1])}function v(a,b,c){return b?void(c.xSteps[a]=n([c.xVal[a],c.xVal[a+1]],b)/m(c.xPct[a],c.xPct[a+1])):!0}function w(a,b,c,d){this.xPct=[],this.xVal=[],this.xSteps=[d||!1],this.xNumSteps=[!1],this.snap=b,this.direction=c;var e,f=[];for(e in a)a.hasOwnProperty(e)&&f.push([a[e],e]);for(f.sort(function(a,b){return a[0]-b[0]}),e=0;e<f.length;e++)u(f[e][1],f[e][0],this);for(this.xNumSteps=this.xSteps.slice(0),e=0;e<this.xNumSteps.length;e++)v(e,this.xNumSteps[e],this)}function x(a,b){if(!d(b))throw new Error("noUiSlider: 'step' is not numeric.");a.singleStep=b}function y(a,b){if("object"!=typeof b||Array.isArray(b))throw new Error("noUiSlider: 'range' is not an object.");if(void 0===b.min||void 0===b.max)throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'.");a.spectrum=new w(b,a.snap,a.dir,a.singleStep)}function z(a,b){if(b=h(b),!Array.isArray(b)||!b.length||b.length>2)throw new Error("noUiSlider: 'start' option is incorrect.");a.handles=b.length,a.start=b}function A(a,b){if(a.snap=b,"boolean"!=typeof b)throw new Error("noUiSlider: 'snap' option must be a boolean.")}function B(a,b){if(a.animate=b,"boolean"!=typeof b)throw new Error("noUiSlider: 'animate' option must be a boolean.")}function C(a,b){if("lower"===b&&1===a.handles)a.connect=1;else if("upper"===b&&1===a.handles)a.connect=2;else if(b===!0&&2===a.handles)a.connect=3;else{if(b!==!1)throw new Error("noUiSlider: 'connect' option doesn't match handle count.");a.connect=0}}function D(a,b){switch(b){case"horizontal":a.ort=0;break;case"vertical":a.ort=1;break;default:throw new Error("noUiSlider: 'orientation' option is invalid.")}}function E(a,b){if(!d(b))throw new Error("noUiSlider: 'margin' option must be numeric.");if(a.margin=a.spectrum.getMargin(b),!a.margin)throw new Error("noUiSlider: 'margin' option is only supported on linear sliders.")}function F(a,b){if(!d(b))throw new Error("noUiSlider: 'limit' option must be numeric.");if(a.limit=a.spectrum.getMargin(b),!a.limit)throw new Error("noUiSlider: 'limit' option is only supported on linear sliders.")}function G(a,b){switch(b){case"ltr":a.dir=0;break;case"rtl":a.dir=1,a.connect=[0,2,1,3][a.connect];break;default:throw new Error("noUiSlider: 'direction' option was not recognized.")}}function H(a,b){if("string"!=typeof b)throw new Error("noUiSlider: 'behaviour' must be a string containing options.");var c=b.indexOf("tap")>=0,d=b.indexOf("drag")>=0,e=b.indexOf("fixed")>=0,f=b.indexOf("snap")>=0;a.events={tap:c||f,drag:d,fixed:e,snap:f}}function I(a,b){if(a.format=b,"function"==typeof b.to&&"function"==typeof b.from)return!0;throw new Error("noUiSlider: 'format' requires 'to' and 'from' methods.")}function J(a){var b,c={margin:0,limit:0,animate:!0,format:U};b={step:{r:!1,t:x},start:{r:!0,t:z},connect:{r:!0,t:C},direction:{r:!0,t:G},snap:{r:!1,t:A},animate:{r:!1,t:B},range:{r:!0,t:y},orientation:{r:!1,t:D},margin:{r:!1,t:E},limit:{r:!1,t:F},behaviour:{r:!0,t:H},format:{r:!1,t:I}};var d={connect:!1,direction:"ltr",behaviour:"tap",orientation:"horizontal"};return Object.keys(d).forEach(function(b){void 0===a[b]&&(a[b]=d[b])}),Object.keys(b).forEach(function(d){var e=b[d];if(void 0===a[d]){if(e.r)throw new Error("noUiSlider: '"+d+"' is required.");return!0}e.t(c,a[d])}),c.pips=a.pips,c.style=c.ort?"top":"left",c}function K(a,b,c){var d=a+b[0],e=a+b[1];return c?(0>d&&(e+=Math.abs(d)),e>100&&(d-=e-100),[g(d),g(e)]):[d,e]}function L(a){a.preventDefault();var b,c,d=0===a.type.indexOf("touch"),e=0===a.type.indexOf("mouse"),f=0===a.type.indexOf("pointer"),g=a;return 0===a.type.indexOf("MSPointer")&&(f=!0),d&&(b=a.changedTouches[0].pageX,c=a.changedTouches[0].pageY),(e||f)&&(b=a.clientX+window.pageXOffset,c=a.clientY+window.pageYOffset),g.points=[b,c],g.cursor=e||f,g}function M(a,b){var c=document.createElement("div"),d=document.createElement("div"),e=["-lower","-upper"];return a&&e.reverse(),j(d,T[3]),j(d,T[3]+e[b]),j(c,T[2]),c.appendChild(d),c}function N(a,b,c){switch(a){case 1:j(b,T[7]),j(c[0],T[6]);break;case 3:j(c[1],T[6]);case 2:j(c[0],T[7]);case 0:j(b,T[6])}}function O(a,b,c){var d,e=[];for(d=0;a>d;d+=1)e.push(c.appendChild(M(b,d)));return e}function P(a,b,c){j(c,T[0]),j(c,T[8+a]),j(c,T[4+b]);var d=document.createElement("div");return j(d,T[1]),c.appendChild(d),d}function Q(b,d){function e(a,b,c){if("range"===a||"steps"===a)return M.xVal;if("count"===a){var d,e=100/(b-1),f=0;for(b=[];(d=f++*e)<=100;)b.push(d);a="positions"}return"positions"===a?b.map(function(a){return M.fromStepping(c?M.getStep(a):a)}):"values"===a?c?b.map(function(a){return M.fromStepping(M.getStep(M.toStepping(a)))}):b:void 0}function m(b,c,d){var e=M.direction,f={},g=M.xVal[0],h=M.xVal[M.xVal.length-1],i=!1,j=!1,k=0;return M.direction=0,d=a(d.slice().sort(function(a,b){return a-b})),d[0]!==g&&(d.unshift(g),i=!0),d[d.length-1]!==h&&(d.push(h),j=!0),d.forEach(function(a,e){var g,h,l,m,n,o,p,q,r,s,t=a,u=d[e+1];if("steps"===c&&(g=M.xNumSteps[e]),g||(g=u-t),t!==!1&&void 0!==u)for(h=t;u>=h;h+=g){for(m=M.toStepping(h),n=m-k,q=n/b,r=Math.round(q),s=n/r,l=1;r>=l;l+=1)o=k+l*s,f[o.toFixed(5)]=["x",0];p=d.indexOf(h)>-1?1:"steps"===c?2:0,!e&&i&&(p=0),h===u&&j||(f[m.toFixed(5)]=[h,p]),k=m}}),M.direction=e,f}function n(a,b,c){function e(a){return["-normal","-large","-sub"][a]}function f(a,b,c){return'class="'+b+" "+b+"-"+h+" "+b+e(c[1])+'" style="'+d.style+": "+a+'%"'}function g(a,d){M.direction&&(a=100-a),d[1]=d[1]&&b?b(d[0],d[1]):d[1],i.innerHTML+="<div "+f(a,"noUi-marker",d)+"></div>",d[1]&&(i.innerHTML+="<div "+f(a,"noUi-value",d)+">"+c.to(d[0])+"</div>")}var h=["horizontal","vertical"][d.ort],i=document.createElement("div");return j(i,"noUi-pips"),j(i,"noUi-pips-"+h),Object.keys(a).forEach(function(b){g(b,a[b])}),i}function o(a){var b=a.mode,c=a.density||1,d=a.filter||!1,f=a.values||!1,g=a.stepped||!1,h=e(b,f,g),i=m(c,b,h),j=a.format||{to:Math.round};return I.appendChild(n(i,d,j))}function p(){return G["offset"+["Width","Height"][d.ort]]}function q(a,b){void 0!==b&&(b=Math.abs(b-d.dir)),Object.keys(R).forEach(function(c){var d=c.split(".")[0];a===d&&R[c].forEach(function(a){a(h(B()),b,r(Array.prototype.slice.call(Q)))})})}function r(a){return 1===a.length?a[0]:d.dir?a.reverse():a}function s(a,b,c,e){var f=function(b){return I.hasAttribute("disabled")?!1:l(I,T[14])?!1:(b=L(b),a===S.start&&void 0!==b.buttons&&b.buttons>1?!1:(b.calcPoint=b.points[d.ort],void c(b,e)))},g=[];return a.split(" ").forEach(function(a){b.addEventListener(a,f,!1),g.push([a,f])}),g}function t(a,b){var c,d,e=b.handles||H,f=!1,g=100*(a.calcPoint-b.start)/p(),h=e[0]===H[0]?0:1;if(c=K(g,b.positions,e.length>1),f=y(e[0],c[h],1===e.length),e.length>1){if(f=y(e[1],c[h?0:1],!1)||f)for(d=0;d<b.handles.length;d++)q("slide",d)}else f&&q("slide",h)}function u(a,b){var c=G.getElementsByClassName(T[15]),d=b.handles[0]===H[0]?0:1;c.length&&k(c[0],T[15]),a.cursor&&(document.body.style.cursor="",document.body.removeEventListener("selectstart",document.body.noUiListener));var e=document.documentElement;e.noUiListeners.forEach(function(a){e.removeEventListener(a[0],a[1])}),k(I,T[12]),q("set",d),q("change",d)}function v(a,b){var c=document.documentElement;if(1===b.handles.length&&(j(b.handles[0].children[0],T[15]),b.handles[0].hasAttribute("disabled")))return!1;a.stopPropagation();var d=s(S.move,c,t,{start:a.calcPoint,handles:b.handles,positions:[J[0],J[H.length-1]]}),e=s(S.end,c,u,{handles:b.handles});if(c.noUiListeners=d.concat(e),a.cursor){document.body.style.cursor=getComputedStyle(a.target).cursor,H.length>1&&j(I,T[12]);var f=function(){return!1};document.body.noUiListener=f,document.body.addEventListener("selectstart",f,!1)}}function w(a){var b,e,g=a.calcPoint,h=0;return a.stopPropagation(),H.forEach(function(a){h+=c(a)[d.style]}),b=h/2>g||1===H.length?0:1,g-=c(G)[d.style],e=100*g/p(),d.events.snap||f(I,T[14],300),H[b].hasAttribute("disabled")?!1:(y(H[b],e),q("slide",b),q("set",b),q("change",b),void(d.events.snap&&v(a,{handles:[H[h]]})))}function x(a){var b,c;if(!a.fixed)for(b=0;b<H.length;b+=1)s(S.start,H[b].children[0],v,{handles:[H[b]]});a.tap&&s(S.start,G,w,{handles:H}),a.drag&&(c=[G.getElementsByClassName(T[7])[0]],j(c[0],T[10]),a.fixed&&c.push(H[c[0]===H[0]?1:0].children[0]),c.forEach(function(a){s(S.start,a,v,{handles:H})}))}function y(a,b,c){var e=a!==H[0]?1:0,f=J[0]+d.margin,h=J[1]-d.margin,i=J[0]+d.limit,l=J[1]-d.limit;return H.length>1&&(b=e?Math.max(b,f):Math.min(b,h)),c!==!1&&d.limit&&H.length>1&&(b=e?Math.min(b,i):Math.max(b,l)),b=M.getStep(b),b=g(parseFloat(b.toFixed(7))),b===J[e]?!1:(a.style[d.style]=b+"%",a.previousSibling||(k(a,T[17]),b>50&&j(a,T[17])),J[e]=b,Q[e]=M.fromStepping(b),q("update",e),!0)}function z(a,b){var c,e,f;for(d.limit&&(a+=1),c=0;a>c;c+=1)e=c%2,f=b[e],null!==f&&f!==!1&&("number"==typeof f&&(f=String(f)),f=d.format.from(f),(f===!1||isNaN(f)||y(H[e],M.toStepping(f),c===3-d.dir)===!1)&&q("update",e))}function A(a){var b,c,e=h(a);for(d.dir&&d.handles>1&&e.reverse(),d.animate&&-1!==J[0]&&f(I,T[14],300),b=H.length>1?3:1,1===e.length&&(b=1),z(b,e),c=0;c<H.length;c++)q("set",c)}function B(){var a,b=[];for(a=0;a<d.handles;a+=1)b[a]=d.format.to(Q[a]);return r(b)}function C(){T.forEach(function(a){a&&k(I,a)}),I.innerHTML="",delete I.noUiSlider}function D(){var a=J.map(function(a,b){var c=M.getApplicableStep(a),d=i(String(c[2])),e=Q[b],f=100===a?null:c[2],g=Number((e-c[2]).toFixed(d)),h=0===a?null:g>=c[1]?c[2]:c[0]||!1;return[h,f]});return r(a)}function E(a,b){R[a]=R[a]||[],R[a].push(b),"update"===a.split(".")[0]&&H.forEach(function(a,b){q("update",b)})}function F(a){var b=a.split(".")[0],c=a.substring(b.length);Object.keys(R).forEach(function(a){var d=a.split(".")[0],e=a.substring(d.length);b&&b!==d||c&&c!==e||delete R[a]})}var G,H,I=b,J=[-1,-1],M=d.spectrum,Q=[],R={};if(I.noUiSlider)throw new Error("Slider was already initialized.");return G=P(d.dir,d.ort,I),H=O(d.handles,d.dir,G),N(d.connect,I,H),x(d.events),d.pips&&o(d.pips),{destroy:C,steps:D,on:E,off:F,get:B,set:A}}function R(a,b){if(!a.nodeName)throw new Error("noUiSlider.create requires a single element.");var c=J(b,a),d=Q(a,c);if(d.set(c.start),a.noUiSlider=d,b.tooltips===!0||void 0===b.tooltips){for(var e=a.getElementsByClassName("noUi-handle"),f=[],g=0;g<e.length;g++)f[g]=document.createElement("div"),e[g].appendChild(f[g]),f[g].className+="range-label",f[g].innerHTML="<span></span>",f[g]=f[g].getElementsByTagName("span")[0];a.noUiSlider.on("update",function(a,b){f[b].innerHTML=a[b]})}}var S=window.navigator.pointerEnabled?{start:"pointerdown",move:"pointermove",end:"pointerup"}:window.navigator.msPointerEnabled?{start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}:{start:"mousedown touchstart",move:"mousemove touchmove",end:"mouseup touchend"},T=["noUi-target","noUi-base","noUi-origin","noUi-handle","noUi-horizontal","noUi-vertical","noUi-background","noUi-connect","noUi-ltr","noUi-rtl","noUi-dragable","","noUi-state-drag","","noUi-state-tap","noUi-active","","noUi-stacking"];w.prototype.getMargin=function(a){return 2===this.xPct.length?n(this.xVal,a):!1},w.prototype.toStepping=function(a){return a=r(this.xVal,this.xPct,a),this.direction&&(a=100-a),a},w.prototype.fromStepping=function(a){return this.direction&&(a=100-a),e(s(this.xVal,this.xPct,a))},w.prototype.getStep=function(a){return this.direction&&(a=100-a),a=t(this.xPct,this.xSteps,this.snap,a),this.direction&&(a=100-a),a},w.prototype.getApplicableStep=function(a){var b=q(a,this.xPct),c=100===a?2:1;return[this.xNumSteps[b-2],this.xVal[b-c],this.xNumSteps[b-c]]},w.prototype.convert=function(a){return this.getStep(this.toStepping(a))};var U={to:function(a){return a.toFixed(2)},from:Number};return{create:R}});

/***/ },

/***/ 546:
/***/ function(module, exports) {

	(function ($)
	{
	    "use strict";

	    /**
	     * Default Configuration
	     *
	     * @type {{tagClass: tagClass, itemValue: itemValue, itemText: itemText, itemTitle: itemTitle, freeInput: boolean, addOnBlur: boolean, maxTags: undefined, maxChars: undefined, confirmKeys: number[], onTagExists: onTagExists, trimValue: boolean, allowDuplicates: boolean}}
	     */
	    var defaultOptions = {
	        tagClass        : tagClass,
	        itemValue       : itemValue,
	        itemText        : itemText,
	        itemTitle       : itemTitle,
	        freeInput       : true,
	        addOnBlur       : true,
	        maxTags         : undefined,
	        maxChars        : undefined,
	        confirmKeys     : [9,13, 44],
	        onTagExists     : onTagExists,
	        trimValue       : true,
	        allowDuplicates : false
	    };

	    function tagClass(item)
	    {
	        return 'chip';
	    }

	    function itemValue(item)
	    {
	        return item ? item.toString() : item;
	    }

	    function itemText(item)
	    {
	        return this.itemValue(item);
	    }

	    function itemTitle(item)
	    {
	        return null;
	    }

	    function onTagExists(item, $tag)
	    {
	        $tag.hide().fadeIn();
	    }

	    /**
	     * Constructor function
	     *
	     * @param element
	     * @param options
	     * @constructor
	     */
	    function TagsMaterialize(element, options)
	    {
	        this.itemsArray = [];

	        this.$element = $(element);
	        this.$element.hide();

	        this.objectItems     = options && options.itemValue;
	        this.placeholderText = element.hasAttribute('placeholder') ? this.$element.attr('placeholder') : '';
	        this.inputSize       = Math.max(1, this.placeholderText.length);

	        this.$container = $('<div class="materialize-tags"></div>');
	        this.$input     = $('<input type="text" class="n-tag"  placeholder="' + this.placeholderText + '"/>').appendTo(this.$container);
	        this.$label     = this.$element.parent().find('label');

	        this.$element.before(this.$container);
	        this.build(options);

	        this.$label.on('click', function ()
	        {
	            $(this).addClass('active');
	            $(this).next('.materialize-tags').find('input.n-tag').focus();
	        });

	        this.$input.on('focus', function ()
	        {
	            var label = $(this).parents('.materialize-tags').parent().find('label');
	            $(this).parents('.materialize-tags').addClass('active');

	            if (!label.hasClass('active'))
	            {
	                label.addClass('active');
	            }
	        }).on('focusout', function ()
	        {
	            var parentContainer = $(this).parents('.materialize-tags'),
	                tags            = parentContainer.find('span.chip');
	            parentContainer.removeClass('active');
	            // Verify if is empty and remove "active" class from label
	            if (tags.length == 0)
	            {
	                parentContainer.parent().find('label').removeClass('active');
	            }
	        });
	    }

	    TagsMaterialize.prototype = {
	        constructor : TagsMaterialize,

	        /**
	         * Adds the given item as a new tag. Pass true to dontPushVal to prevent
	         * updating the elements val()
	         *
	         * @param item
	         * @param dontPushVal
	         * @param options
	         */
	        add : function (item, dontPushVal, options)
	        {
	            var self = this;

	            if (self.options.maxTags && self.itemsArray.length >= self.options.maxTags)
	            {
	                return;
	            }

	            // Ignore false values, except false
	            if (item !== false && !item)
	            {
	                return;
	            }

	            // Trim value
	            if (typeof item === "string" && self.options.trimValue)
	            {
	                item = $.trim(item);
	            }

	            // Throw an error when trying to add an object while the itemValue option was not set
	            if (typeof item === "object" && !self.objectItems)
	            {
	                throw("Can't add objects when itemValue option is not set");
	            }

	            // Ignore strings only contain whitespace
	            if (item.toString().match(/^\s*$/))
	            {
	                return;
	            }

	            if (typeof item === "string" && this.$element[0].tagName === 'INPUT')
	            {
	                var items = item.split(',');
	                if (items.length > 1)
	                {
	                    for (var i = 0; i < items.length; i++)
	                    {
	                        this.add(items[i], true);
	                    }

	                    if (!dontPushVal)
	                    {
	                        self.pushVal();
	                    }
	                    return;
	                }
	            }

	            var itemValue = self.options.itemValue(item),
	                itemText  = self.options.itemText(item),
	                tagClass  = self.options.tagClass(item),
	                itemTitle = self.options.itemTitle(item);

	            // Ignore items all ready added
	            var existing = $.grep(self.itemsArray, function (item) { return self.options.itemValue(item) === itemValue; })[0];
	            if (existing && !self.options.allowDuplicates)
	            {
	                // Invoke onTagExists
	                if (self.options.onTagExists)
	                {
	                    var $existingTag = $(".tag", self.$container).filter(function () { return $(this).data("item") === existing; });
	                    self.options.onTagExists(item, $existingTag);
	                }
	                return;
	            }

	            // if length greater than limit
	            if (self.items().toString().length + item.length + 1 > self.options.maxInputLength)
	            {
	                return;
	            }

	            // raise beforeItemAdd arg
	            var beforeItemAddEvent = $.Event('beforeItemAdd', {item : item, cancel : false, options : options});
	            self.$element.trigger(beforeItemAddEvent);
	            if (beforeItemAddEvent.cancel)
	            {
	                return;
	            }

	            // register item in internal array and map
	            self.itemsArray.push(item);

	            // add a tag element
	            var $tag = $('<span class="' + htmlEncode(tagClass) + (itemTitle !== null ? ('" title="' + itemTitle) : '') + '">' + htmlEncode(itemText) + '<i class="material-icons" data-role="remove">close</i></span>');
	            $tag.data('item', item);
	            self.findInputWrapper().before($tag);
	            $tag.after(' ');

	            if (!dontPushVal)
	            {
	                self.pushVal();
	            }

	            // Add class when reached maxTags
	            if (self.options.maxTags === self.itemsArray.length || self.items().toString().length === self.options.maxInputLength)
	            {
	                self.$container.addClass('materialize-tags-max');
	            }

	            self.$element.trigger($.Event('itemAdded', {item : item, options : options}));
	        },

	        /**
	         * Removes the given item. Pass true to dontPushVal to prevent updating the
	         * elements val()
	         *
	         * @param item
	         * @param dontPushVal
	         * @param options
	         */
	        remove : function (item, dontPushVal, options)
	        {
	            var self = this;

	            if (self.objectItems)
	            {
	                if (typeof item === "object")
	                {
	                    item = $.grep(self.itemsArray, function (other) { return self.options.itemValue(other) == self.options.itemValue(item); });
	                }
	                else
	                {
	                    item = $.grep(self.itemsArray, function (other) { return self.options.itemValue(other) == item; });
	                }

	                item = item[item.length - 1];
	            }

	            if (item)
	            {
	                var beforeItemRemoveEvent = $.Event('beforeItemRemove', {
	                    item    : item,
	                    cancel  : false,
	                    options : options
	                });
	                self.$element.trigger(beforeItemRemoveEvent);
	                if (beforeItemRemoveEvent.cancel)
	                {
	                    return;
	                }

	                $('.chip', self.$container).filter(function () { return $(this).data('item') === item; }).remove();

	                if ($.inArray(item, self.itemsArray) !== -1)
	                {
	                    self.itemsArray.splice($.inArray(item, self.itemsArray), 1);
	                }
	            }

	            if (!dontPushVal)
	            {
	                self.pushVal();
	            }

	            // Remove class when reached maxTags
	            if (self.options.maxTags > self.itemsArray.length)
	            {
	                self.$container.removeClass('materialize-tags-max');
	            }

	            self.$element.trigger($.Event('itemRemoved', {item : item, options : options}));
	        },

	        /**
	         * Removes all items
	         */
	        removeAll : function ()
	        {
	            var self = this;

	            $('.chip', self.$container).remove();

	            while (self.itemsArray.length > 0)
	            {
	                self.itemsArray.pop();
	            }

	            self.pushVal();
	        },

	        /**
	         * Refreshes the tags so they match the text/value of their corresponding
	         * item.
	         */
	        refresh : function ()
	        {
	            var self = this;
	            $('.chip', self.$container).each(function ()
	            {
	                var $tag        = $(this),
	                    item        = $tag.data('item'),
	                    itemValue   = self.options.itemValue(item),
	                    itemText    = self.options.itemText(item),
	                    tagClass    = self.options.tagClass(item);

	                // Update tag's class and inner text
	                $tag.attr('class', null);
	                $tag.addClass('tag ' + htmlEncode(tagClass));
	                $tag.contents().filter(function ()
	                {
	                    return this.nodeType == 3;
	                })[0].nodeValue = htmlEncode(itemText);

	            });
	        },

	        /**
	         * Returns the items added as tags
	         */
	        items : function ()
	        {
	            return this.itemsArray;
	        },

	        /**
	         * Assembly value by retrieving the value of each item, and set it on the
	         * element.
	         */
	        pushVal : function ()
	        {
	            var self = this,
	                val  = $.map(self.items(), function (item)
	                {
	                    return self.options.itemValue(item).toString();
	                });

	            self.$element.val(val, true).trigger('change');
	        },

	        /**
	         * Initializes the tags input behaviour on the element
	         *
	         * @param options
	         */
	        build : function (options)
	        {
	            var self = this;

	            self.options = $.extend({}, defaultOptions, options);
	            // When itemValue is set, freeInput should always be false
	            if (self.objectItems)
	            {
	                self.options.freeInput = false;
	            }

	            makeOptionItemFunction(self.options, 'itemValue');
	            makeOptionItemFunction(self.options, 'itemText');
	            makeOptionFunction(self.options, 'tagClass');

	            // Typeahead.js
	            if (self.options.typeaheadjs)
	            {
	                var typeaheadConfig   = null;
	                var typeaheadDatasets = {};

	                // Determine if main configurations were passed or simply a dataset
	                var typeaheadjs = self.options.typeaheadjs;
	                if ($.isArray(typeaheadjs))
	                {
	                    typeaheadConfig   = typeaheadjs[0];
	                    typeaheadDatasets = typeaheadjs[1];
	                }
	                else
	                {
	                    typeaheadDatasets = typeaheadjs;
	                }

	                self.$input.typeahead(typeaheadConfig, typeaheadDatasets).on('typeahead:selected', $.proxy(function (obj, datum)
	                {
	                    if (typeaheadDatasets.valueKey)
	                    {
	                        self.add(datum[typeaheadDatasets.valueKey]);
	                    }
	                    else
	                    {
	                        self.add(datum);
	                    }
	                    self.$input.typeahead('val', '');
	                }, self));
	            }

	            self.$container.on('click', $.proxy(function (event)
	            {
	                if (!self.$element.attr('disabled'))
	                {
	                    self.$input.removeAttr('disabled');
	                }
	                self.$input.focus();
	            }, self));

	            if (self.options.addOnBlur && self.options.freeInput)
	            {
	                self.$input.on('focusout', $.proxy(function (event)
	                {
	                    // HACK: only process on focusout when no typeahead opened, to
	                    //       avoid adding the typeahead text as tag
	                    if ($('.typeahead, .twitter-typeahead', self.$container).length === 0)
	                    {
	                        self.add(self.$input.val());
	                        self.$input.val('');
	                    }
	                }, self));
	            }

	            self.$container.on('keydown', 'input', $.proxy(function (event)
	            {
	                var $input        = $(event.target),
	                    $inputWrapper = self.findInputWrapper();

	                if (self.$element.attr('disabled'))
	                {
	                    self.$input.attr('disabled', 'disabled');
	                    return;
	                }

	                switch (event.which)
	                {
	                    // BACKSPACE
	                    case 8:
	                        if (doGetCaretPosition($input[0]) === 0)
	                        {
	                            var prev = $inputWrapper.prev();
	                            if (prev)
	                            {
	                                self.remove(prev.data('item'));
	                            }
	                        }
	                        break;

	                    // DELETE
	                    case 46:
	                        if (doGetCaretPosition($input[0]) === 0)
	                        {
	                            var next = $inputWrapper.next();
	                            if (next)
	                            {
	                                self.remove(next.data('item'));
	                            }
	                        }
	                        break;

	                    // LEFT ARROW
	                    case 37:
	                        // Try to move the input before the previous tag
	                        var $prevTag = $inputWrapper.prev();
	                        if ($input.val().length === 0 && $prevTag[0])
	                        {
	                            $prevTag.before($inputWrapper);
	                            $input.focus();
	                        }
	                        break;
	                    // RIGHT ARROW
	                    case 39:
	                        // Try to move the input after the next tag
	                        var $nextTag = $inputWrapper.next();
	                        if ($input.val().length === 0 && $nextTag[0])
	                        {
	                            $nextTag.after($inputWrapper);
	                            $input.focus();
	                        }
	                        break;
	                    default:
	                    // ignore
	                }

	                // Reset internal input's size
	                var textLength = $input.val().length,
	                    wordSpace  = Math.ceil(textLength / 5),
	                    size       = textLength + wordSpace + 1;
	                $input.attr('size', Math.max(this.inputSize, $input.val().length));
	            }, self));

	            self.$container.on('keydown', 'input', $.proxy(function (event)
	            {
	                var $input = $(event.target);

	                if (self.$element.attr('disabled'))
	                {
	                    self.$input.attr('disabled', 'disabled');
	                    return;
	                }

	                var text             = $input.val(),
	                    maxLengthReached = self.options.maxChars && text.length >= self.options.maxChars;
	                if (self.options.freeInput && (keyCombinationInList(event, self.options.confirmKeys) || maxLengthReached))
	                {
	                    self.add(maxLengthReached ? text.substr(0, self.options.maxChars) : text);
	                    $input.val('');
	                    event.preventDefault();
	                }

	                // Reset internal input's size
	                var textLength = $input.val().length,
	                    wordSpace  = Math.ceil(textLength / 5),
	                    size       = textLength + wordSpace + 1;
	                $input.attr('size', Math.max(this.inputSize, $input.val().length));
	            }, self));

	            // Remove icon clicked
	            self.$container.on('click', '[data-role=remove]', $.proxy(function (event)
	            {
	                if (self.$element.attr('disabled'))
	                {
	                    return;
	                }
	                self.remove($(event.target).closest('.chip').data('item'));
	            }, self));

	            // Only add existing value as tags when using strings as tags
	            if (self.options.itemValue === defaultOptions.itemValue)
	            {
	                if (self.$element[0].tagName === 'INPUT')
	                {
	                    self.add(self.$element.val());
	                }
	            }
	        },

	        /**
	         * Removes all materialtags behaviour and unregsiter all event handlers
	         */
	        destroy : function ()
	        {
	            var self = this;

	            // Unbind events
	            self.$container.off('keydown', 'input');
	            self.$container.off('click', '[role=remove]');

	            self.$container.remove();
	            self.$element.removeData('materialtags');
	            self.$element.show();
	        },

	        /**
	         * Sets focus on the materialtags
	         */
	        focus : function ()
	        {
	            this.$input.focus();
	        },

	        /**
	         * Returns the internal input element
	         */
	        input : function ()
	        {
	            return this.$input;
	        },

	        /**
	         * Returns the element which is wrapped around the internal input. This
	         * is normally the $container, but typeahead.js moves the $input element.
	         */
	        findInputWrapper : function ()
	        {
	            var elt       = this.$input[0],
	                container = this.$container[0];
	            while (elt && elt.parentNode !== container)
	            {
	                elt = elt.parentNode;
	            }

	            return $(elt);
	        }
	    };

	    /**
	     * Register JQuery plugin
	     *
	     * @param arg1
	     * @param arg2
	     * @param arg3
	     * @returns {Array}
	     */
	    $.fn.materialtags = function (arg1, arg2, arg3)
	    {
	        var results = [];

	        this.each(function ()
	        {
	            var materialtags = $(this).data('materialtags');
	            // Initialize a new material tags input
	            if (!materialtags)
	            {
	                materialtags = new TagsMaterialize(this, arg1);
	                $(this).data('materialtags', materialtags);
	                results.push(materialtags);

	                // Init tags from $(this).val()
	                $(this).val($(this).val());
	            }
	            else if (!arg1 && !arg2)
	            {
	                // materialtags already exists
	                // no function, trying to init
	                results.push(materialtags);
	            }
	            else if (materialtags[arg1] !== undefined)
	            {
	                // Invoke function on existing tags input
	                if (materialtags[arg1].length === 3 && arg3 !== undefined)
	                {
	                    var retVal = materialtags[arg1](arg2, null, arg3);
	                }
	                else
	                {
	                    var retVal = materialtags[arg1](arg2);
	                }
	                if (retVal !== undefined)
	                {
	                    results.push(retVal);
	                }
	            }
	        });

	        if (typeof arg1 == 'string')
	        {
	            // Return the results from the invoked function calls
	            return results.length > 1 ? results : results[0];
	        }
	        else
	        {
	            return results;
	        }
	    };

	    $.fn.materialtags.Constructor = TagsMaterialize;

	    /**
	     * Most options support both a string or number as well as a function as
	     * option value. This function makes sure that the option with the given
	     * key in the given options is wrapped in a function
	     *
	     * @param options
	     * @param key
	     */
	    function makeOptionItemFunction(options, key)
	    {
	        if (typeof options[key] !== 'function')
	        {
	            var propertyName = options[key];
	            options[key]     = function (item) { return item[propertyName]; };
	        }
	    }

	    function makeOptionFunction(options, key)
	    {
	        if (typeof options[key] !== 'function')
	        {
	            var value    = options[key];
	            options[key] = function () { return value; };
	        }
	    }

	    /**
	     * HtmlEncodes the given value
	     */
	    var htmlEncodeContainer = $('<div />');

	    function htmlEncode(value)
	    {
	        if (value)
	        {
	            return htmlEncodeContainer.text(value).html();
	        }
	        else
	        {
	            return '';
	        }
	    }

	    /**
	     * Returns the position of the caret in the given input field
	     * http://flightschool.acylt.com/devnotes/caret-position-woes/
	     *
	     * @param oField
	     * @returns {number}
	     */
	    function doGetCaretPosition(oField)
	    {
	        var iCaretPos = 0;
	        if (document.selection)
	        {
	            oField.focus();
	            var oSel  = document.selection.createRange();
	            oSel.moveStart('character', -oField.value.length);
	            iCaretPos = oSel.text.length;
	        }
	        else if (oField.selectionStart || oField.selectionStart == '0')
	        {
	            iCaretPos = oField.selectionStart;
	        }
	        return (iCaretPos);
	    }

	    /**
	     * Returns boolean indicates whether user has pressed an expected key combination.
	     * http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	     * [13, {which: 188, shiftKey: true}]
	     *
	     * @param keyDownEvent
	     * @param lookupList
	     * @returns {boolean}
	     */
	    function keyCombinationInList(keyDownEvent, lookupList)
	    {
	        var found = false;
	        $.each(lookupList, function (index, keyCombination)
	        {
	            if (typeof (keyCombination) === 'number' && keyDownEvent.which === keyCombination)
	            {
	                found = true;
	                return false;
	            }

	            if (keyDownEvent.which === keyCombination.which)
	            {
	                var alt   = !keyCombination.hasOwnProperty('altKey') || keyDownEvent.altKey === keyCombination.altKey,
	                    shift = !keyCombination.hasOwnProperty('shiftKey') || keyDownEvent.shiftKey === keyCombination.shiftKey,
	                    ctrl  = !keyCombination.hasOwnProperty('ctrlKey') || keyDownEvent.ctrlKey === keyCombination.ctrlKey;
	                if (alt && shift && ctrl)
	                {
	                    found = true;
	                    return false;
	                }
	            }
	        });

	        return found;
	    }

	    /**
	     * Initialize materialtags behaviour on inputs which have
	     * data-role=materialtags
	     */
	    $(function ()
	    {
	        $("input[data-role=materialtags]").materialtags();
	    });
	})(window.jQuery);


/***/ },

/***/ 553:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(480);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(21)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../css-loader/index.js!./nouislider.css", function() {
				var newContent = require("!!./../../../css-loader/index.js!./nouislider.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 594:
/***/ function(module, exports) {

	module.exports = "\n<section class=\"-tag-filter\">\n\t\t<input @change=\"filterChange\" v-model=\"tags\" :id=\"componentId\" placeholder=\"search by tags\" type=\"text\" data-role=\"materialtags\" />\n</section>\n\n";

/***/ },

/***/ 595:
/***/ function(module, exports) {

	module.exports = "\n\n<section class=\"-filter-container fx-row fx-start-center m-b-sm row\">\n\n    <div flex>\n\t\t\t<h6 class=\"capital\">total results: <b>{{total}}</b></h6>\n    </div>\n    <!-- <div class=\"switch p-r-sm\">\n        <label>\n            Descending\n            <input type=\"checkbox\">\n            <span class=\"lever\"></span>\n\t\t\t\t\t\tAscending\n        </label>\n    </div> -->\n\t\t<div v-if=\"sortBy\"  class=\"p-none capital fx-row fx-start-center  m-r-sm\">\n\t\t\t <label class=\"m-r-sm\">Order</label>\n\t\t\t\t<select @change=\"order\" v-model=\"orderBy\" class=\"browser-default\">\n\t\t\t\t\t<option value=\"desc\" selected>Descending</option>\n\t\t\t\t\t<option value=\"asc\">Ascending</option>\n\t\t\t\t</select>\n\t\t</div>\n\n    <div class=\"p-none capital fx-row fx-start-center\">\n\t\t\t <label class=\"m-r-sm\">Sort by</label>\n        <select @change=\"order\" v-model=\"sortBy\" class=\"browser-default\">\n            <option value=\"\" selected>Relevent</option>\n            <option v-for=\"option in options\" :value=\"option.value\">{{option.name}}</option>\n        </select>\n    </div>\n\n\n\n</section>\n\n";

/***/ },

/***/ 596:
/***/ function(module, exports) {

	module.exports = "\n\n<section class=\"-pagination-container fx-row fx-center-center m-b-sm row\">\n\t<ul v-if=\"total\" class=\"pagination fx-row fx-start-center\" >\n\t    <li @click=\"prevRange\" :class=\"{'disabled': !hasPrev}\" class=\"waves-effect\"><a class=\"waves-effect waves-teal btn-flat\">Prev. Page<i class=\"material-icons\">chevron_left</i></a></li>\n\t    <li @click=\"goTo(page)\" v-for=\"page in pagesRange\" class=\"waves-effect\" :class=\"{'active teal lighten-2': currentPage == page}\"><a>{{page}}</a></li>\n\t    <li @click=\"nextRange\" :class=\"{'disabled': !hasNext}\" class=\"waves-effect\"><a class=\"waves-effect waves-teal btn-flat\"><i class=\"material-icons\">chevron_right</i>Next Page</a></li>\n\t  </ul>\n</section>\n\n";

/***/ },

/***/ 597:
/***/ function(module, exports) {

	module.exports = "\n<section class=\"row\">\n  <apply></apply>\n  <share></share>\n  <div class=\"p-none hpanel\">\n      <joboffer class=\"m-b-sm\" v-for=\"item in joboffers\" :data=\"item\" :current=\"profile\"></joboffer>\n  </div>\n</section>\n";

/***/ },

/***/ 620:
/***/ function(module, exports) {

	module.exports = "\n\t<section class=\"-filter-containre fx-col m-b-sm\" _v-136b48ed=\"\">\n\t\t<!-- <form class=\"search-container fx-row p-sm row\"> -->\n      <!-- <div class=\"m-none\" flex>\n          <input v-model=\"query\" @keyup=\"search | debounce 10\" type=\"text\" class=\"form-control\" placeholder=\"Search for jobs\">\n      </div> -->\n\t\t\t<div class=\"-search-wrapper m-none card col s12 fx-row fx-start-center\" _v-136b48ed=\"\">\n\t\t\t\t<i class=\"material-icons\" _v-136b48ed=\"\">search</i>\n        <input v-model=\"term\" @keyup=\"search | debounce 100\" id=\"search\" placeholder=\"Search for jobs\" flex=\"\" _v-136b48ed=\"\">\n\n\t\t\t\t<!-- <div class=\"input-field col s12\">\n          <i class=\"material-icons prefix\">search</i>\n          <input id=\"icon_prefix\" type=\"text\" class=\"validate\">\n          <label for=\"icon_prefix\">search for jobs</label>\n        </div> -->\n      </div>\n  \t<!-- </form> -->\n\n\t</section>\n\n";

/***/ },

/***/ 629:
/***/ function(module, exports) {

	module.exports = "\n<section class=\"\" _v-762b109d=\"\">\n\t<ul class=\"ul-none p-none m-none\" _v-762b109d=\"\">\n\t\t<li v-for=\"option in options\" track-by=\"$index\" class=\"p-t-xxs p-b-xxs m-t-xs fx-row fx-space-between-center\" _v-762b109d=\"\">\n\t\t\t<!-- <label class=\"mdl-radio mdl-js-radio\">\n\t\t\t  <input type=\"radio\" class=\"mdl-radio__button\" :name=\"componentId\" :value=\"$index\">\n\t\t\t  <span class=\"mdl-radio__label\">{{option}}</span>\n\t\t\t</label> -->\n\t\t\t<div _v-762b109d=\"\">\n\t\t\t\t<input class=\"with-gap\" :name=\"componentId\" type=\"radio\" :id=\"componentId + $index\" _v-762b109d=\"\">\n\t \t\t\t<label :for=\"componentId + $index\" _v-762b109d=\"\">{{option}}</label>\n\t\t\t</div>\n\n\t\t\t<span _v-762b109d=\"\">{{Math.floor(Math.random()*100)}}</span>\n\t\t</li>\n\t</ul>\n</section>\n\n";

/***/ },

/***/ 630:
/***/ function(module, exports) {

	module.exports = "\n\t<section class=\"-range-filter\" _v-77173d40=\"\">\n\t\t<div id=\"slider\" _v-77173d40=\"\"></div>\n\t\t<div v-if=\"options\" class=\"-info fx-row fx-space-between-center m-t-sm\" _v-77173d40=\"\">\n\t\t\t<div class=\"fx-row fx-start-center\" _v-77173d40=\"\">\n\t\t\t\t<i class=\"-pipe -from teal lighten-2 m-r-xs\" _v-77173d40=\"\"></i>\n\t\t\t\t<b _v-77173d40=\"\">{{from}}</b>\n \t\t\t\t\t<!-- <div class=\"input-field\">\n          <input v-model=\"from\" type=\"text\">\n        </div> -->\n\t\t\t</div>\n\n\t\t\t<!-- <button class=\"btn waves-effect waves-teal btn-flat -undo\"><i class=\"material-icons left\">undo</i>Undo</button> -->\n\n\t\t\t<div class=\"fx-row fx-start-center\" _v-77173d40=\"\">\n\t\t\t\t<b _v-77173d40=\"\">{{to}}</b>\n\t\t\t\t<i class=\"-pipe -to teal lighten-2 m-l-xs\" _v-77173d40=\"\"></i>\n\t\t\t\t<!-- <div class=\"input-field -rtl\">\n          <input v-model=\"to\" type=\"text\" dir=\"rtl\">\n        </div> -->\n\t\t\t</div>\n\t\t</div>\n\t</section>\n\n";

/***/ },

/***/ 631:
/***/ function(module, exports) {

	module.exports = "\n\t<section class=\"\" _v-78f11e30=\"\">\n\t\t<ul class=\"ul-none p-none m-none\" _v-78f11e30=\"\">\n\t\t\t<li v-for=\"option in options\" track-by=\"$index\" class=\"p-t-xxs p-b-xxs m-t-xs fx-row fx-start-top\" _v-78f11e30=\"\">\n\t\t\t\t<div flex=\"\" class=\"-item\" _v-78f11e30=\"\">\n\t\t\t\t\t<input v-model=\"selected\" type=\"checkbox\" class=\"filled-in\" :id=\"componentId + $index\" :value=\"componentId + $index\" _v-78f11e30=\"\">\n      \t\t<label @click=\"filterChange(option)\" flex=\"\" class=\"capital truncate\" :for=\"componentId + $index\" _v-78f11e30=\"\">{{option.name}}</label>\n\t\t\t\t</div>\n\n\t\t\t\t<span v-if=\"statistic\" v-show=\"!selected[0] || true\" class=\"p-l-xs p-r-xs\" _v-78f11e30=\"\">{{option.count}}</span>\n\t\t\t</li>\n\t\t</ul>\n\t</section>\n\n";

/***/ },

/***/ 633:
/***/ function(module, exports) {

	module.exports = "\n<section class=\"-filter-containre\" _v-7e8b3524=\"\">\n\n  <ul class=\"-filter-list  m-none p-none\" data-collapsible=\"expandable\" _v-7e8b3524=\"\">\n\t\t<li _v-7e8b3524=\"\">\n      <div class=\"collapsible-header active capital fx-row fx-start-center\" _v-7e8b3524=\"\">\n        <i class=\"material-icons\" _v-7e8b3524=\"\">assignment</i>\n        <span flex=\"\" _v-7e8b3524=\"\">Categories</span>\n\t\t\t\t<i class=\"material-icons -arrow\" _v-7e8b3524=\"\">arrow_forward</i>\n      </div>\n      <div class=\"collapsible-body font-8 font-light\" _v-7e8b3524=\"\">\n        <check-list :category=\"'category'\" :statistic=\"true\" :options=\"categoryList\" class=\"p-xs\" _v-7e8b3524=\"\"></check-list>\n      </div>\n    </li>\n\t\t<li _v-7e8b3524=\"\">\n\t\t\t<div class=\"collapsible-header active capital fx-row fx-start-center\" _v-7e8b3524=\"\">\n\t\t\t\t<i class=\"material-icons\" _v-7e8b3524=\"\">work</i>\n\t\t\t\t<span flex=\"\" _v-7e8b3524=\"\">Job types</span>\n\t\t\t\t<i class=\"material-icons -arrow\" _v-7e8b3524=\"\">arrow_forward</i>\n\t\t\t</div>\n\t\t\t<div class=\"collapsible-body\" _v-7e8b3524=\"\">\n\t\t\t\t<check-list :category=\"'jobtype'\" :options=\"jobtypeList\" :statistic=\"true\" class=\"p-xs\" _v-7e8b3524=\"\"></check-list>\n\t\t\t</div>\n\t\t</li>\n    <li _v-7e8b3524=\"\">\n      <div class=\"collapsible-header capital fx-row fx-start-center\" _v-7e8b3524=\"\">\n        <i class=\"material-icons md14\" _v-7e8b3524=\"\">store</i>\n        <span flex=\"\" _v-7e8b3524=\"\">Companies</span>\n\t\t\t\t<i class=\"material-icons -arrow\" _v-7e8b3524=\"\">arrow_forward</i>\n      </div>\n      <div class=\"collapsible-body\" _v-7e8b3524=\"\">\n        <check-list :category=\"'company'\" :options=\"companyList\" class=\"p-xs\" _v-7e8b3524=\"\"></check-list>\n      </div>\n    </li>\n    <li _v-7e8b3524=\"\">\n      <div class=\"collapsible-header  capital fx-row fx-start-center\" _v-7e8b3524=\"\">\n        <i class=\"material-icons\" _v-7e8b3524=\"\">attach_money</i>\n        <span flex=\"\" _v-7e8b3524=\"\">Salary range</span>\n\t\t\t\t<i class=\"material-icons -arrow\" _v-7e8b3524=\"\">arrow_forward</i>\n      </div>\n      <div class=\"collapsible-body\" _v-7e8b3524=\"\">\n        <range :category=\"'salary'\" :options=\"salaryRange\" class=\"p-sm\" _v-7e8b3524=\"\"></range>\n      </div>\n    </li>\n\t\t<li _v-7e8b3524=\"\">\n      <div class=\"collapsible-header capital fx-row fx-start-center\" _v-7e8b3524=\"\">\n        <i class=\"material-icons\" _v-7e8b3524=\"\">loyalty</i>\n        <span flex=\"\" _v-7e8b3524=\"\">Tags</span>\n\t\t\t\t<i class=\"material-icons -arrow\" _v-7e8b3524=\"\">arrow_forward</i>\n      </div>\n      <div class=\"collapsible-body\" _v-7e8b3524=\"\">\n        <tags :category=\"'tags'\" class=\"p-sm\" _v-7e8b3524=\"\"></tags>\n      </div>\n    </li>\n  </ul>\n\n</section>\n";

/***/ },

/***/ 635:
/***/ function(module, exports) {

	module.exports = "\n<section class=\"row main-view\" _v-bb706472=\"\">\n\n  <div class=\"col m3\" _v-bb706472=\"\">\n    <filter-container _v-bb706472=\"\"></filter-container>\n  </div>\n\n  <div class=\"col m9\" _v-bb706472=\"\">\n    <searchbox-container _v-bb706472=\"\"></searchbox-container>\n    <infobar-container _v-bb706472=\"\"></infobar-container>\n    <result-container _v-bb706472=\"\"></result-container>\n    <pagination-container class=\"p-b-lg\" _v-bb706472=\"\"></pagination-container>\n  </div>\n\n</section>\n";

/***/ },

/***/ 658:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(533)
	__vue_script__ = __webpack_require__(403)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/filter/slaves/filter.check-list.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(631)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 659:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(535)
	__vue_script__ = __webpack_require__(404)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/filter/slaves/filter.container.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(633)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 660:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(531)
	__vue_script__ = __webpack_require__(405)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/filter/slaves/filter.radio-list.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(629)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 661:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(532)
	__vue_script__ = __webpack_require__(406)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/filter/slaves/filter.range.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(630)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 662:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(517)
	__vue_script__ = __webpack_require__(407)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/filter/slaves/filter.tags.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(594)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 663:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(518)
	__vue_script__ = __webpack_require__(408)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/filter/slaves/infobar.container.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(595)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 664:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(519)
	__vue_script__ = __webpack_require__(409)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/filter/slaves/pagination.container.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(596)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 665:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(410)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/filter/slaves/result.container.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(597)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 666:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(522)
	__vue_script__ = __webpack_require__(411)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/filter/slaves/searchbox.container.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(620)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }

});