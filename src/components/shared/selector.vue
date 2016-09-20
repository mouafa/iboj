<style lang="less" scoped>
.auto-complete {
  position: relative;
    .list {
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        z-index: 998;
        background: white;
        width: 100%;
        padding: 0 6px;
        max-width: 570px;
        max-height: 200px;
        overflow-y: auto;
        overflow-x: none;
        margin-top: 0px;
        li {
            list-style: none;
            min-height: 20px;
            line-height: 2rem;
        }
    }
}
.sticker {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.wrrap {
    display: inline-block;
    max-width: 180px;
}
</style>

<template>
  <div>
    <div class="m-none auto-complete" v-if="!selected || !selectable">
      <div class="input-field p-none m-none">
        <!-- <label @click="setFocusOnInput" class="required">{{label}}</label> -->
        <input class="autocomplete-input input-box " @focusout="close" @keyup="change" maxlength="60" v-model="term" placeholder="{{label}}">

      </div>
      <ul v-if="showmenu" class="border list" id="autocomplitmenu">
        <li @click="select(item)" @mouseenter="menuin" @mouseleave="menuOut" class="hand" track-by="$index" v-for="item in results">
          <div class="border-top fx-row fx-start-center  ">
            <img :src="item[img]  " alt="logo" :class="{'img-circle' : endpoint !='/companies' && endpoint !='/schools'}" class="img-handler img-rounded size-32 m-t-sm m-b-sm" v-if="img">
            <div class="inline-block size-16" v-else></div>
            <span class="wrrap p-l-xs">{{{ name(item) }}}</span>
          </div>
        </li>
        <li @click="insert" @mouseenter="menuin" @mouseleave="menuOut" class="hand" v-if="insertable">
          <div class="border-top p-xs">
            <div class="inline-block size-16">
               <i class="material-icons">add</i>
            </div>
            <span class="wrrap p-l-xs capital" v-ii18n="addNew">addNew</span>
          </div>
        </li>
      </ul>
    </div>
    <div v-else>
      <div class="input-box  bg-white-smoke sticker fx-row fx-start-center">
        <img :src="selected ? selected[img]  : ''" alt="logo" :class="{'img-circle' : endpoint !='/companies' && endpoint !='/schools'}" class="img-handler img-rounded size-32 m-l-xs" v-if="img">
        <!-- <div class="size-32 inline-block" v-else></div> -->
        <span class="p-l-xs">{{{name(selected)}}}</span>
        <div @click="reset" class="hand p-xxs"><i class="material-icons">close</i></div>
      </div>
    </div>
  </div>
</template>

<script>
var connector = require('services/connect.js')

module.exports = {
  data: function () {
    return {
      term: '',
      selected: null,
      results: [],
      showme: false,
      clickOut: null,
      isOver: true
    }
  },
  computed: {
    showmenu: function () {
      return this.term.length > 0 && ((this.results.length > 0 && this.showme) || this.insertable)
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
      default: function (e) {
        return e ? e.name : 'undefined'
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
      default: function (e) {}
    }
  },
  created: function () {
    var that = this
    this.clickOut = function (event) {
      if ($(event.target).closest('#autocomplitmenu').length) return true
      that.close(null)
    }
    this.$watch('value', function (val) {
      if ((typeof val) == 'string') return
      this.selected = val
      this.showme = false
      this.term = ''
    })
    $('#autocomplitmenu').on('mouseenter', function () {
      that.isOver = true
      console.log('over')
    })
    $('#autocomplitmenu').on('mouseleave', function () {
      console.log('leave')
      that.isOver = false
    })
  },
  methods: {
    setFocusOnInput: function (event) {
      $(event.target).siblings('.autocomplete-input').focus()
    },
    menuOut: function () {
      this.isOver = true
    },
    menuin: function () {
      this.isOver = false
    },
    close: function (e) {
      var that = this
      if (this.isOver) {
        that.showme = false
        $(document).unbind('click', that.clickOut)
        if (that.free && !that.selected) that.value = that.term
        else that.term = ''
      }
    },
    select: function (item) {
      this.selected = item
      this.value = item
      this.showme = false
      this.term = this.name(item)
      this.$dispatch('selector:selected:item', item)
      $(document).unbind('click', this.clickOut)
    },
    reset: function () {
      this.showme = false
      this.value = null
      this.term = ''
      this.selected = null
    },
    change: function (e) {
      var that = this
      this.results = []
      if (e.keyCode == 27) {
        this.showme = false
        return
      }
      if (this.term.trim().length < 1 || !this.endpoint) {
        this.value = this.term
        this.showme = false
        return
      }
      connector.apiCall({
        limit: this.max || 10,
        term: this.term.toLowerCase().trim()
      }, this.endpoint, 'GET', function (error, data) {
        if (error) return (console.warn(error))
        if (data.length) {
          that.results = data
          that.showme = true
          $(document).bind('click', that.clickOut)
        } else {
          if (that.free && !that.selected) that.value = that.term
        }
        // console.log((that.results.length > 0 || that.insertable) && (that.showme || that.insertable))
      })
    }
  }
}

</script>
