<style lang="less" scoped>
.down-menu {
    position: absolute;
    z-index: 100 !important;
    list-style: none;
    min-width: 120px;
    border-radius: 2px;
    li {
      &:first-child {
        border-top: 0;
      }
      &:hover {
          transform: translateX(1px);
      }
    }
}
.drop-down {
    position: relative;
    display: inline-block;
}

</style>
<template>
<div class="p-xs bg-transparent">
  <addcollaborators v-ref:addcollaborators></addcollaborators>
    <div class="jd-section m-l-none ">
    <label  >
      <div class=" ">
          <span class="font-1-2 font-uppercase font-light capital" v-ii18n="collaborators">collaborators</span>

          <span v-show="collaboratorslist.length" class="bg-green circle p-xs   p-t-xs p-b-xs m-l-sm">
            <span class="text-white">{{collaboratorslist.length}}</span>
          </span>

          <span v-if ="collaboratorslist.length<3"  @click="addCollaborators" class=" right  m-r-md">
             <span class="m-t-xs hand uppercase"><i class="material-icons md-18 m-t-n-xs m-r-xs green600">&#xE7FE;</i> Collaborator</span>
          </span>

      </div>
    </label>
  </div>
  <section>
    <div v-if="collaboratorslist.length" class="m-t-sm">


      <div v-for="item in collaboratorslist" class="border m-b-sm ">
        <span class="pull-right m-t-xs">
            <div  id="drop-down" class="drop-down hand  m-l-n-lg" @click="showmenu(item.id)">
                 <div class="p-xxs">
                    <i class="material-icons md-20 orange600 border">&#xE313;</i>
                  </div>
                  <section v-show="listMe && currentId == item.id">
                    <div class="flesh"></div>
                    <ul class="border bg-white down-menu p-xxs m-none m-t-xs">
                       <li class="capital border-top p-xxs font-8 hand" @click="deleteCollaborators(item)">
                          <i class="material-icons md-18 red600">&#xE872;</i>
                           <span class="capital text-danger" v-ii18n="addNewSection">Remove</span>
                       </li>
                     </ul>
                   </section>
            </div>
        </span>
            <div class="row  p-sm bg-light" >
              <div class="col m2">
                <img  @click="gotoProfile(item)"   :src="item.img  " class="hand user-image circle  size-32">
              </div>
              <div class="col m10 p-none m-none ">
                <span @click="gotoProfile(item)" class="m-none font-light font-1-2 hand">{{item.firstname}} {{item.lastname}}</span>
                <div class="m-none">{{item.title}}</div>
              </div>

            </div>
            <div class="row  p-sm bg-light-soft" >
            </div>
      </div>

      <!-- <div v-if ="collaboratorslist.length<3"  @click="addCollaborators" class="waves-effect waves-light fx-col fx-start-center border placeholder p-none p-t-sm p-b-sm">
         <span class="m-t-xs uppercase"><i class="material-icons md-18 m-t-n-xs m-r-xs green600">&#xE7FE;</i> Collaborator</span>
      </div> -->

    </div>
    <section v-else class="fx-col fx-start-center placeholder m-t-sm">
      <i class="material-icons symbol">&#xE85F;</i>
      <!-- <h2 class="m-none capital" v-ii18n="">No one recommended yet</h2> -->
      <p class="m-none capital" v-ii18n="">No collaborators click to add one</p>
      <a @click="addCollaborators" class="waves-effect waves-light m-t-sm p-none p-r-xs p-l-xs uppercase"><i class="material-icons ">&#xE7F0;</i></a>
    </section>
  </section>
</div>
</template>

<script>
var connect = require('services/connect.js')
var addcollaborators = require('./addcollaborators.vue')
var bus = require('services/bus')
import {getApplicationList} from 'store/joboffer/getters.joboffer'
import notify from 'services/notifs-center'
var firebase = window.firebase
// import firebase from 'services/firebase-chat'

module.exports = {
  vuex: {
    getters: {
      applicationList: getApplicationList
    }
  },
  data () {
    return {
      collaboratorslist: [],
      collaboratorsIds: [],
      listMe: false,
      currentId: null
    }
  },
  props: {
    joboffer: {
      type: Object,
      require: true
    }
  },
  components: {
    addcollaborators
  },
  ready () {
    var vm = this
    if (this.joboffer && this.joboffer.collaborators) {
      this.joboffer.collaborators.map((item) => {
        this.collaboratorslist.push(item.profile)
        this.collaboratorsIds.push(item.profile_id)
      })
    }
    bus.$on('joboffer:addcollaborators', (data) => {
      this.collaboratorslist.push(data)
      this.collaboratorsIds.push(data.id)
    })
    bus.$on('removeCollaborator:callback', function (status, item) {
      if (status) {
        vm.confirmDelete(item)
      }
    })
    this.clickOut = function (event) {
      if ($(event.target).closest('#drop-down').length) return true
      vm.showmenu(null)
    }
  },
  destroyed () {
    bus.$off('joboffer:addcollaborators')
    bus.$off('removeCollaborator:callback')
  },
  methods: {
    addCollaborators () {
      this.$refs.addcollaborators.show(this.joboffer)
    },
    showmenu (id) {
      this.currentId = id
      this.listMe = !this.listMe
      if (this.listMe) $(document).bind('click', this.clickOut)
      else $(document).unbind('click', this.clickOut)
    },
    gotoProfile (condidate) {
      let id = condidate.slug ? condidate.slug : condidate.uuid

      window.location = window.location.origin + '/profile.html#!/' + id
    },
    deleteCollaborators (item) {
      bus.$emit('confirm:open', 'Remove collaborator', 'Are you sure to remove this collaborator', 'confirm', 'removeCollaborator', item)
    },
    confirmDelete (item) {
      var vm = this
      let itm = JSON.parse(JSON.stringify(item))
      vm.collaboratorsIds.$remove(item.id)
      var data = {
        collaborators: vm.collaboratorsIds
      }
      connect.apiAsync('PUT', '/joboffers/' + vm.joboffer.id, data)
      .then(function (res) {
        vm.joboffer = res
        vm.collaboratorslist.$remove(item)
        bus.$emit('collaborator:deleted', item.id)
      })
      .catch(notify.fail)
      .then(function (res) {
        return firebase.removeCollaboratorFromChats(itm, vm.joboffer, vm.applicationList)
      })
      .catch(notify.fail)
    }
  }
}

</script>
