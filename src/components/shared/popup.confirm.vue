<style lang="less" scoped>
@import '../../style/common/colors.less';
.modal-mask {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  transition: opacity .3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-container {
  width: 500px;
  padding: 0;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  border-radius: 8px 8px;
}

.modal-header {
  border-radius: 8px 8px 0 0;
}

.modal-body {
  margin: 0;
  max-height: 600px;
  overflow: hidden;
  padding-bottom: 15px;
}
.modal-default-button {
  float: right;
}

.modal-footer{
    height: 40px;
    background-color: @color-dark-grey ;
}
.modal-enter, .modal-leave {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>

<template>
  <div class="modal-mask" transition="modal" v-show="showme">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-header p-xs">
          <i class=" material-icons m-r-sm">{{config[type || 'confirm'].icon}}</i>
          {{title || type}}
        </div>
        <div class="modal-body p-sm">
          <p>
            {{{msg}}}
          </p>
        </div>

        <div class="modal-footer">
          <div class="pull-right p-xxs">
             <a v-if="type=='confirm'" name="cancel" @click="cancel" class="font-light btn-flat text-white hand uppercase">cancel</a>
             <a @click="accept" name="ok"  class="font-light btn btn-success m-l-md ">OK</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
var bus = require('services/bus.js')
module.exports = {
  data () {
    return {
      error: '',
      showme: false,
      type: '',
      title: '',
      msg: '',
      obj: null,
      config: {
        'confirm': {
          icon: 'report_problem',
          color: 'warning'
        },
        'info': {
          icon: 'error',
          color: 'blue'
        },
        'alert': {
          icon: 'highlight_off',
          color: 'red'
        },
        'help': {
          icon: 'help',
          color: 'violet'
        }
      }
    }
  },
  ready () {
    bus.$on('confirm:open', this.open)
  },
  destroyed () {
    bus.$off('confirm:open')
  },
  methods: {
    open (title, msg, type, name, obj) {
      this.name = name
      this.type = type || 'info'
      this.title = title || 'Information'
      this.msg = msg || ''
      this.obj = obj
      this.showme = true
    },
    cancel () {
      bus.$emit(this.name + ':callback', false, this.obj)
      this.showme = false
    },
    accept () {
      bus.$emit(this.name + ':callback', true, this.obj)
      this.showme = false
    }
  }
}

</script>
