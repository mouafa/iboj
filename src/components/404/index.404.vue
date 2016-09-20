<style lang="less" scoped>
@import "../../style/common/colors.less";
.i404-container {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  // background: #f7f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  bottom: 0;
}
.i404{
// padding-top: 80px;
  .symbol {
      color: @color-text-light;
      font-size: 62px;
  }
  h2 {
    font-size: 18rem;
    line-height: 14rem;
    font-weight: lighter;
  }
  p {
    font-size: 4rem;
    // line-height: 10rem;
    color: @color-text-light;
  }
  a {
    margin-top: 30px
  }
  img {
    width: 500px;
  }
}
</style>

<template>
  <div class="page-container fx-col">
    <topnav></topnav>
    <div class="row main i404-container fx-col fx-center-center" flex>
      <div class="i404"><section class="fx-col fx-start-center" flex>
        <!-- <i class="fa fa-exclamation-circle symbol"></i> -->
        <!-- <h2 class="m-none capital" v-ii18n="">404</h2> -->
        <img class="logo w-xs" src="../../assets/404.png" /></a>
        <!-- <p class="m-none capital" v-ii18n="">Nothing here!</p> -->
        <a href="/" class="m-r-sm font-light btn btn-info font-8 uppercase btn-lg">GO HOME</a>

      </section></div>
    </div>
  <bottomfooter></bottomfooter>
  </div>
</template>

<script>
var topnav = require('shared/top_nav.vue')
var bottomfooter = require('shared/footer.vue')
module.exports = {
  components: {
    topnav,
    bottomfooter
  }
}
</script>
