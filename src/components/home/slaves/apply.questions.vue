<style lang="less">
</style>
<template>
    <div class="p-none m-none">
        <h6 class="capital m-t-lg break-word font-light font-1-2 border-bottom p-b-sm">{{question.subject}}</h6>
        <div v-if="question.type=='Y/N'">
            <div>
                  <p>
                    <input class="with-gap" type="radio" id="yes-{{_index}}" value="Yes" v-model="answer" name="inpt-{{_index}}"/>
                    <label for="yes-{{_index}}" v-ii18n="yes">yes</label>
                  </p>
                  <p>
                    <input class="with-gap" type="radio" id="no-{{_index}}" value="No" v-model="answer" name="inpt-{{_index}}" />
                    <label for="no-{{_index}}" v-ii18n="no">no</label>
                  </p>
            </div>
        </div>
        <div v-if="question.type=='Free'">
           <div class="row">
               <form class="col s12">
                <div class="row">
                  <div class="input-field col s12">
                     <label for="textarea1" class="capital font-light font-1-2 required">Question Response</label>
                     <textarea id="textarea1" class="materialize-textarea" v-model="answer | substring 240" maxlength="240"></textarea>
                  </div>
                  <div class=" font-8 text-warning pull-right">{{remainChars}}</div>
                 </div>
             </form>
           </div>
        </div>
    </div>
</template>
<script>
module.exports = {
  data () {
    return {
      preview: false
    }
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    answer: {
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  computed: {
    remainChars () {
      if (this.answer && this.answer.length) {
        if (this.answer.length > 240) return 0
        return (240 - this.answer.split('\n').join('  ').length)
      } else return 240
    }
  }
}

</script>
