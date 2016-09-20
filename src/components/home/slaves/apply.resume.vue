<style lang="less">
</style>
<template>
    <div>
        <h5 class="capital font-1-5 p-t-sm p-b-lg">upload your resume (optional)</h5>
        <div class="row">
          <div class="col s8 offset-s2 m-b-lg">
             <h6 class="ont-light font-1-2 p-t-sm p-b-lg">You can also attach a cv or <a class="pointer" @click="uploadCv">Upload a new one</a></h6>
              <select class="browser-default" v-model="cv">
                 <option v-if="data.cv" value="{{item.url}}" v-for="item in data.cv">{{item.name}}</option>
              </select>
              <div v-if="error" class="empty-data m-t-lg  p-sm word-wrapper">
                <i class="material-icons md-18 red600">warning</i>
                <span class="text-danger capital font-9 m-l-sm">{{error}}</span>
              </div>
          </div>
        </div>
    </div>
</template>
<script>
import {isMine, profileAbout} from 'store/profile/getters.profile'
import {updateProfileCv, addProfileCv} from 'store/profile/actions.profile'
module.exports = {
  vuex: {
    actions: {
      updateProfileCv,
      addProfileCv
    },
    getters: {
      editmode: isMine,
      data: profileAbout
    }
  },
  data () {
    return {
      error: ''
    }
  },
  props: {
    cv: {
      twoWay: true
    }
  },
  methods: {
    uploadCv () {
      if (!this.editmode) return
      this.error = ''
      var vm = this
      window. photolia.openDialog(null, {
        crop: '300x300'
      })
      .done((file) => file.done((fileInfo) => vm.upload(fileInfo))
                          .fail((error, fileInfo) => vm.upload(null, error)))
    },
    upload (fileInfo, error) {
      if (fileInfo) {
        if (!this.testFileType(fileInfo)) this.error = 'This type of files is not allowed.'
        else if (fileInfo.size > 500 * 1024) this.error = 'File is too large.'
        else {
          let cv = {url: fileInfo.cdnUrl, name: fileInfo.name}
          this.addProfileCv(cv)
          this.updateProfileCv(this.data.cv)
        }
      }
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
