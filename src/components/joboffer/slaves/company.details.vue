<template>
<div class="m-t-xs ">
      <div class=" m-none p-none">
        <section class="p-sm z-depth-1 bg-white m-b-lg">
              <div class="fx-row p-b-sm fx-start-start ">
                <div class="m-r-sm">
                  <img :src="data.logo  " class="img-rounded border size-64" alt="logo">
                </div>

                <div flex class="p-t-sm">
                  <span class="font-light font-1-5 text-light font-uppercase " >{{data.name}}</span>
                  <div class="font-8 m-t-xs" v-if="data.url"><a href="{{data.url}}" target="_blank"><i class="material-icons md-14">&#xE80B;</i> Website</a></div>
                </div>
              </div>

              <div class="p-b-sm fx-start-start" v-if="data.country || data.address || data.city || data.region || data.phone">
                <div v-if="data.country || data.address || data.city || data.region">
                    <i class="material-icons md-14">&#xE0C8;</i>
                    <span class="m-r-xs capital" v-if="data.address">{{data.address}},</span>
                    <span class="m-r-xs capital" v-if="data.city">{{data.city}},</span>
                    <span class="m-r-xs capital" v-if="data.zipcode">{{data.zipcode}},</span>
                    <span class="m-r-xs capital" v-if="data.region">{{data.region}},</span>
                    <span class="m-r-xs capital" v-if="data.country">{{data.country}}.</span>
                </div>
                <div class="m-t-xs" v-if="data.phone">
                    <i class="material-icons md-14">&#xE0CD;</i>
                    <span class="m-r-xs capital" >{{data.phone}}</span>
                </div>
              </div>

              <div class="font-9 font-light word-wrapper m-t-xs">
                {{{data.description}}}
              </div>
        </section>
    </div>
    <div class=" p-none m-none m-t-xs">
      <div class="p-none p-r-xs hpanel p-b-lg m-t-sm">
        <h6 v-show="joboffers.length > 0">Other Jobs by {{data.name}} ({{joboffers.length -1}})</h6>
        <div v-show="joboffers.length" v-for="item in joboffers">
          <joboffer  v-show="item.id != jobId" class="m-b-sm"  :data="item" :companylisting="true"></joboffer>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import joboffer from 'shared/joboffer-preview.vue'
import {companyData, companyJoboffers} from 'store/company/getters.company'
import {getJobofferData} from 'store/joboffer/getters.joboffer'
module.exports = {
  vuex: {
    getters: {
      joboffers: companyJoboffers,
      data: companyData,
      joboffer: getJobofferData,
      jobId: ({joboffer}) => joboffer.data.id
    }
  },
  components: {
    joboffer
  }
}

</script>
