<style>
.line{
  width:100%;
  height:1px;
  background-color: #F3F3F3;
}
</style>
<template>
<section>
  <div class="cd-timeline-block p-none m-none p-l-sm m-b-sm m-t-sm p-r-sm  ">
<!-- cd-timeline-img -->
    <div @click="uploadImage" :class="{'uploader' : editmode, 'progres' : loading}" class="cd-timeline-img size-64 company-logo m-t-xs ">
      <img :src="logo  " class="size-64" alt="company logo"/>
    </div>

    <div class="cd-timeline-content m-none ">
      <div class="p-xs word-wrapper">
        <span v-if="editmode" @click="editExperience" class="--edit-delete-menu hand "><i class="material-icons md-14">&#xE254;</i></span>

        <div class="font-9 font-light text-light">
          <span class="capital">{{record.since | moment "MMMM YYYY" }}</span>
          <span>-</span>
          <span class="capital" v-if="record.until">{{record.until | moment "MMMM YYYY" }}</span>
          <span v-else>Present</span>
          <span class="text-primary-2 m-l-xs">
            {{duration}}
          </span>
        </div>
        <div class="font-1-2 m-t-xs capital">
          <h6 class="text-light font-1 m-none font-light"><span class="text-info hand"><a  href="/index.html#!/company/{{record.company.slug || record.company.uuid }}">{{record.company.name}}</a></span> <span class="font-slim font-8" >|</span> {{record.title}}</h6>
        </div>
        <p class="font-9 font-light m-t-xs">{{{record.description | lineBreak}}}</p>
         <div class="m-t-sm break-word">
             <div track-by="$index" v-for="item in record.skills" class="chip font-8 m-l-xs m-b-sm">{{item.name || item}}</div>
          </div>
      </div>
      <!-- cd-timeline-content -->
    </div>
    <!-- cd-timeline-block -->
  </div>

  <div class="line"></div>
</section>
</template>
<script>
var companyImg = require('assets/company.png')
var moment = require('moment')

import {isMine} from 'store/profile/getters.profile'
import {setCompanyImg, setActiveExp} from 'store/profile/actions.profile'

module.exports = {
  vuex: {
    actions: {
      setCompanyImg,
      setActiveExp
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
      return this.record.img || this.record.company.logo || companyImg
    },
    tags () {
      return (this.record && this.record.skills) ? this.record.skills.split(',') : []
    },
    duration () {
      let now = moment()
      // if (!this.record.until) return ''
      // else {
      var diff = moment(this.record.since).diff(moment(this.record.until || now))
      return moment.duration(diff).humanize()
      // }
    }
  },
  methods: {
    editExperience () {
      this.setActiveExp(this.record)
      this.$dispatch('experience_record:edit', this.record)
    },
    uploadImage () {
      if (!this.editmode) return
      var vm = this
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
      if (fileInfo) vm.setCompanyImg(fileInfo.cdnUrl, vm.record.id, vm.record.company_id)
      else console.warn(error)
      vm.loading = false
    }
  }
}
</script>
