webpackJsonp([15],{

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

/***/ 22:
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isReady = isReady;
	exports.isAuthed = isAuthed;
	exports.getAccount = getAccount;
	exports.accountData = accountData;
	function isReady(state) {
	  return state.account.loaded;
	}

	function isAuthed(state) {
	  return state.account.authed;
	}

	function getAccount(state) {
	  return state.account;
	}

	function accountData(_ref) {
	  var account = _ref.account;

	  return account.data;
	}

/***/ },

/***/ 39:
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isReady = isReady;
	exports.chatId = chatId;
	exports.messagesList = messagesList;
	exports.chatData = chatData;
	exports.userId = userId;
	exports.userUUID = userUUID;
	exports.numberOfNotifications = numberOfNotifications;
	exports.messagesToNotifyAbout = messagesToNotifyAbout;
	function isReady(_ref) {
	  var messenger = _ref.messenger;

	  return messenger.loaded;
	}

	function chatId(_ref2) {
	  var messenger = _ref2.messenger;

	  return messenger.loaded;
	}

	function messagesList(_ref3) {
	  var messenger = _ref3.messenger;

	  return messenger.chats;
	}

	function chatData(_ref4) {
	  var messenger = _ref4.messenger;

	  return messenger.data;
	}

	function userId(_ref5) {
	  var messenger = _ref5.messenger;

	  return messenger.connectedUser;
	}

	function userUUID(_ref6) {
	  var messenger = _ref6.messenger;

	  return messenger.connectedUserUUID;
	}

	function numberOfNotifications(_ref7) {
	  var messenger = _ref7.messenger;

	  return messenger.numberOfNotifications;
	}

	function messagesToNotifyAbout(_ref8) {
	  var messenger = _ref8.messenger;

	  return messenger.messagesToNotifyAbout;
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

/***/ 160:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _assign = __webpack_require__(106);

	var _assign2 = _interopRequireDefault(_assign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var connect = __webpack_require__(3);
	var bus = __webpack_require__(6);

	module.exports = {
	  data: function data() {
	    return {
	      id: ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1),
	      listMe: false,
	      clickOut: null,
	      oldState: null,
	      options: {
	        'pushed': {
	          value: 'pushed',
	          icon: 'fa-hourglass-half'
	        },
	        'rejected': {
	          value: 'rejected',
	          icon: 'fa-ban'
	        },
	        'hired': {
	          value: 'hired',
	          icon: 'fa-check'
	        },
	        'phone interview': {
	          value: 'phone interview',
	          icon: 'fa-phone'
	        },
	        'office interview': {
	          value: 'office interview',
	          icon: 'fa-street-view'
	        }
	      }
	    };
	  },

	  props: {
	    recommendation: {
	      type: Object,
	      require: true,
	      default: {}
	    },
	    recomId: {
	      type: Number
	    }
	  },
	  computed: {
	    icon: function icon() {
	      if (!this.recommendation.state || !this.options[this.recommendation.state]) return this.options.pushed.icon;else return this.options[this.recommendation.state].icon;
	    }
	  },
	  created: function created() {
	    var vm = this;
	    this.clickOut = function (event) {
	      if ($(event.target).closest('#drop-down-' + vm.id).length) return true;
	      vm.showmenu(null);
	    };
	  },

	  methods: {
	    showmenu: function showmenu() {
	      this.listMe = !this.listMe;
	      if (this.listMe) $(document).bind('click', this.clickOut);else $(document).unbind('click', this.clickOut);
	    },
	    updateState: function updateState(_value_) {
	      var vm = this;
	      var recID = this.recomId || this.recommendation.id;
	      var jobId = this.recommendation.joboffer_id || this.$route.params.jobId;

	      this.oldState = this.recommendation.state;
	      this.recommendation.state = _value_;

	      connect.apiAsync('PUT', '/dashboard/joboffers/' + jobId + '/recommendations/' + recID, { state: _value_ }).then(function (res) {
	        return bus.$emit('joboffer:rec-state-changed', (0, _assign2.default)(res, { oldvalue: vm.oldState, newvalue: res.state }));
	      }).catch(function () {
	        return vm.recommendation.state = vm.oldState;
	      });
	    }
	  }
	};

/***/ },

/***/ 164:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".down-menu[_v-7af231c2] {\n  position: absolute;\n  z-index: 100 !important;\n  list-style: none;\n  min-width: 120px;\n  border-radius: 2px;\n}\n.down-menu li[_v-7af231c2]:first-child {\n  border-top: 0;\n}\n.down-menu li[_v-7af231c2]:hover {\n  -webkit-transform: translateX(4px);\n          transform: translateX(4px);\n}\n.drop-down[_v-7af231c2] {\n  position: relative;\n  display: inline-block;\n}\n", ""]);

	// exports


/***/ },

/***/ 167:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(164);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-7af231c2&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./dropdown.status.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-7af231c2&scoped=true!./../../../node_modules/less-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./dropdown.status.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 171:
/***/ function(module, exports) {

	module.exports = "\n\n<div id=\"drop-down-{{id}}\" class=\"drop-down p-xxs hand font-1-2 bold\" @click=\"showmenu\" _v-7af231c2=\"\">\n  <div class=\"border p-xxs fx-row fx-start-center\" _v-7af231c2=\"\">\n    <i class=\"material-icons md-20 orange600\" _v-7af231c2=\"\"></i>\n    <span class=\"hand uppercase \" _v-7af231c2=\"\">{{recommendation.state}}</span>\n    <i class=\" fa fa-angle-down p-l-sm\" _v-7af231c2=\"\"></i>\n  </div>\n\n  <div class=\"flesh\" v-show=\"listMe\" _v-7af231c2=\"\"></div>\n  <ul class=\"border bg-white down-menu p-xxs m-none m-t-xs\" v-show=\"listMe\" _v-7af231c2=\"\">\n    <li class=\"capital border-top p-xxs font-8\" v-for=\"op in options\" @click=\"updateState(op.value)\" _v-7af231c2=\"\">\n      <span _v-7af231c2=\"\"><i class=\"fa m-r-xs\" :class=\"op.icon\" _v-7af231c2=\"\"></i> {{op.value}}</span>\n    </li>\n  </ul>\n</div>\n\n";

/***/ },

/***/ 173:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(167)
	__vue_script__ = __webpack_require__(160)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/shared/dropdown.status.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(171)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 180:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var connector = __webpack_require__(3);
	module.exports = {
	  data: function data() {
	    return {
	      error: '',
	      historyList: [],
	      labelClass: {
	        'aborted': 'label-danger',
	        'concluded': 'label-success'
	      }
	    };
	  },
	  created: function created() {
	    var that = this;
	    connector.apiCall('', '/dashboard/joboffers/history', 'GET', function (error, response) {
	      if (!error) {
	        that.historyList = response;
	      }
	    });
	  },

	  methods: {
	    duplicate: function duplicate(id) {
	      window.location = '/addjoboffer/' + id;
	    }
	  }
	};

/***/ },

/***/ 187:
/***/ function(module, exports) {

	module.exports = "\n<div class=\"bg-white m-l-xs\">\n    <div class=\"font-light font-uppercase p-sm\">\n        <i class=\"fa fa-bars\" aria-hidden=\"true\"></i>\n        <span>jobOffer history</span>\n    </div>\n    <div v-if=\"historyList.length\" class=\"hpanel p-none\">\n        <div class=\"panel-body m-none p-none \">\n            <section class=\"cd-timeline cd-container m-sm \">\n                <table class=\"table m-t-sm font-9\">\n                    <tr v-for=\"item in historyList\">\n                        <td>\n                          <img :src=\"item.company.logo\" class=\"img-circle size-24 m-r-xs\" alt=\"logo\">    \n                          <div class=\"tooltip\">\n                            <span class='text-dot w-sm  m-t-xs'>{{item.title}}<span>\n                            <span class=\"tooltiptext\">{{item.title }}</span>\n                          </div>\n                </td>\n                <td class='w-xs'>{{item.suspend_date | moment \"from\" \"now\" }}</td>\n                <td class='w-xs'><span class=\"label p-xxs\" :class=\"labelClass[item.state]\">{{item.state}}</span></td>\n                <td class='w-xs'><span v-if=\"item.id\" class=\"text-primary hand\" @click=\"duplicate(item.id)\"><a><i class=\"material-icons md-14\">&#xE3E0;</i>   <span class=\"capital\" v-ii18n=\"duplicate\">duplicate</span></a></td>\n                    </tr>\n                </table>\n            </section>\n        </div>\n    </div>\n    <section v-else class=\"fx-col fx-start-center placeholder\">\n       <i class=\"material-icons symbol\">&#xE85F;</i>\n       <p class=\"m-none capital\">You don't have any closed joboffer</p>\n   </section>\n</div>\n";

/***/ },

/***/ 191:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(180)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/dashboard/slaves/joboffer_history.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(187)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 200:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var connector = __webpack_require__(3);
	var applicationcard = __webpack_require__(238);
	module.exports = {
	  data: function data() {
	    return {
	      applications: [],
	      allapplications: [],
	      showme: false,
	      showModal: false,
	      currentItem: null,
	      filters: [],
	      options: ['pending', 'pushed', 'rejected', 'hired', 'phone interview', 'office interview']
	    };
	  },

	  props: {
	    joboffer: {
	      type: Number,
	      require: true
	    }
	  },
	  components: {
	    applicationcard: applicationcard
	  },
	  created: function created() {
	    var that = this;
	    this.$watch('filters', function (val) {
	      that.filtreapplications();
	    });
	  },
	  ready: function ready() {
	    this.loadList();
	  },

	  methods: {
	    close: function close() {
	      this.showModal = false;
	    },
	    filtreapplications: function filtreapplications() {
	      var that = this;
	      this.applications = this.filters.length ? this.allapplications.filter(function (e) {
	        return that.filters.indexOf(e.state) > -1;
	      }) : this.allapplications;
	    },
	    loadList: function loadList() {
	      this.showme = !this.showme;
	      if (!this.showme) return;
	      var that = this;
	      connector.apiCall('', '/dashboard/joboffers/' + this.joboffer + '/recommendations', 'GET', function (error, response) {
	        if (!error) {
	          that.allapplications = response.applications;
	          that.applications = response.applications;
	        }
	      });
	    }
	  }
	};

/***/ },

/***/ 201:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var connector = __webpack_require__(3);
	var bus = __webpack_require__(6);
	module.exports = {
	  data: function data() {
	    return {
	      data: null,
	      jobOffers: null,
	      limit: 10,
	      total: null,
	      listMe: false,
	      currentId: null
	    };
	  },
	  created: function created() {
	    this.loadJobOffer();
	    var vm = this;
	    this.clickOut = function (event) {
	      if ($(event.target).closest('#drop-down').length) return true;
	      vm.showmenu(null);
	    };
	  },
	  ready: function ready() {
	    bus.$on('deleteJoboffer:callback', function (status, id) {
	      if (status) {
	        connector.apiCall('', '/dashboard/joboffers/' + id, 'PUT', function (error, response) {
	          if (!error) {
	            window.location = '/';
	          }
	        });
	      }
	    });
	  },

	  methods: {
	    loadJobOffer: function loadJobOffer() {
	      var that = this;
	      connector.apiCall({
	        limit: this.limit
	      }, '/dashboard/joboffers', 'GET', function (error, response, header) {
	        if (!error) {
	          that.jobOffers = response;
	          that.total = parseInt(connector.parse(header).total);
	        }
	      });
	    },
	    viewDetail: function viewDetail(joboffer) {
	      var jobId = joboffer.slug ? joboffer.slug : joboffer.uuid;
	      this.$router.go({
	        name: 'joboffer',
	        params: { jobId: jobId }
	      });
	    },
	    gotoCompany: function gotoCompany(company) {
	      var id = company.slug ? company.slug : company.uuid;
	      this.$router.go({
	        name: 'company',
	        params: { id: id }
	      });
	    }
	  }
	};

/***/ },

/***/ 202:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _assign = __webpack_require__(106);

	var _assign2 = _interopRequireDefault(_assign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var applications = __webpack_require__(235);
	var connector = __webpack_require__(3);
	var recommendationinfo = __webpack_require__(239);
	var bus = __webpack_require__(6);
	module.exports = {
	  data: function data() {
	    return {
	      data: null,
	      jobOffers: null,
	      limit: 10,
	      total: null
	    };
	  },

	  components: {
	    applications: applications,
	    recommendationinfo: recommendationinfo
	  },
	  created: function created() {
	    this.loadJobOffer();
	  },
	  ready: function ready() {
	    bus.$on('deleteJoboffer:callback', function (status, id) {
	      if (status) {
	        connector.apiCall('', '/dashboard/joboffers/' + id, 'PUT', function (error, response) {
	          if (!error) {
	            window.location = '/';
	          }
	        });
	      }
	    });
	  },

	  methods: {
	    loadJobOffer: function loadJobOffer() {
	      var that = this;
	      connector.apiCall({
	        limit: this.limit
	      }, '/dashboard/joboffers', 'GET', function (error, response, header) {
	        if (!error) {
	          that.jobOffers = response;
	          that.total = parseInt(connector.parse(header).total);
	        }
	      });
	    },
	    showApplication: function showApplication(id) {
	      var item = this.jobOffers[id];
	      if (!('currentView' in item)) this.jobOffers.$set(id, (0, _assign2.default)({}, item, { currentView: 'applications' }));else if (!item.currentView || item.currentView == 'recommendations') item.currentView = 'applications';else item.currentView = null;
	    },
	    gotoCompany: function gotoCompany(company) {
	      var id = company.slug ? company.slug : company.uuid;
	      this.$router.go({
	        name: 'company',
	        params: { id: id }
	      });
	    },
	    viewDetail: function viewDetail(joboffer) {
	      var jobId = joboffer.slug ? joboffer.slug : joboffer.uuid;
	      this.$router.go({
	        name: 'joboffer',
	        params: { jobId: jobId }
	      });
	    }
	  }
	};

/***/ },

/***/ 203:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var status = __webpack_require__(173);
	var bus = __webpack_require__(6);
	module.exports = {
	  components: {
	    status: status
	  },
	  data: function data() {
	    return {
	      listMe: false,
	      clickOut: null
	    };
	  },

	  props: {
	    data: {
	      type: Object,
	      require: true
	    }
	  },
	  computed: {
	    name: function name() {
	      return this.data.target.id ? this.data.target.firstname + ' ' + this.data.target.lastname : this.data.email;
	    }
	  },
	  created: function created() {
	    var that = this;
	    this.clickOut = function (event) {
	      if ($(event.target).closest('#menu-' + that.data.id).length) return true;
	      that.showmenu(null);
	    };
	  },

	  methods: {
	    showmenu: function showmenu() {
	      this.listMe = !this.listMe;
	      if (this.listMe) $(document).bind('click', this.clickOut);else $(document).unbind('click', this.clickOut);
	    },
	    showInfo: function showInfo() {
	      bus.$emit('dashboard:recommendations:showinfo', this.data.joboffer_id, this.data.id);
	    }
	  }
	};

/***/ },

/***/ 204:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var connector = __webpack_require__(3);
	var modal = __webpack_require__(12);
	var bus = __webpack_require__(6);
	module.exports = {
	  data: function data() {
	    return {
	      showModal: false,
	      currentItem: null,
	      editable: false,
	      log: ''
	    };
	  },

	  components: {
	    modal: modal
	  },
	  ready: function ready() {
	    bus.$on('dashboard:recommendations:showinfo', this.show);
	  },

	  computed: {
	    remainChars: function remainChars() {
	      if (this.log && this.log.length) {
	        return 240 - this.log.split('\n').join('  ').length;
	      } else return 240;
	    }
	  },
	  methods: {
	    close: function close() {
	      this.showModal = false;
	      this.log = '';
	      this.currentItem = null;
	      this.editable = false;
	    },
	    show: function show(job, rec) {
	      var that = this;
	      connector.apiCall('', '/dashboard/joboffers/' + job + '/recommendations/' + rec, 'GET', function (error, response) {
	        if (!error) {
	          that.currentItem = response;
	          that.log = response.commentable[0] ? response.commentable[0].comment : '';
	          that.showModal = true;
	        }
	      });
	    },
	    editLog: function editLog() {
	      this.editable = true;
	    },
	    sendComment: function sendComment(e) {
	      if (e.shiftKey) return;
	      this.editable = false;
	      connector.apiCall({
	        comment: this.log
	      }, '/dashboard/joboffers/' + this.currentItem.joboffer_id + '/recommendations/' + this.currentItem.id + '/comment', 'POST', function (error, response) {
	        if (!error) {}
	      });
	    }
	  }
	};

/***/ },

/***/ 205:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var connector = __webpack_require__(3);

	module.exports = {
	  data: function data() {
	    return {
	      error: '',

	      applicationList: [],
	      labelClass: {
	        'pending': 'label-warning',
	        'pushed': 'label-info',
	        'rejected': 'label-danger',
	        'hired': 'label-success',
	        'phone interview': 'label-primary',
	        'office interview': 'label-primary'
	      }
	    };
	  },

	  props: {
	    profileId: {
	      type: Number,
	      require: true
	    }
	  },
	  ready: function ready() {
	    var that = this;
	    connector.apiCall('', '/dashboard/recommendations', 'GET', function (error, response) {
	      if (!error) {
	        response.map(function (e) {
	          if (e.recommended == that.profileId && e.type == 'application') that.applicationList.push(e);
	        });
	      }
	    });
	  },

	  methods: {
	    viewDetail: function viewDetail(joboffer) {
	      var jobId = joboffer.slug ? joboffer.slug : joboffer.uuid;
	      this.$router.go({
	        name: 'joboffer',
	        params: { jobId: jobId }
	      });
	    }
	  }
	};

/***/ },

/***/ 212:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, ".card[_v-035e28db] {\n  border-radius: 5px 5px 5px 5px;\n  width: 190px;\n}\n.down-menu[_v-035e28db] {\n  position: absolute;\n  z-index: 100;\n  list-style: none;\n  min-width: 140px;\n}\n.down-menu li[_v-035e28db]:first-child {\n  border-top: 0;\n}\n", ""]);

	// exports


/***/ },

/***/ 213:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "/*doc\n---\ntitle: Colors\nname: colors\ncategory: Base CSS\n---\n\nColors: to be able to use the predefined colors, You need to import common/less/colors.less\n\n```html_example\n<style>\n@import \"../src/components/common/less/colors.less\"\n</style>\n<div class=\"size-32\" style=\"background-color: @color-navy-blue\">Click</div>\n```\n*/\n/* Mixin */\n.line-style[_v-0e771379] {\n  border-bottom: 2px dashed #e4e5e7;\n  display: inline-block;\n}\n", ""]);

	// exports


/***/ },

/***/ 214:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "td[_v-4d80ea2e] {\n  padding: 10px 10px 10px 10px !important;\n}\n.group-name[_v-4d80ea2e] {\n  display: inline-block;\n  max-width: 200px;\n  max-height: 50px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n", ""]);

	// exports


/***/ },

/***/ 218:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(212);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-035e28db&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./recommendation_card.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-035e28db&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./recommendation_card.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 219:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(213);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-0e771379&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./recommendation_info.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-0e771379&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./recommendation_info.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 220:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(214);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-4d80ea2e&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./statistics.vue", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-4d80ea2e&scoped=true!./../../../../node_modules/less-loader/index.js!./../../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./statistics.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 226:
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAN8AAADfCAYAAAB2+QYsAAAAhnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjadY7LDcMwDEPvniIj6Gd9xinSGMgGHb8SHMOnvANFEALBdv3u0Y4CgZp0cw1VSCQk6JPGYcIASIB1UyfPZUxHO25M02i4gexHefJFZ3UdJmba9dSTsp0uRvbUKqpWqBmxS75jLXrJ14o/V7Us5DXwZoEAAAoGaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICBleGlmOlBpeGVsWERpbWVuc2lvbj0iMjIzIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iMjIzIgogICB0aWZmOkltYWdlV2lkdGg9IjIyMyIKICAgdGlmZjpJbWFnZUhlaWdodD0iMjIzIgogICB0aWZmOk9yaWVudGF0aW9uPSIxIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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"

/***/ },

/***/ 227:
/***/ function(module, exports) {

	module.exports = "\n<div v-show=\"showme\">\n    <div class=\"bg-white m-l-sm row\">\n        <div class=\"checkbox checkbox-success m-l-md checkbox-inline col s3\" v-for=\"item in options\">\n            <input type=\"checkbox\" :id=\"joboffer+item\" :value=\"item\" v-model=\"filters\">\n            <label :for=\"joboffer+item\"> {{item}} </label>\n        </div>\n    </div>\n    <div class=\"reclist m-l-sm\">\n      <div class=\"inline-block\" v-for=\"item in applications\">\n        <applicationcard :data=\"item\"></applicationcard>\n      </div>\n    </div>\n</div>\n";

/***/ },

/***/ 228:
/***/ function(module, exports) {

	module.exports = "\n<div class=\"bg-white m-l-xs \">\n    <div class=\"font-light font-uppercase border-bottom p-sm\">\n        <i class=\"fa fa-trash-o\"></i>\n        <span>Draft</span>\n    </div>\n    <div v-for=\"item in jobOffers\" track-by=\"$index\">\n        <div class=\"m-b-xs font-8 p-t-xs\" v-if=\"item.state == 'staged'\">\n            <div class=\"panel-body m-none p-none row\">\n               <div class=\"col s8\">\n                <section class=\"fx-row fx-start-center p-xs\">\n                    <img @click=\"gotoCompany(item.company)\" :src=\"item.company ? item.company.logo : ''\" alt=\"logo\" class=\"img-rounded company-logo border size-32 hand\">\n                    <div class=\"fx-col m-l-xs\" flex>\n                      <span @click=\"gotoCompany(item.company)\"class=\"font-uppercase hand\">{{item.company.name || item.company}}</span>\n                      <span class=\"break-word\">{{item.title}}</span>\n                    </div>\n                </section>\n                <div class=\"m-l-sm\">\n                  <span class=\"break-word\">  {{{item.description | lineBreak}}} </span>\n                </div>\n             </div>\n              <div class=\"pull-right col s4 row\">\n                       <div class=\"col s4 offset-s4\">\n                          <span v-if=\"item.id\" @click=\"viewDetail(item)\" class=\"m-l-md text-primary hand \"> <span class=\"capital middle\" v-ii18n=\"detailLbl\">View Details <i class=\"material-icons\">&#xE5CC;</i></span>\n                          </span>\n                        </div>\n                 </div>\n            </div>\n        </div>\n    </div>\n</div>\n";

/***/ },

/***/ 229:
/***/ function(module, exports) {

	module.exports = "\n<div class=\"m-l-xs\">\n    <recommendationinfo></recommendationinfo>\n    <div class=\"bg-white\" >\n      <div  v-for=\"item in jobOffers\" track-by=\"$index\">\n        <div class=\"m-b-xs font-8 p-t-xs\" v-if=\"item.state != 'staged'\">\n            <div class=\"panel-body p-sm m-none p-none border-bottom row\">\n              <div class=\"col s8\">\n                <section class=\"fx-row fx-start-center p-xs\">\n                    <img @click=\"gotoCompany(item.company)\" :src=\"item.company ? item.company.logo : ''\" alt=\"logo\" class=\"img-rounded company-logo border size-32 hand\">\n                    <div class=\"fx-col m-l-xs\" flex>\n                      <span @click=\"gotoCompany(item.company)\" class=\"font-uppercase hand\">{{item.company.name || item.company}}</span>\n                      <span class=\"break-word\">{{item.title}}</span>\n                    </div>\n                </section>\n                <div class=\"m-l-sm\">\n                  <span class=\"break-word\">  {{{item.description | lineBreak}}} </span>\n                </div>\n                  <section class=\"fx-row\">\n                      <div @click=\"showApplication($index)\" v-if=\"item.state!='staged' && item.statistic.application.count > 0\" class=\"p-sm m-l-sm font-bold text-info hand\">\n                          <span class=\"capital\">{{item.statistic.application.count}} {{item.statistic.application.count | pluralize 'application'}}</span>\n                      </div>\n                 </section>\n                 <component :is=\"item.currentView\" transition=\"fade-in\" :joboffer=\"item.id\"></component>\n               </div>\n                 <div class=\"col s4 row pull-right\">\n                       <div class=\"col s4 offset-s4\">\n                          <span v-if=\"item.id\" @click=\"viewDetail(item)\" class=\"m-l-md text-primary hand \"> <span class=\"capital middle\" v-ii18n=\"detailLbl\">View Details <i class=\"material-icons \">&#xE5CC;</i></span>\n                          </span>\n                        </div>\n                 </div>\n                <!-- <applications v-if=\"item.showrec\" :joboffer=\"item.id\"></applications> -->\n            </div>\n        </div>\n    </div>\n    </div>\n</div>\n";

/***/ },

/***/ 230:
/***/ function(module, exports) {

	module.exports = "\n<div class=\"border card m-xxs\" _v-035e28db=\"\">\n    <div class=\"card-info m-xs\" _v-035e28db=\"\">\n        <span class=\"pull-right hand\" @click=\"showInfo\" _v-035e28db=\"\"><i class=\"fa fa-info-circle\" _v-035e28db=\"\"></i></span>\n        <div class=\"fx-row fx-start-center\" _v-035e28db=\"\">\n            <img :src=\"data.target.img\" class=\"img-circle m-xs size-32 fx user-image\" alt=\"logo\" title=\"{{data.target.firstname}} {{data.target.lastname}}\" _v-035e28db=\"\">\n            <div class=\"font-light word-wrapper\" _v-035e28db=\"\">\n                <span class=\"text-dot w-sm\" _v-035e28db=\"\">{{name}}</span>\n                <br _v-035e28db=\"\">\n                <span class=\"font-8 text-dot w-sm\" _v-035e28db=\"\">{{data.target.title}}</span>\n            </div>\n        </div>\n        <status :recommendation=\"data\" _v-035e28db=\"\"></status>\n    </div>\n</div>\n";

/***/ },

/***/ 231:
/***/ function(module, exports, __webpack_require__) {

	module.exports = "\n<modal :show.sync=\"showModal\" v-if=\"currentItem\" _v-0e771379=\"\">\n    <div class=\"p-sm panel-heading capital\" slot=\"header\" _v-0e771379=\"\">\n        <i class=\"fa fa-info-circle m-r-sm\" _v-0e771379=\"\"></i> <span _v-0e771379=\"\">Recommendation info</span>\n    </div>\n    <div class=\"p-l-sm p-r-sm m-b-md\" slot=\"body\" _v-0e771379=\"\">\n        <!-- <p class=\"text-danger m-b-xs error\" v-if=\"error\">\n            <span>{{error}}</span>\n        </p> -->\n        <div class=\"fx-row fx-center-center\" _v-0e771379=\"\">\n            <div class=\"center m-xs\" _v-0e771379=\"\">\n                <img :src=\"currentItem.origin.img\" class=\" user-image img-circle m-xs size-32 fx\" alt=\"logo\" _v-0e771379=\"\">\n                <span _v-0e771379=\"\"></span>\n            </div>\n            <div class=\"m-xs fx-row fx-start-center\" _v-0e771379=\"\">\n                <div class=\"w-xxs line-style\" _v-0e771379=\"\"></div>\n                <img src=\"" + __webpack_require__(226) + "\" class=\"img-circle m-xs size-32 fx border\" _v-0e771379=\"\">\n                <div class=\"w-xxs line-style\" _v-0e771379=\"\"></div>\n            </div>\n            <div class=\"m-xs center\" _v-0e771379=\"\">\n                <img :src=\"currentItem.target.img\" class=\" user-image img-circle m-xs size-32 fx\" alt=\"logo\" _v-0e771379=\"\">\n            </div>\n        </div>\n        <div v-if=\"currentItem.responses &amp;&amp; currentItem.responses.length > 0\" class=\"m-t-sm\" _v-0e771379=\"\">\n            <h4 class=\"p-none m-none m-b-xs capital\" v-ii18n=\"quiz\" _v-0e771379=\"\">Quiz</h4>\n            <div class=\"border-top p-t-xs\" v-for=\"response in currentItem.responses\" _v-0e771379=\"\">\n                <span _v-0e771379=\"\"> - {{response.question.subject}}</span>\n                <br _v-0e771379=\"\">\n                <span _v-0e771379=\"\"><img :src=\"currentItem.origin.img\" class=\" user-image img-circle m-xs size-16 fx\" alt=\"logo\" _v-0e771379=\"\">{{response.content}}</span>\n            </div>\n        </div>\n        <div class=\"m-t-sm\" _v-0e771379=\"\">\n            <h4 class=\"p-none m-none m-b-xs capital\" _v-0e771379=\"\">Comment</h4>\n            <i class=\"pull-right fa fa-pencil hand m-xs\" @click=\"editLog\" v-if=\"!editable &amp;&amp; log\" _v-0e771379=\"\"></i>\n            <div class=\"h-max-250 p-none border-top p-t-xs\" v-if=\"!editable &amp;&amp; log\" _v-0e771379=\"\">\n                <p style=\"white-space: pre-line\" _v-0e771379=\"\">{{log}}</p>\n            </div>\n            <div class=\"fx-row \" v-if=\"editable || !log\" _v-0e771379=\"\">\n                <div class=\"col-xs-12 p-none\" _v-0e771379=\"\">\n                    <textarea rows=\"5\" class=\"form-control input-sm\" v-model=\"log\" name=\"comment\" maxlength=\"240\" @keyup.enter=\"sendComment\" _v-0e771379=\"\"></textarea>\n                    <div class=\" font-8 text-warning pull-right\" _v-0e771379=\"\">{{remainChars}}</div>\n                </div>\n            </div>\n        </div>\n    </div>\n    <div slot=\"footer\" class=\"m-r-md m-t-sm row p-xs \" _v-0e771379=\"\">\n        <div class=\"pull-right\" _v-0e771379=\"\">\n            <button @click=\"close\" :class=\"{ 'disabled': isLoading }\" class=\"w-xs font-light btn btn-success m-l-md font-8 uppercase\" name=\"close\" v-ii18n=\"ok\" _v-0e771379=\"\">Ok</button>\n        </div>\n    </div>\n</modal>\n";

/***/ },

/***/ 232:
/***/ function(module, exports) {

	module.exports = "\n<div class=\" m-none p-sm m-l-xs\" _v-4d80ea2e=\"\">\n    <span class=\"p-xs font-light font-1-2 sans-serif capital\" _v-4d80ea2e=\"\"><i class=\"fa fa-bars font-9 m-r-xs\" _v-4d80ea2e=\"\"></i><span _v-4d80ea2e=\"\">Job Applications</span></span>\n    <span class=\"m-r-md\" _v-4d80ea2e=\"\">\n      <input type=\"checkbox\" id=\"open\" _v-4d80ea2e=\"\">\n      <label for=\"open\" _v-4d80ea2e=\"\">Open</label>\n    </span>\n    <span _v-4d80ea2e=\"\">\n      <input type=\"checkbox\" id=\"closed\" _v-4d80ea2e=\"\">\n      <label for=\"closed\" _v-4d80ea2e=\"\">Closed</label>\n    </span>\n    <span class=\"text-success hand m-l-lg btn-white p-xs\" _v-4d80ea2e=\"\">\n        Filter\n    </span>\n    <div class=\"reclist m-sm bg-white \" _v-4d80ea2e=\"\">\n        <table v-if=\"applicationList.length\" class=\"bg-white table m-t-sm font-9\" _v-4d80ea2e=\"\">\n            <tbody _v-4d80ea2e=\"\"><tr v-for=\"item in applicationList\" track-by=\"$index\" _v-4d80ea2e=\"\">\n                <td _v-4d80ea2e=\"\">\n              <div class=\"tooltip\" v-if=\"item.joboffer.company\" _v-4d80ea2e=\"\">\n                <span class=\"font-light group-name w-max-100\" _v-4d80ea2e=\"\">\n                    <span _v-4d80ea2e=\"\"><i class=\"fa fa-dot-circle-o\" aria-hidden=\"true\" _v-4d80ea2e=\"\"></i> {{item.joboffer.company.name}}</span> <br _v-4d80ea2e=\"\">\n                    <span _v-4d80ea2e=\"\"> {{item.joboffer.title}}</span>\n                </span>\n                <span class=\"tooltiptext\" _v-4d80ea2e=\"\">{{item.joboffer.company.name }}<br _v-4d80ea2e=\"\"> {{item.joboffer.title}}</span>\n              </div>\n\n                </td>\n                <td _v-4d80ea2e=\"\">\n                    <div _v-4d80ea2e=\"\">{{item.created_at | moment \"from\" \"now\" }}</div>\n                </td>\n                <td class=\"w-xs\" _v-4d80ea2e=\"\">\n                    <div class=\"label p-xxs \" :class=\"labelClass[item.state]\" _v-4d80ea2e=\"\">{{item.state}}</div>\n                </td>\n                <td class=\"w-xs \" _v-4d80ea2e=\"\">\n                        <div @click=\"viewDetail(item.joboffer)\" class=\"capital font-light font-9 hand\" _v-4d80ea2e=\"\">View Detail</div>\n                </td>\n            </tr>\n        </tbody></table>\n        <section v-else=\"\" class=\"fx-col fx-start-center placeholder\" _v-4d80ea2e=\"\">\n          <i class=\"fa fa-exclamation-circle symbol\" _v-4d80ea2e=\"\"></i>\n          <!-- <h2 class=\"m-none capital\" v-ii18n=\"\">No one recommended yet</h2> -->\n          <p class=\"m-none capital\" v-ii18n=\"\" _v-4d80ea2e=\"\">You didn't apply to any joboffer yet</p>\n        </section>\n    </div>\n\n</div>\n";

/***/ },

/***/ 235:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(200)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/dashboard/slaves/applications.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(227)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 236:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(201)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/dashboard/slaves/joboffer_draft.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(228)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 237:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(202)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/dashboard/slaves/joboffers.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(229)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 238:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(218)
	__vue_script__ = __webpack_require__(203)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/dashboard/slaves/recommendation_card.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(230)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 239:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(219)
	__vue_script__ = __webpack_require__(204)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/dashboard/slaves/recommendation_info.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(231)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 240:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(220)
	__vue_script__ = __webpack_require__(205)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/dashboard/slaves/statistics.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(232)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },

/***/ 401:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _getters = __webpack_require__(22);

	var _getters2 = __webpack_require__(39);

	var _actions = __webpack_require__(11);

	var _getters3 = __webpack_require__(20);

	var statisticscomponent = __webpack_require__(240);
	var connector = __webpack_require__(3);
	var joboffers = __webpack_require__(237);
	var jobofferhistory = __webpack_require__(191);
	var jobofferdraft = __webpack_require__(236);

	module.exports = {
	  vuex: {
	    actions: {
	      loadProfile: _actions.loadProfile
	    },
	    getters: {
	      account: _getters.accountData,
	      isReady: _getters.isReady,
	      numberOfMessage: _getters2.numberOfNotifications,
	      profile: _getters3.profileData
	    }
	  },
	  data: function data() {
	    return {
	      isrecruiter: false,
	      open: true,
	      closed: false,
	      draft: false,
	      limit: 10,
	      applicationCount: 0
	    };
	  },

	  components: {
	    jobofferhistory: jobofferhistory,
	    jobofferdraft: jobofferdraft,
	    joboffers: joboffers,
	    statisticscomponent: statisticscomponent
	  },
	  computed: {
	    profileCompletion: function profileCompletion() {
	      var item = 0;
	      if (this.profile) {
	        if (this.account.img) item++;
	        if (this.profile.about.about) item++;
	        if (this.profile.customsectionscategories && this.profile.customsectionscategories.length > 0) item++;
	        if (this.profile.experience && this.profile.experience.length > 0) item++;
	        if (this.profile.education && this.profile.education.length > 0) item++;
	      }
	      return item * 20;
	    }
	  },
	  ready: function ready() {
	    this.loadProfile();
	    var that = this;
	    connector.apiCall({
	      limit: this.limit
	    }, '/dashboard/joboffers', 'GET', function (error, response, header) {
	      if (!error) {
	        response.map(function (job) {
	          that.applicationCount = that.applicationCount + job.statistic.application.count;
	        });
	      }
	    });
	  }
	};

/***/ },

/***/ 489:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports


	// module
	exports.push([module.id, "\n#dashboard-container{\n  margin-top: 100px;\n}\n\n.big-icon{\n  font-size: 76px;\n}\n.number{\n  font-size: 67px;\n}\n", ""]);

	// exports


/***/ },

/***/ 520:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(489);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.dashboard.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./view.dashboard.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 592:
/***/ function(module, exports) {

	module.exports = "\n<div  transition=\"fade-in\" id=\"dashboard-container\">\n  <div class=\"center\">\n    <div class=\"switch\">\n        <label>\n          <span class=\"font-1-5 font-light\">Job Seeker</span>\n          <input v-model=\"isrecruiter\" type=\"checkbox\">\n          <span class=\"lever\"></span>\n            <span class=\"font-1-5 font-light\">Recruiter</span>\n        </label>\n      </div>\n\n  </div>\n\n  <div class=\"row m-none p-none m-t-lg \">\n    <div class=\"col s12 m3\">\n      <div class=\"card teal center\">\n        <div class=\"card-content white-text font-light m-none \">\n          <p class=\"number font-light\">{{profileCompletion}}%</p>\n        </div>\n        <div class=\"card-action \">\n          <a href=\"#\" class=\"font-light white-text font-8\">Profile Completion</a>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"col s12 m3\">\n      <div class=\"card cyan center\">\n        <div class=\"card-content white-text font-light\">\n          <i class=\"material-icons big-icon white-text\">&#xE0C9;</i><span class=\"new badge\">{{numberOfMessage}}</span>\n        </div>\n        <div class=\"card-action \">\n          <a href=\"#\" class=\"font-light white-text\">Messages</a>\n        </div>\n      </div>\n    </div>\n\n   <div class=\"col s12 m3\">\n    <div class=\"card blue-grey darken-1 center\">\n      <div class=\"card-content white-text font-light\">\n        <i class=\"material-icons big-icon white-text\">&#xE55A;</i><span class=\"new badge\">{{account.visits}}</span>\n      </div>\n      <div class=\"card-action \">\n        <a href=\"#\" class=\"font-light white-text\">Profile Views</a>\n      </div>\n    </div>\n   </div>\n\n   <div class=\"col s12 m3\">\n    <div class=\"card orange center\">\n      <div class=\"card-content white-text font-light\">\n        <i class=\"material-icons big-icon white-text\">&#xE065;</i>\n      </div>\n\n      <div class=\"card-action \">\n        <a href=\"#\" class=\"font-light white-text\">{{applicationCount}} Open Applications</a>\n      </div>\n    </div>\n   </div>\n\n </div>\n <div v-if=\"isrecruiter && isReady\" class=\"font-light font-uppercase border-bottom p-sm\">\n            <span class=\"m-r-lg\">My Job Offers</span>\n            <span class=\"m-r-md\">\n              <input type=\"checkbox\" id=\"open\" v-model=\"open\" checked />\n              <label for=\"open\">Open</label>\n            </span>\n            <span class=\"m-r-md\">\n              <input type=\"checkbox\" id=\"closed\" v-model=\"closed\"/>\n              <label for=\"closed\">Closed</label>\n            </span>\n            <span class=\"m-r-md\">\n              <input type=\"checkbox\" id=\"draft\" v-model=\"draft\"/>\n              <label for=\"draft\">Draft</label>\n            </span>\n </div>\n  <joboffers v-if=\"isrecruiter && isReady && open\" :profile-id=\"account.id\"></joboffers>\n  <jobofferdraft v-if=\"isrecruiter && isReady && draft\" :profile-id=\"account.id\"></jobofferdraft>\n  <jobofferhistory v-if=\"isrecruiter && isReady && closed\" :profile-id=\"account.id\"></jobofferhistory>\n  <statisticscomponent v-if=\"!isrecruiter && isReady\" :profile-id=\"account.id\"></statisticscomponent>\n</div>\n\n";

/***/ },

/***/ 657:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(520)
	__vue_script__ = __webpack_require__(401)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/dashboard/view.dashboard.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(592)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }

});