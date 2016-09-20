
<template>

  <modal :show.sync="showModal">
    <div class="p-sm panel-heading" slot="header">
      <i class="material-icons">&#xE7F0;</i>
      <span class="font-bold sans-serif font-1-2 m-l-sm">Add a collaborator</span>
       <i @click="reset" class="material-icons pull-right hand">&#xE14C;</i>
    </div>
    <div class="p-l-sm p-r-sm m-t-md" slot="body">
        <selector endpoint="/profiles" :free="true" img="img" :name="contactname" :value.sync="collaborator" label="Collaborator" v-ref:selector></selector>

        <div class="m-b-md" v-if="verifExistance">
          <section class="fx-col fx-start-center m-t-sm">
            <a @click="add" :disabled="isLoading" class="waves-effect waves-light btn"><i class="material-icons md-14 text-white">&#xE39D;</i>Add collaborator</a>
          </section>
        </div>
  </div>
</modal>

</template>

<script>
var selector = require('shared/selector.vue')
var modal = require('shared/modal.vue')
var connect = require('services/connect.js')
var bus = require('services/bus')
import notify from 'services/notifs-center'
import firebase from 'services/firebase-chat'
// var firebase = window.firebase

module.exports = {
  vuex: {
    getters: {
      myId: ({account}) => account.data.id
    }
  },
  data () {
    return {
      showModal: false,
      collaborator: null,
      collaboratorList: [],
      joboffer: null,
      isLoading: false,
      contactname (e) {
        return e.lastname + ' ' + e.firstname
      }
    }
  },
  components: {
    modal: modal,
    selector: selector
  },
  ready () {
    let vm = this
    bus.$on('collaborator:deleted', function (id) {
      vm.collaboratorList.$remove(id)
    })
  },
  destroyed () {
    bus.$off('collaborator:deleted')
  },
  computed: {
    verifExistance () {
      if (!(this.collaborator instanceof Object)) return false
      else {
        if (this.collaborator.id == this.myId) return false
        else return true
      }
    }
  },
  methods: {
    show (joboffer) {
      this.joboffer = joboffer
      if (this.joboffer.collaborators) {
        this.joboffer.collaborators.map((item) => {
          this.collaboratorList.push(item.profile_id)
        })
      }
      this.showModal = true
    },
    reset () {
      this.collaborator = null
      this.showModal = false
    },
    add () {
      var vm = this
      if (this.collaboratorList.indexOf(this.collaborator.id) > -1) return notify.error('collaborator already exist')
      this.collaboratorList.push(this.collaborator.id)
      var data = {
        collaborators: this.collaboratorList
      }
      this.isLoading = true
      connect.apiAsync('PUT', '/joboffers/' + this.joboffer.id, data)
      .then(function (res) {
        bus.$emit('joboffer:addcollaborators', vm.collaborator)
        vm.isLoading = false
        vm.reset()
        firebase.addCollaboratorToChats(vm.collaborator, vm.joboffer)
      })
      .catch(notify.fail)
    }
  }
}
</script>
