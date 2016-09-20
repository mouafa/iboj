<style lang="less">
@import "../../style/common/colors.less";
.add-joboffer {
  form.form-container {
    padding: 50px 20px;
    position: relative;
    label {
      font-size: .8rem;
      font-weight: 300;
    }
    .form-head {
      position: absolute;
      top: 15px;
      left: 30px;
    }
    .dropDown{
      ul {
        width: 370px !important;
      }
    }
    pre{
        min-height: 90px;
    }
  }
  .collection-item {
    &:not(:last-child) {
      border-bottom: 1px @silver solid;
    }
  }
}
</style>

<template>

  <div class="page-container add-joboffer m-b-xl">
      <topnav></topnav>
      <div class="row main" class="wrapper">
          <!-- <div class=" col-md-2 p-r-xs ">
               <leftmenu></leftmenu>
          </div> -->
          <div class="job-panel job-details m-none p-t-lg to-animate fx-row row">
          <joboffer-steps class="col s3"></joboffer-steps>
                <section flex>
                  <router-view transition="fade" transition-mode="out-in"></router-view>
                </section>
          </div>
      </div>
      <bottomfooter></bottomfooter>
  </div>

</template>

<script>
// var leftmenu = require('shared/left_menu.vue')
var topnav = require('shared/top_nav.vue')
var bottomfooter = require('shared/footer.vue')
var jobofferSteps = require('./slaves/steps.menu.vue')

module.exports = {
  components: {
    // leftmenu: leftmenu,
    bottomfooter: bottomfooter,
    topnav: topnav,
    jobofferSteps: jobofferSteps
  }
}

</script>
