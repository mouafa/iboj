<style lang="less" scoped>
.job-title {
    &:hover {
        font-weight: bold;
    }
}
.body-container{
  max-height: 350px;
  overflow-y: auto;
}
</style>

<template>
  <div   class="hpanel m-none m-b-xs font-8">

    <div class="panel-body m-none p-none font-light ">
      <section class="p-sm">
        <div v-if="!preview" class="pull-right">
          <div class="panel-tools font-1-2">
              <a v-link="{name: 'joboffer', params: { jobId: data.slug || data.uuid }}"  class="hand text-grey p-l-sm p-t-sm p-b-sm">
                 <span class="capital middle" v-ii18n="detailLbl">View Details <i class="material-icons ">&#xE5CC;</i></span>
              </a>
          </div>
        </div>

        <div v-if="!companylisting" class="fx-row fx-start-center m-none p-none ">
          <a v-link="'/company/'+ data.company.slug || data.company.uuid " class="m-none p-none">
            <img :src="data.company && data.company.logo ? data.company.logo : ''" alt="logo" class="company-logo border size-48 hand ">
          </a>
          <div class="job-title m-l-sm break-word" flex>
            <a v-link="'/company/'+ data.company.slug || data.company.uuid " class="m-none p-none"><h4  class="font-1-2 p-none capital m-none hand text-info hand font-light m-b-md" v-if="data.company">{{data.company.name || data.company}}</h4></a>
            <h4 class="capital m-none p-none m-t-n-sm font-1-2">
               {{data.title}}
            </h4>
          </div>
        </div>

        <div v-else  class="">
          <!-- <div><i class="fa fa-clock-o m-r-xs"></i><span v-from-now="data.release_date"></span></div> -->
          <div>
            <h4 class="capital m-none font-light font-1-5">
              {{data.title}}
            </h4>
          </div>
        </div>

        <div class="body-container m-t-sm">
          <div v-if="data.description" class="font-light font-1-2">
            {{data.description.substring(0,300) }}...
          </div>

          <div class="fx-row m-t-sm">
            <span class=" font-light border p-xxs m-xxs font-1-2" track-by="$index" v-for="item in data.tags">
              {{item.name || item}}</span>
          </div>

        </div>
      </section>
      <div class="border-top bg-transparent" >
        <div class="m-l-md fx-row fx-start-center">
          <section class="fx-row fx-start-center w-min-30 p-r-md">
            <div class="p-r-sm">
              <a :href="'profile.html#!/' + data.responsible.slug" class="m-none p-none">
               <img  :src="data.responsible && data.responsible.img ? data.responsible.img    : ''" class="user-image circle size-32 m-t-sm m-b-sm hand">
              </a>
            </div>
            <div class="">
              <div  v-if="data.responsible">
                <a :href="'profile.html#!/' + data.responsible.slug" class="m-none p-none capital">
                {{data.responsible.firstname}} {{data.responsible.lastname}}
                </a>
              </div>
              <div><i class="material-icons md-14 orange600">&#xE8B3;</i><span v-from-now="data.release_date"></span></div>
            </div>
          </section>
          <div class="" flex v-if="data.location">
            <div class="font-uppercase  font-light">
              <i v-if="data.location.name" class="material-icons md-14 orange600">&#xE55E;</i>
              <span class="">
                {{data.location.name}}</span>
            </div>
          </div>

          <div class="" flex v-if="data.job_type">
            <div class="font-uppercase  font-light">
              <i v-if="data.job_type.name" class="material-icons md-14 orange600">&#xE88B;</i>
              <span>{{data.job_type.name}}</span>
            </div>
          </div>

          <div class="p-r-md" flex>
            <div class="font-uppercase font-light fx-col" v-if="data.salary_min || data.salary_max">
              <span class="">{{data.salary_min | currency}} - {{data.salary_max | currency}} <span class="text-light">/ Month</span></span>
            </div>
          </div>

        </div>
      </div>


        <div class="clearfix"></div>
      </div>
    </div>
  </div>
</template>

<script>
require('../../style/common/panel.less')

module.exports = {
  vuex: {
    getters: {
      anonym: ({account}) => account.loaded === 'unauth',
      accountId: ({account}) => account.data.id
    }
  },
  props: {
    data: {
      type: Object,
      require: true
    },
    preview: {
      type: Boolean,
      default: false
    },
    current: {
      type: Object,
      require: true
    },
    companylisting: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      baseurl: window.location.href.substring(0, window.location.href.indexOf('/#'))
    }
  },
  components: {
    // comments: comments
    // refers: refers
  },
  computed: {
    commentCount () {
      return this.$refs.commentlist.comments.length || this.data.statistic.comments
    },
    isMine () {
      if (!this.data || !this.data.responsible) return false
      return this.accountId == this.data.responsible.id
    }
  },
  methods: {

    jobofferURL (joboffer) {
      return encodeURIComponent(window.location.href.replace(/\/*$/, '') + '/joboffer/' + joboffer.slug)
    }
  }
}

</script>
