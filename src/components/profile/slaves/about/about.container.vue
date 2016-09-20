<style lang="less" scoped>

.profile-panel {
    .btn-link:hover,
    .btn-link:focus,
    .btn-link:active,
    .btn-link.active,
    .open .dropdown-toggle.btn-link {
        color: #FFF;
    }
    .defaultDescription {
        font-style: italic;
        color: #AAA;
    }
    .error {
        height: 20px;
    }
}

</style>

<template>
<div class="m-none p-none">
  <about-modal v-ref:modal-about></about-modal>
  <div class="m-none p-none m-l-xs" >
    <div class="hpanel profile-panel m-none p-none" id="custom-1">
      <div class="panel-body m-none p-none">


        <section class="p-sm">
          <span v-if="editmode" @click="editAbout"  type="button" class="p-r-xs hand right"  name="editabout">
              <i class="material-icons md-14">&#xE254;</i>
          </span>
          <div class="fx-row p-b-sm fx-start-start">
            <div @click="uploadImage" :class="{'uploader': editmode, 'progres' : loading}" class="m-r-sm">
              <img :src="data.img  " class="user-image circle size-64" alt="logo">
            </div>

            <div flex>
              <span class="font-1-2  font-uppercase ">{{data.fullname}}</span>
              <div class="font-9 m-t-xs  font-light">{{data.title}}</div>
            </div>
          </div>
          <div class="font-1 font-light word-wrapper">
            <div v-if="editmode && !data.about" class="empty-data" >
            You may provide here more information about you
            </div>
            {{{data.about}}}
          </div>
        </section>
      </div>
    </div>
  </div>
<div>
</template>

<script>
var aboutModal = require('./about.modal.vue')
import {isMine, profileAbout} from 'store/profile/getters.profile'
import {setProfileImg} from 'store/profile/actions.profile'

module.exports = {
  vuex: {
    actions: {
      setProfileImg
    },
    getters: {
      editmode: isMine,
      data: profileAbout
    }
  },
  data: function () {
    return {
      editAboutModal: false,
      loading: false
    }
  },
  components: {
    aboutModal
  },
  computed: {
    isReady () {
      if (this.data && this.data.fullname) return true
      else return false
    }
  },
  methods: {
    editAbout () {
      this.$refs.modalAbout.show(this.data)
    },
    uploadImage () {
      if (!this.editmode) return
      var vm = this
      vm.loading = true
      window.photolia.openDialog(null, {
        imagesOnly: true,
        crop: '300x300'
      })
      .done((file) => file.done((fileInfo) => vm.upload(fileInfo))
                          .fail((error, fileInfo) => vm.upload(null, error)))
      .fail(() => (vm.loading = false))
    },
    upload (fileInfo, error) {
      let vm = this
      if (fileInfo) vm.setProfileImg(fileInfo.cdnUrl)
      else console.warn(error)
      vm.loading = false
    }
  }
}

</script>
