<template>
<section>
  <div v-if="editmode" class="hpanel profile-panel">
    <confirm></confirm>
    <div class="panel-body border m-b-xs p-xs p-r-sm p-l-xs center row">
      <div class="col s6 offset-s3">
         <span @click="uploadCv" class="hand m-t-sm font-9">
          <i class="material-icons orange600">&#xE2C3;</i>
          <span class="capital">upload CV</span>
        </span>
      </div>
       <div v-if="cvList && cvList.length" v-for="item in cvList" class="empty-data m-t-lg  p-sm word-wrapper">
        <a href="{{item.url}}-/inline/yes/"  target="_blank"><span class="m-l-lg hand">{{item.name}}</span></a>
        <span @click="deleteCv(item)" class="hand pull-right"><i class="material-icons m-l-lg ">&#xE872;</i></span>
      </div>
      <div v-if="error" class="empty-data m-t-lg  p-sm word-wrapper">
        <i class="material-icons md-18 red600">warning</i>
        <span class="text-danger capital font-9 m-l-sm">{{error}}</span>
      </div>
    </div>
  </div>

</section>
</template>
<script>
import {isMine} from 'store/profile/getters.profile'
import {updateProfileCv, addProfileCv, deleteProfileCv} from 'store/profile/actions.profile'
var confirm = require('shared/popup.confirm.vue')
var bus = require('services/bus')
module.exports = {
  vuex: {
    actions: {
      updateProfileCv,
      addProfileCv,
      deleteProfileCv
    },
    getters: {
      editmode: isMine,
      cvList: (state) => state.profile.data.about.cv || []
    }
  },
  data () {
    return {
      error: ''
    }
  },
  components: {
    confirm
  },
  ready () {
    var vm = this
    bus.$on('deleteCv:callback', function (status, cv) {
      if (status) {
        vm.deleteProfileCv(cv)
        vm.updateProfileCv(vm.cvList)
      }
    })
  },
  methods: {
    uploadCv () {
      if (!this.editmode) return
      this.error = ''
      var vm = this
      window.photolia.openDialog(null, {
        crop: '300x300'
      })
      .done((file) => file.done((fileInfo) => vm.upload(fileInfo))
                          .fail((error, fileInfo) => vm.upload(null, error)))
    },
    upload (fileInfo, error) {
      this.cvs = this.cvList
      if (fileInfo) {
        if (!this.testFileType(fileInfo)) this.error = 'This type of files is not allowed.'
        else if (fileInfo.size > 500 * 1024) this.error = 'File is too large.'
        else {
          let newCv = {url: fileInfo.cdnUrl, name: fileInfo.name}
          this.addProfileCv(newCv)
          this.updateProfileCv(this.cvList)
        }
      }
    },
    deleteCv (cv) {
      bus.$emit('confirm:open', 'Delete CV', 'Are you sure to delete this cv', 'confirm', 'deleteCv', cv)
    },
    testFileType (fileInfo) {
      var extension = fileInfo.name.split('.').pop()
      var types = ['pdf', 'docx', 'doc']
      if (types.indexOf(extension) >= 0) return true
      else return false
    }
  }
}

</script>
