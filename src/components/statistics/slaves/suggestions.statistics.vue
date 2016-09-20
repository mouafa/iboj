<style lang="less" scoped>
.latest-messages-container {
  min-height: 425px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  .section-title {
    margin: 0;
    padding: 10px 0 15px 0;
    color: #666;
    font-size: 1.2em;
    text-align: center;
  }
  .coming-soon-container {
    margin: auto;
    text-align: center;
    p {
      padding-top: 75px;
      font-size: 1.8em;
      font-weight: 300;
    }
  }
}
</style>

<template>
<section id="suggestions-block">
  <div class="latest-messages-container">
    <p class="section-title">Suggestions</p>
    <div class="coming-soon-container">
      <p>Coming Soon</p>
    </div>
  </div>
</section>
</template>

<script>
module.exports = {
  props: ['applicant'],
  ready () {
    let vm = this
    if (vm.applicant === 'true') window.$('#suggestions-block').css('height', '873px')
    else window.$('#suggestions-block').css('height', '425px')
  }
}
</script>
