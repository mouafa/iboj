<style lang="less" scoped >

@import '../../style/common/colors.less';
.modal-mask {
    position: fixed;
    z-index: 1000;
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
    padding: 0;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
}

.modal-header h3 {
    margin-top: 0;
}

.modal-body {
    margin: 0;
    max-height: 600px;
    min-height: 200px;
    overflow: auto;
    padding-bottom: 15px;
}

.modal-default-button {
    float: right;
}

.modal-footer {
    height: 50px;
    background-color: @color-dark-grey ;
}

.modal-enter,
.modal-leave {
    opacity: 0;
}

.modal-enter .modal-container,
.modal-leave .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
}

</style>

<template>

<!-- <div  v-if="show"> -->
<div class="modal-mask" v-show="show" transition="modal">
  <div class="modal-wrapper">
    <div class="modal-container" :style="'width:' + width + 'px;'">

      <div class="modal-header">
        <slot name="header"></slot>
      </div>

      <div class="modal-body">
        <slot name="body"></slot>
      </div>

      <div class="modal-footer" v-if="withFooter">
        <slot name="footer"></slot>
      </div>

    </div>
  </div>
</div>
<!-- </div> -->

</template>

<script>
module.exports = {
  props: {
    show: {
      type: Boolean,
      // required: true,
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
}
</script>
