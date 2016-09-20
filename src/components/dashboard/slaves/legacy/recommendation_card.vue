<style lang="less" scoped>
  
  .down-menu {
    position: absolute;
    z-index: 100;
    list-style: none;
    min-width: 140px;
    li:first-child {
      border-top: 0;
    }
  }
</style>

<template>
    <div class="border hpanel m-xxs">
        <div class="card-info m-xs">
            <span class="pull-right hand" @click="showInfo"><i class="fa fa-info-circle"></i></span>
            <div class="fx-row fx-start-center">
                <img :src="data.target.img  " class="img-circle m-xs size-32 fx user-image" alt="logo" title="{{data.target.firstname}} {{data.target.lastname}}">
                <div class="font-light word-wrapper">
                    <span class="text-dot w-sm">{{name}}</span>
                    <br>
                    <span class="font-8 text-dot w-sm">{{data.target.title}}</span>
                </div>
            </div>
            <status :recommendation="data"></status>
        </div>
    </div>
</template>

<script>
  var status = require('shared/dropdown.status.vue')
  var bus = require('services/bus.js')
  module.exports = {
    components: {
      status: status
    },
    data () {
      return {
        listMe: false,
        clickOut: null
      }
    },
    props: {
      data: {
        type: Object,
        require: true
      }
    },
    computed: {
      name () {
        return this.data.target.id ? this.data.target.firstname + ' ' + this.data.target.lastname : this.data.email
      }
    },
    created () {
      var that = this
      this.clickOut = function (event) {
        if ($(event.target).closest('#menu-' + that.data.id).length) return true
        that.showmenu(null)
      }
    },
    methods: {
      showmenu () {
        this.listMe = !this.listMe
        if (this.listMe) $(document).bind('click', this.clickOut)
        else $(document).unbind('click', this.clickOut)
      },
      showInfo () {
        bus.$emit('dashboard:recommendations:showinfo', this.data.joboffer_id, this.data.id)
      }
    }
  }
</script>
