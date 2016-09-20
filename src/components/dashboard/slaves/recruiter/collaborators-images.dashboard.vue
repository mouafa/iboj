<style lang="less" scoped>
.collaborators-images-container {
  position: relative;
  img {
    display: inline-block;
    position: absolute;
  }
  .image-one {
    top: -15px;
    left: 35px;
    cursor: pointer;
    z-index: 2;
  }
  .image-two {
    top: -15px;
    left: 10px;
    cursor: pointer;
    z-index: 1;
  }
  .image-three {
    top: -15px;
    left: 60px;
    cursor: pointer;
    z-index: 1;
  }
  .grayed {
    filter: grayscale(100%);
    cursor: initial;
    z-index: 0;
    &:hover {
      transform: none;
    }
  }
}
</style>

<template>
<section class="collaborators-images-container">
  <img class="user-image circle m-none size-32 image-one" :class="collaborators[0] ? '' : 'grayed'" :src="collaborators[0] ? collaborators[0].profile.img : ''" :title="collaborators[0] ? collaborators[0].profile.firstname + ' ' + collaborators[0].profile.lastname : ''" @click="goToProfile(collaborators[0])">
  <img class="user-image circle m-none size-32 image-two" :class="collaborators[1] ? '' : 'grayed'" :src="collaborators[1] ? collaborators[1].profile.img : ''" :title="collaborators[1] ? collaborators[1].profile.firstname + ' ' + collaborators[1].profile.lastname : ''" @click="goToProfile(collaborators[1])">
  <img class="user-image circle m-none size-32 image-three" :class="collaborators[2] ? '' : 'grayed'" :src="collaborators[2] ? collaborators[2].profile.img : ''" :title="collaborators[2] ? collaborators[2].profile.firstname + ' ' + collaborators[2].profile.lastname : ''" @click="goToProfile(collaborators[2])">
</section>
</template>

<script>
module.exports = {
  props: ['collaborators'],
  methods: {
    goToProfile (collaborator) {
      if (!collaborator || !collaborator.profile || !collaborator.profile.slug) return
      window.location = window.location.origin + '/profile.html#!/' + collaborator.profile.slug
    }
  }
}
</script>
