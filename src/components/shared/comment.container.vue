<style lang="less" scoped >
@grey: #D8D8D8;
@dark-grey: #acb4c2;

.comments {

  .comment-wrap {
    background: rgba(247,247,247,0.76);
    background: linear-gradient(to right, rgba(247,247,247,0.76) 0%, rgba(247,247,247,0.76) 6%, rgba(246,246,246,0.55) 53%, rgba(255,255,255,0.34) 100%);
    padding-left: 10px;
    padding-right: 10px;
    // margin-bottom: 1.2rem;
    width: 100%;
    min-height: 5rem;
    &:hover {
      .comment-action {
        opacity: 1
      }
    }
    &:not(:last-child) {
      border-bottom: @grey 1px solid;
    }
    &:not(:first-child) {
      margin-top: 4px;
    }
  }

  .avatar {
    border-radius: 50%;
    transform: none;
  }

  .comment-block {
    padding: 0 1rem;
  }

  .comment-meta {
    color: @dark-grey;
  }
  .comment-header{
    margin-bottom: 4px;
  }

  .commenter-name{
    font-weight: 500;
    font-size: .8rem
  }

  .comment-text {
    font-size: .9rem;
  }

  .comment-action{
    opacity: .5;
    transition: 100ms;
    // padding-top: .4rem;
    // padding-bottom: .4rem;
    // padding-bottom: 1rem;
  }

  .materialize-textarea{
    min-height: 1.4rem;
    height: 1rem;
    padding: 0;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .comment-btn{
    text-align: center;
    padding: 0;
    cursor: pointer;
    background: none;
    outline: none;
    border: @dark-grey 1px solid;
    font-size: .8rem;
    transition: 100ms;
    font-weight: 400;
    span {
      line-height: 28px;
      padding: 0 .4rem;
      display: inline-block;
    }
    .-count{
      border-left: @grey 1px solid;
      background-color: white;
    }
    &:hover, &.active{
      background-color: @grey;
    }
  }

  .comment-input{
    outline: none;
    resize: none;
    display: block;
    width: 100%;
    padding: 6px 12px;
    font-size: 14px;
    line-height: 1.42857143;
    border: 1px solid @grey;
    border-radius: 4px;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
    transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
  }

  .load-more{
    background-color: @grey;
    transition: 100ms;
    &:hover {
      background-color: @dark-grey;
    }
    // i { color: white !important}
  }
}

</style>

<template>

  <section>
    <h6 class=" p-l-lg m-t-md  font-1-2 font-uppercase font-light capital">comments</h6>
    <div class="comments bg-white">
      <div class="comment-wrap fx-row p-t-sm" track-by="$index" v-for="comment in comments | orderBy 'created_at' -1">
        <div>
          <img :src="comment.profile.img  " alt="profile image" class="avatar user-image m-xs size-48">
        </div>
        <section class="comment-block p-t-sm" flex>
          <div class="comment-header fx-row fx-space-between-center">
            <a :href="'profile.html#!/' + comment.profile.uuid">
              <span class="commenter-name">{{comment.profile.firstname}}
                {{comment.profile.lastname}}</span>
            </a>
            <span class="comment-meta" v-from-now="comment.created_at"></span>
          </div>

          <div class="m-t-xxs" flex v-if="!comment.isEdit">
            <p class="comment-text m-none m-b-xxs">{{comment.comment}}</p>
            <div class="comment-footer m-b-md m-t-sm fx-row fx-space-between-center">
              <div>
                <button :disabled="disableVote" v-if="user.id != comment.profile_id" @click="vote(comment)" :class="{'active' : comment.voted_by_me}" class="comment-btn">
                  <span>Upvote</span>
                  <span class="-count text-orange">{{comment.vote ? comment.vote : 0 }}</span>
                </button>
              </div>
              <div class="comment-action" v-if="user.id == comment.profile_id">
                <span @click="editComment(comment)" class="m-r-xs pointer" v-if="user.id == comment.profile_id">Edit</span>
                <span @click="deleteComment(comment)" class="pointer">Delete</span>
              </div>
            </div>
          </div>

          <div flex v-else>
            <form @submit.prevent="putComment(comment)">
              <div class="input-field m-none">
                <textarea :disabled="isDisable" class="comment-input m-none" id="comment-edit" placeholder="Add your comment" v-model="commentEdit"></textarea>
              </div>
              <div class="fx-row fx-end-center">
                <span @click="editComment()" class="pointer m-r-sm">Cancel</span>
                <button :disabled="isDisable" type="submit" class="comment-btn m-t-sm m-b-sm p-r-xs p-l-xs">
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>

      <div v-if="canLoadMore" @click="loadMore" class="load-more fx-row fx-center-center pointer">
        <!-- <i class="material-icons md-18 blue600">more_horiz</i> -->
        <span class="font-1 p-xxs capital">load more comments</span>
      </div>

      <div class="comment-wrap fx-row">
        <!-- <div>
          <img :src="user.img  " alt="profile image" class="avatar user-image m-xs size-48">
        </div> -->
        <div class="comment-block p-t-md" flex>
          <form @submit.prevent="postComment">
            <div class="input-field m-none">
              <textarea :disabled="isDisable" @keydown.esc.prevent="postComment" class="comment-input m-none" id="comment-input" placeholder="Add your comment" v-model="commentText"></textarea>
            </div>
            <button :disabled="isDisable" type="submit" class="comment-btn pull-right m-t-sm m-b-sm p-r-xs p-l-xs">
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

    </div>

  </section>

</template>

<script>
var connect = require('services/connect.js')
import {accountData} from 'store/account/getters.account'
require('flex-text')
var $ = window.jQuery

module.exports = {
  vuex: {
    getters: {
      user: accountData
    }
  },
  props: {
    for: {
      type: String,
      // required: true,
      default: 'joboffers'
    },
    id: {
      type: Number
      // required: true
    }
  },
  data () {
    return {
      comments: [],
      commentText: '',
      currentCommentEdit: null,
      commentEdit: '',
      isDisable: false,
      disableVote: false,
      total: null
    }
  },
  computed: {
    url () {
      if (!this.id) return null
      return `/${this.for}/${this.id}/comments`
    },
    canLoadMore () {
      if (!this.comments || !this.comments.length || !this.total) return false
      return (this.total > this.comments.length)
    }
  },
  ready () {
    $('#comment-input').flexText()
    this.$watch('url', function (val) {
     if (val) this.getComment()
    })
  },
  methods: {
    getComment (limit) {
      var vm = this
      var data = { limit }
      connect.apiAsync('GET', this.url, data)
      .then((res) => {
        vm.comments = res.results.map(i => Object.assign(i, { isEdit: false }))
        vm.total = Number(res.total)
      })
      .catch((err) => { console.warn(err) })
    },
    editComment (comment) {
      if (this.currentCommentEdit) this.currentCommentEdit.isEdit = false
      if (comment) {
        comment.isEdit = true
        this.commentEdit = comment.comment
        this.currentCommentEdit = comment
        // console.log('comment', comment.comment)
        Vue.nextTick(function () {
          $('#comment-edit').flexText()
        })
      }
    },
    postComment () {
      var vm = this
      var data = { comment: vm.commentText }
      var backup = vm.commentText
      vm.commentText = ''
      vm.isDisable = true
      connect.apiAsync('POST', this.url, data)
      .then((res) => {
        vm.isDisable = false
        vm.getComment(vm.comments.length + 1)
        $('#comment-input').flexText()
      })
      .catch((err) => {
        vm.isDisable = false
        vm.commentText = backup
        console.warn(err)
      })
    },
    putComment (comment) {
      var vm = this
      var data = { comment: vm.commentEdit }
      vm.isDisable = true
      connect.apiAsync('PUT', this.url + '/' + comment.id, data)
      .then((res) => {
        vm.isDisable = false
        vm.getComment(vm.comments.length)
        vm.commentEdit = ''
        vm.currentCommentEdit.isEdit = false
        $('#comment-edit').flexText()
      })
      .catch((err) => {
        vm.isDisable = false
        console.warn(err)
      })
    },
    deleteComment (comment) {
      var vm = this
      connect.apiAsync('DELETE', this.url + '/' + comment.id)
      .then((res) => {
        // vm.comments.$remove(comment)
        vm.getComment(vm.comments.length - 1)
      })
      .catch((err) => { console.warn(err) })
    },
    vote (comment) {
      var vm = this
      vm.disableVote = true
      connect.apiAsync('POST', this.url + '/' + comment.id + '/vote')
      .then((res) => {
        vm.disableVote = false
        if (comment.voted_by_me) {
            comment.vote --
            comment.voted_by_me = false
        } else {
          comment.vote ? comment.vote++ : comment.vote = 1
          comment.voted_by_me = true
        }
      })
      .catch((err) => {
        vm.disableVote = false
        console.warn(err)
      })
    },
    loadMore () {
      if (this.total > this.comments.length) this.getComment(this.comments.length + 10)
    }
  }
}
</script>
