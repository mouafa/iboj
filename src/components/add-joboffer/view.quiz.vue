<style lang="less" scoped>
.--question-list{
  button{
    opacity: .5;
    transition: all 200ms
  }
  &:hover{
    button{
      opacity: 1
    }
  }
}

.-hint {
  line-height: 1.4rem;
  b{
    font-weight: 400;
  }
}

.-preview{
  font-size: 1.2rem;
  opacity: .8;
  // color: #A5A5A5;
}
</style>

<template>
  <section class="font-9 m-b-lg" v-show="isReady" transition="fade-in" transition-mode="out-in">
    <div class="bg-white p-sm  m-b-md">
      <h6 class="font-light center -hint">
        You can make the applicants answer to a quiz question before they can submit their application.<br>
        Your question could be something like: <b>“Tell me about your last job experience”</b> or <br>
        <b>“Why would you want work for our company?”</b> or <br>
        <b>“Tell us about a difficult challenge you solved”</b>
      </h6>
    </div>

    <form v-if="editMode" class="form-container bg-white m-b-md z-depth-1">

      <section class="field-group fx-col">
        <div class="m-b-sm">
          <label class="capital">question type</label>
        </div>
        <div>
          <select class="browser-default input-box" id="question_type" v-model="questionType">
            <option value="Free">Free input Question</option>
            <option value="Y/N">Yes / No Question</option>
          </select>
        </div>
      </section>
      <section class="field-group fx-col">
        <div class="m-b-sm">
          <label class="capital font-light">Question</label>
        </div>
        <div>
          <textarea class="input-box" id="description" maxlength="600" v-model="questionSubject"></textarea>
        </div>
      </section>

    </form>

    <form v-else class="form-container bg-white m-b-md z-depth-1">
      <button @click="toggleEdit" type="button" class="btn-flat p-r-sm p-l-sm waves-effect right"><i class="material-icons">edit</i></button>

      <section class="m-b-lg">
        <div>
            <h6 v-if="questionType == 'Free'" class="-preview">Free input Question</h6>
            <h6 v-if="questionType == 'Y/N'" class="-preview">Yes / No Question<h6>
        </div>
      </section>
      <section>
        <div class="m-b-sm">
          <label class="capital">Question</label>
        </div>
        <div>
          <h6 class="-preview">{{questionSubject}}<h6>
        </div>
      </section>
    </form>

    <div class="fx-row fx-space-between-center">
      <button @click="save(false)" class="btn-flat waves-effect waves-teal font-1-2 bg-none teal-text" name="save-draft">Save as Draft</button>
      <button @click="save('next')" class="btn-floating btn-large waves-effect waves-light bay-leaf"><i class="material-icons">chevron_right</i></button>
    </div>
  </section>
</template>

<script>
var modal = require('shared/modal.vue')
// var preview = require('shared/joboffer-preview.vue')
var connect = require('services/connect')
import notify from 'services/notifs-center'
module.exports = {
  data () {
    return {
      joboffer: {},
      // showModal: false,
      isReady: false,
      error: '',
      questionType: '', // 'Free',
      questionFor: 'application',
      questionSubject: '',
      editMode: true
      // desable: false,
      // jobofferPreview: {}
    }
  },
  route: {
    data ({to}) {
      let jobId = to.params.jobId
      if (Number(jobId)) {
        this.loadJoboffer(jobId)
        .catch(() => this.$router.go('/'))
      } else this.$router.go('/')
    }
  },
  components: {
    // preview,
    modal
  },
  methods: {
    toggleEdit () {
      this.editMode = true
    },
    loadJoboffer (id) {
      var vm = this
      return connect.apiAsync('GET', '/dashboard/joboffers/' + id + '?fields=[id,applicationQuestions]')
      .then(function (res) {
        vm.joboffer = res
        vm.isReady = true
        if (res.applicationQuestions && res.applicationQuestions.length) {
          vm.editMode = false
          vm.questionType = res.applicationQuestions[0].type
          vm.questionSubject = res.applicationQuestions[0].subject
        }
      })
    },
    parseQuestion () {
      if (!this.questionSubject.length) return []
      return [{
          subject: this.questionSubject,
          type: this.questionType,
          target: this.questionFor
        }]
    },
    save (next) {
      var vm = this
      vm.error = ''
      var data = {
        questions: vm.parseQuestion(),
        state: next ? 'pushed' : 'staged'
      }
      connect.apiAsync('PUT', '/joboffers/' + this.joboffer.id, data)
      .then((res) => {
        vm.editMode = false
        if (next) {
        var id = res.slug ? res.slug : res.uuid
        window.location.assign(window.location.origin + '/#!/joboffer/' + id)
        } else window.location = window.location.origin
      })
      .catch(notify.fail)
    },
    reset () {
      this.error = ''
      this.questionType = 'Free'
      this.questionSubject = ''
    }
  }
}

</script>
