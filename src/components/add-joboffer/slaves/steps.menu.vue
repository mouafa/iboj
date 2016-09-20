<style lang="less" scoped>
@import "../../../style/common/colors.less";

// .active-state {
//     border: 1px solid @color-green!important;
//     z-index: 1;
//     label {
//         border: solid 1px @color-green!important;
//         background-color: @color-green!important;
//         color: white;
//     }
//     span {
//         color: @color-green!important;
//     }
// }

.btn-nav {
   height: 50px;
   width: 100%;
   background-color: white;
   margin-bottom: 10px;
   text-transform: uppercase;
  font-size: .8rem;
  opacity: .8;
  &.active-state {
    opacity: 1;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.02),0 1px 5px 0 rgba(0,0,0,0.12);
  }
   label{
     width: 32px;
     height: 32px;
     border-radius: 50%;
     display: inline-block;
     vertical-align: middle;
     line-height: 32px;
     text-align: center;
     background-color: #DDD;
     margin: 0 10px;
     color: white;
     font-size: 1rem;
     &.active-state {
       background-color: @morning-glory;
     }
   }
}

.done-state {
    border: solid 1px @color-green;
    color: @color-green .5;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.02),0 1px 5px 0 rgba(0,0,0,0.12);
}

</style>
<template>
    <div class="font-light fx-col">
        <div @click="navigate(1)" class="btn-nav fx-row fx-start-center pointer" :class="{'active-state': step==1}" id="step-info">
            <label :class="{'active-state': step>0}">1</label>
            <span class="text-light" v-ii18n="jobDetails">general info</span>
        </div>
        <div @click="navigate(2)" class="btn-nav  fx-row fx-start-center pointer" :class="{'active-state': step==2}" id="step-description">
          <label :class="{'active-state': step>1}">2</label>
          <span class="text-light" v-ii18n="">details</span>
        </div>
        <div @click="navigate(3)" class="btn-nav  fx-row fx-start-center pointer" :class="{'active-state': step==3}" id="step-quizbuilder">
            <label :class="{'active-state': step>2}">3</label>
            <span class="text-light" v-ii18n="quizBuilder">quiz builder</span>
        </div>
    </div>
</template>
<script>
module.exports = {
  computed: {
    step () {
      return this.$route.stepId
    }
  },
  methods: {
    navigate (i) {
      var nav = ['job-info', 'job-description', 'job-quizbuilder']
      var jobId = this.$route.params.jobId
      if (!jobId) return
      this.$router.go({name: nav[i - 1], params: {jobId}})
    }
  }
}

</script>
