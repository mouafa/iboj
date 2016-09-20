webpackJsonp([27],{

/***/ 388:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var connect = __webpack_require__(3);
	module.exports = {
	  data: function data() {
	    return {
	      joboffer: { id: 0, description: '', expectations: '', benefits: '' }
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
	  methods: {
	    loadJoboffer: function loadJoboffer(id) {
	      var vm = this;
	      return connect.apiAsync('GET', '/dashboard/joboffers/' + id + '?fields=[id,description,expectations,benefits]').then(function (res) {
	        vm.joboffer.id = res.id;
	        vm.joboffer.description = res.description || '';
	        vm.joboffer.expectations = res.expectations || '';
	        vm.joboffer.benefits = res.benefits || '';
	      });
	    },
	    next: function next() {
	      var vm = this;
	      var data = {
	        description: this.joboffer.description,
	        expectations: this.joboffer.expectations,
	        benefits: this.joboffer.benefits
	      };
	      connect.apiAsync('PUT', '/joboffers/' + this.joboffer.id, data).then(function (res) {
	        return vm.$router.go({ name: 'job-quizbuilder', params: { jobId: res.id } });
	      });
	    },
	    remainChars: function remainChars(field) {
	      if (field && field.length) {
	        return 400 - field.split('\n').join('  ').length;
	      } else return 400;
	    }
	  }
	};

/***/ },

/***/ 581:
/***/ function(module, exports) {

	module.exports = "\n<div class=\"font-9 font-light  m-t-md  p-r-md bg-white col s7 offset-s2\">\n    <div class=\"row m-r-lg m-b-lg m-l-lg p-t-lg\">\n      <div class=\"col s12 p-t-lg border\">\n          <!-- Job Description -->\n        <div class=\"row\">\n           <div class=\"input-field col s12\">\n            <label for=\"description\" class=\"capital\" :class=\"{'active': joboffer.description}\">description</label>\n             <textarea id=\"description\" class=\"materialize-textarea\" v-model=\"joboffer.description | substring 400\"  maxlength=\"400\" id=\"description\"></textarea>\n          </div>\n            <div class=\"m-b-sm font-8 text-warning pull-right\">{{remainChars(joboffer.description )}}</div>\n         </div>\n\n            <!-- Job Requirements -->\n        <div class=\"row\">\n           <div class=\"input-field col s12\">\n            <label for=\"Requirements\" class=\"capital\" :class=\"{'active': joboffer.expectations}\">Requirements</label>\n             <textarea id=\"Requirements\" class=\"materialize-textarea\" v-model=\"joboffer.expectations | substring 400\"  maxlength=\"400\" id=\"Requirements\"></textarea>\n           </div>\n            <div class=\"m-b-sm font-8 text-warning pull-right\">{{remainChars(joboffer.expectations)}}</div>\n         </div>\n\n            <!-- Job Benefits -->\n        <div class=\"row\">\n           <div class=\"input-field col s12\">\n            <label for=\"Benefits\" class=\"capital\" :class=\"{'active': joboffer.benefits}\">Benefits</label>\n             <textarea id=\"Benefits\" class=\"materialize-textarea\" v-model=\"joboffer.benefits | substring 400\"  maxlength=\"400\" id=\"Benefits\"></textarea>\n          </div>\n         <div class=\"m-b-sm font-8 text-warning pull-right\">{{remainChars(joboffer.expectations)}}</div>\n         </div>\n      </div>\n         <div class=\"pull-right m-r-lg  m-t-sm \">\n          <button @click=\"next\" class=\"w-xs font-light btn btn-primary m-l-md font-8 uppercase\" v-ii18n=\"next\">next</button>\n      </div>\n </div>\n</div>\n";

/***/ },

/***/ 644:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(388)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src/components/add-joboffer/view.description.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(581)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }

});