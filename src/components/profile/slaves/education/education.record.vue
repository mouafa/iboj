<template>
  <section>
    <div class="cd-timeline-block p-none m-none p-l-sm m-b-md">
      <div @click="uploadImage" :class="{'uploader' : editmode, 'progres' : loading}" class="cd-timeline-img size-64 school-logo" title="change Logo">
        <img :src="logo  " class="size-64"  alt="school logo"/>
      </div>
      <!-- cd-timeline-img -->
      <div class="cd-timeline-content m-none">
        <div class="p-xs word-wrapper">
          <span v-if="editmode" @click="editEducation" class="--edit-delete-menu hand"><i class="material-icons">&#xE254;</i></span>
          <div class="font-9 font-light text-light">
            <span class="capital">{{record.since | moment "MMMM YYYY" }}</span>
            <span class="m-xs">-</span>
            <span class="capital" v-if="record.until">{{record.until | moment "MMMM YYYY" }}</span>
            <span v-else>until now</span>

          </div>
          <div class="font-9 m-t-xs capital">
            <h6 class="text-light font-1 m-none">{{record.school.name}}</h6>
            <h5 class="font-1-2 m-t-sm">{{record.degree.name}}</h5>
          </div>
          <p class="font-8 font-light m-t-xs">{{{record.description | lineBreak}}}</p>
          <div class="m-t-sm break-word">
             <div track-by="$index" v-for="item in record.skills" class="chip font-8 m-l-xs m-b-sm">{{item.name || item}}</div>
          </div>
        </div>
        <!-- cd-timeline-content -->
      </div>
      <!-- cd-timeline-block -->
    </div>
  </section>
</template>
<script>
var schoolImg = require('assets/diploma.png')
import {isMine} from 'store/profile/getters.profile'

import {setSchoolImg, setActiveEdu} from 'store/profile/actions.profile'

module.exports = {
  vuex: {
    actions: {
      setSchoolImg,
      setActiveEdu
    },
    getters: {
      editmode: isMine
    }
  },
  props: {
    record: {
      type: Object,
      require: true
    }
  },
  data () {
    return { loading: false }
  },
  computed: {
    logo () {
      return this.record.img || this.record.school.logo || schoolImg
    },
    tags: function () {
      return (this.record && this.record.skills) ? this.record.skills.split(',') : []
    }
  },
  methods: {
    editEducation: function () {
      this.setActiveEdu(this.record)
      this.$dispatch('education_record:edit', this.record)
    },
    uploadImage () {
      if (!this.editmode) return
      let vm = this
      vm.loading = true
      window. photolia.openDialog(null, {
        imagesOnly: true,
        crop: '300x300'
      })
      .done((file) => file.done((fileInfo) => vm.upload(fileInfo))
                          .fail((error, fileInfo) => vm.upload(null, error)))
      .fail(() => (vm.loading = false))
    },
    upload (fileInfo, error) {
      let vm = this
      if (fileInfo) vm.setSchoolImg(fileInfo.cdnUrl, vm.record.id, vm.record.school_id)
      else console.warn(error)
      vm.loading = false
    }

  }
}

</script>
