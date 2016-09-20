<style lang="less" scoped>
 @import '../../style/common/colors.less';
.down-menu {
    position: absolute;
    z-index: 100;
    list-style: none;
    min-width: 180px;
    li:first-child {
        border-top: 0;
    }
}
.drop-down{
    position: relative;
    display: inline-block;
}
.flesh {
      border-color: transparent;
      border-bottom-color: @border-color;
      border-style: dashed dashed solid;
      border-width: 0 8.5px 8.5px;
      position: absolute;
  }
</style>

<template>
  <div @click="showMeu" class="drop-down p-xxs hand font-1-2 bold" id="drop-down-{{id}}">
    <slot name="buttom">
      {{variable}}
      <i class="fa fa-angle-down"></i>
    </slot>
    <div class="flesh" v-show="listMe"></div>
    <ul class='border bg-white down-menu p-xxs m-none m-t-xs' v-show="listMe">
      <li @click="updateMe(op.value)" class="border-top p-xxs font-8" v-for="op in options">
        <i :class="op.icon" class="fa"></i>
        {{op.value}}</li>
    </ul>
  </div>
</template>

<script>
// var $ = window.jQuery = require('jquery')

module.exports = {
  data: function () {
    return {
      id: (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1),
      listMe: false,
      clickOut: null
    }
  },
  props: {
    variable: {
      type: String,
      twoWay: true
    },
    options: {
      type: Array,
      require: true
    },
    callback: {
      type: Function
    }
  },
  created: function () {
    var that = this
    this.clickOut = function (event) {
      if ($(event.target).closest('#drop-down-' + that.id).length) return true
      that.showMeu(null)
    }
  },
  methods: {
    showMeu: function () {
      this.listMe = !this.listMe
      if (this.listMe) $(document).bind('click', this.clickOut)
      else $(document).unbind('click', this.clickOut)
    },
    hideMenu: function () {
      this.listMe = false
    },
    updateMe: function (op) {
      this.variable = op
      if (this.callback) this.callback(op)
    }
  }
}

</script>
