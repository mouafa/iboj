
<template>

<div class="p-l-xs m-b-sm border-left brd-blue" v-if="showme">
    <div class="fx-row " v-for="item in comments">
        <img :src="item.profile.img  " class="img-circle m-xs size-24 fx" alt="logo">
        <section class="col-xs-11 p-none">

            <div class="fx-row fx-start-center">
                <h4 class="m-none">{{item.profile.firstname}} {{item.profile.lastname}}</h4>
                <span class="m-l-xs font-8">{{item.created_at  | moment "from" "now"}}</span></div>

            <p class="m-none">{{item.comment}}</p>
            <span v-if="item.profile.id === current.id" class="pull-right">
                <i @click="deleteComment(item)" class="fa fa-times hand m-xs"></i>
                <i @click="editComment(item)" class="pull-right fa fa-pencil hand m-xs"></i>
            </span>
        </section>
    </div>
    <div class="fx-row fx-start-center">
        <img :src="current.img  " class="img-circle m-xs size-32 fx" alt="logo">
        <div class="col-xs-9 p-none">
            <!-- <h4 class="m-none">{{current.name}}</h4> -->
            <textarea rows="1" class="form-control input-sm" maxlength="100" v-model="comment" name="comment" @keyup.enter="sendComment"></textarea>
        </div>
    </div>
</div>

</template>

<script>
var connector = require('services/connect.js')

module.exports = {
  data () {
    return {
      comments: [],
      comment: '',
      showme: false,
      editable: null
    }
  },
  props: {
    current: {
      type: Object,
      require: true
    },
    commentable: {
      type: Number,
      require: true
    }
  },
  methods: {
    editComment (item) {
      this.comment = item.comment
      this.editable = item.id
    },
    deleteComment (item) {
      var that = this
      connector.apiCall('', '/joboffers/' + this.commentable + '/comments/' + item.id, 'DELETE', function (error, response) {
        if (!error) {
          that.comments = response
        }
      })
    },
    loadComments () {
      this.showme = !this.showme
      if (!this.showme) return
      var that = this
      connector.apiCall('', '/joboffers/' + this.commentable + '/comments', 'GET', function (error, response) {
        if (error) return (console.warn(error))
        that.comments = response
      })
    },
    sendComment (e) {
      if (e.shiftKey) return
      var that = this

      var method = 'POST'
      var url = '/joboffers/' + this.commentable + '/comments'
      if (this.editable) {
        method = 'PUT'
        url += '/' + this.editable
        this.editable = null
      }
      connector.apiCall({
        comment: this.comment.replace(/\n$/, ' ')
      }, url, method, function (error, response) {
        if (error) return (console.warn(error))
        that.comments = response
      })
      this.comment = ''
    }
  }
}

</script>
