<style lang="less" scoped>
.img-circle{
 border-radius: 30%;
}
</style>

<template>
    <div class="m-t-md m-b-md ">
      <section class="p-sm row">
          <div class="fx-row p-none m-none p-b-sm fx-start-start col s10 offset-s1">
            <div @click="uploadImage" :class="{'progres' : loading}" class="uploader m-r-sm" title="change profile image">
              <img :src="avatar  "  class="user-image circle size-64" alt="profile image">
            </div>
              <span class="font-light font-1-5 m-t-md text-grey font-uppercase ">{{profile.name}}</span>
          </div>
        </section>
        <section class=" capital p-r-md">

              <div class="row p-none m-none p-l-md">
                 <input class="input-box" placeholder="Title" id="title" maxlength="50" v-model="title">
                 <span class="m-b-sm font-8 text-warning pull-right">{{remainChars(title, 50)}}</span>
             </div>

               <div class="row p-none m-none p-l-md">
                 <textarea class="input-box" id="about" maxlength="240" placeholder="About You" v-model="about | substring 240"></textarea>
                 <span class="m-b-sm font-8 text-warning pull-right">{{remainChars(about, 240)}}</span>
               </div>

        </section>
    </div>
</template>

<script>
var connect = require('../../services/connect.js')
module.exports = {
  data () {
    return {
      profile: require('services/profile.js'),
      avatar: null,
      title: '',
      about: '',
      loading: false
    }
  },
  ready () {
    let vm = this
    $(function () {
      var x = $('.main-body').height()
      $('.left-container').height(x)
    })
    this.profile.loadAsync()
    .then(() => {
      vm.avatar = vm.profile.img
      vm.title = vm.profile.title
      vm.about = vm.profile.about
    }, (err) => console.warn(err))
  },
  methods: {
    uploadImage () {
      let vm = this
       vm.loading = true
      window. photolia.openDialog(null, {
        imagesOnly: true,
        crop: '300x300'
      }).done((file) => {
        file.done(vm.changeImage)
            .fail((error) => {
              console.error('image upload failed', error)
            })
      }).fail(() => (vm.loading = false))
    },
    changeImage (_fileInfo_) {
      let vm = this
      connect.apiCall({
        img: _fileInfo_.cdnUrl
      }, '/profile', 'PUT', (error, record) => {
        if (error) console.error('Error Saving image... ', error)
        else vm.avatar = record.img
        vm.loading = false
      })
    },
    save () {
      let vm = this
      return new Promise((resolve, reject) => {
        connect.apiCall({
          about: vm.about,
          title: vm.title
        }, '/profile', 'PUT', (error, data) => {
          if (error) reject(error)
          else resolve()
        })
      })
    },
    next () {
      let vm = this
      return new Promise((resolve, reject) => {
        vm.save().then((res) => resolve(), (err) => reject(console.warn(err)))
      })
    },
    remainChars (field, maxlength) {
      if (field && field.length) {
        if (field.length > maxlength) return 0
        return (maxlength - field.split('\n').join('  ').length)
      } else return maxlength
    }
  }
}

</script>
