<style lang="less" scoped>
.preloader-wrapper {
  position: absolute;
  position: absolute;
  margin: 6px 0;
  &.x-small{
    width: 30px;
    height: 30px;
  }
}
</style>

<template>

  <div class="preloader-wrapper active small" :class="size">
      <div class="spinner-layer" :class="'spinner-' + color + '-only'">
          <div class="circle-clipper left">
              <div class="circle"></div>
          </div>
          <div class="gap-patch">
              <div class="circle"></div>
          </div>
          <div class="circle-clipper right">
              <div class="circle"></div>
          </div>
      </div>
  </div>

</template>

<script>
module.exports = {
  props: {
    color: {
      type: String,
      default: 'green'
    },
    size: {
      type: String,
      default: 'small'
    }
  }
}
</script>
