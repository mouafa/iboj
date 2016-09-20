<style lang="less" scoped>
 @import '../../../style/common/colors.less';
.line-style {
    border-bottom: 2px dashed @border-color;
    display: inline-block;
}
</style>
<template>
    <modal :show.sync="showModal" v-if="currentItem">
        <div class="p-sm panel-heading capital" slot="header">
            <i class="fa fa-info-circle m-r-sm"></i> <span>Recommendation info</span>
        </div>
        <div class="p-l-sm p-r-sm m-b-md" slot="body">
            <!-- <p class="text-danger m-b-xs error" v-if="error">
                <span>{{error}}</span>
            </p> -->
            <div class="fx-row fx-center-center">
                <div class="center m-xs">
                    <img :src="currentItem.origin.img  " class=" user-image img-circle m-xs size-32 fx" alt="logo">
                    <span></span>
                </div>
                <div class="m-xs fx-row fx-start-center">
                    <div class="w-xxs line-style"></div>
                    <img src="../../../assets/recommendation.png" class="img-circle m-xs size-32 fx border">
                    <div class="w-xxs line-style"></div>
                </div>
                <div class="m-xs center">
                    <img :src="currentItem.target.img  " class=" user-image img-circle m-xs size-32 fx" alt="logo">
                </div>
            </div>
            <div v-if="currentItem.responses && currentItem.responses.length > 0" class="m-t-sm">
                <h4 class="p-none m-none m-b-xs capital" v-ii18n="quiz">Quiz</h4>
                <div class="border-top p-t-xs" v-for="response in currentItem.responses">
                    <span> - {{response.question.subject}}</span>
                    <br>
                    <span><img :src="currentItem.origin.img  " class=" user-image img-circle m-xs size-16 fx" alt="logo">{{response.content}}</span>
                </div>
            </div>
            <div class="m-t-sm">
                <h4 class="p-none m-none m-b-xs capital">Comment</h4>
                <i class="pull-right fa fa-pencil hand m-xs" @click="editLog" v-if="!editable && log"></i>
                <div class="h-max-250 p-none border-top p-t-xs" v-if="!editable && log">
                    <p style="white-space: pre-line">{{log}}</p>
                </div>
                <div class="fx-row " v-if="editable || !log">
                    <div class="col-xs-12 p-none">
                        <textarea rows="5" class="form-control input-sm" v-model="log" name="comment" maxlength="240" @keyup.enter="sendComment"></textarea>
                        <div class=" font-8 text-warning pull-right">{{remainChars}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div slot="footer" class="m-r-md m-t-sm row p-xs ">
            <div class="pull-right">
                <button @click="close" :class="{ 'disabled': isLoading }" class="w-xs font-light btn btn-success m-l-md font-8 uppercase" name="close" v-ii18n="ok">Ok</button>
            </div>
        </div>
    </modal>
</template>
<script>
var connector = require('services/connect.js')
var modal = require('shared/modal.vue')
var bus = require('services/bus.js')
module.exports = {
  data () {
    return {
      showModal: false,
      currentItem: null,
      editable: false,
      log: ''
    }
  },
  components: {
    modal: modal
  },
  ready () {
    bus.$on('dashboard:recommendations:showinfo', this.show)
  },
  computed: {
    remainChars () {
      if (this.log && this.log.length) {
        if (this.log.length > 240) return 0
        return (240 - this.log.split('\n').join('  ').length)
      } else return 240
    }
  },
  methods: {
    close () {
      this.showModal = false
      this.log = ''
      this.currentItem = null
      this.editable = false
    },
    show (job, rec) {
      var that = this
      connector.apiCall('', '/dashboard/joboffers/' + job + '/recommendations/' + rec, 'GET', function (error, response) {
        if (!error) {
          that.currentItem = response
          that.log = response.commentable[0] ? response.commentable[0].comment : ''
          that.showModal = true
        }
      })
    },
    editLog () {
      this.editable = true
    },
    sendComment (e) {
      if (e.shiftKey) return
      this.editable = false
      connector.apiCall({
        comment: this.log
      }, '/dashboard/joboffers/' + this.currentItem.joboffer_id + '/recommendations/' + this.currentItem.id + '/comment', 'POST', function (error, response) {
        if (!error) {

        }
      })
    }
  }
}
</script>
