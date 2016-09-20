<style lang="less" scoped>

		span {
			font-weight: 400;
			font-size: 1rem;
		}

</style>
<template>
	<section class="">
		<ul class="ul-none p-none m-none">
			<li v-for="option in options" track-by="$index" class="p-t-xxs p-b-xxs m-t-xs fx-row fx-space-between-center">
				<!-- <label class="mdl-radio mdl-js-radio">
				  <input type="radio" class="mdl-radio__button" :name="componentId" :value="$index">
				  <span class="mdl-radio__label">{{option}}</span>
				</label> -->
				<div>
					<input class="with-gap" :name="componentId" type="radio" :id="componentId + $index"  />
		 			<label :for="componentId + $index">{{option}}</label>
				</div>

				<span>{{Math.floor(Math.random()*100)}}</span>
			</li>
		</ul>
	</section>

</template>

<script>
module.exports = {
	props: {
		options: {
			type: Array
		}
	},
  data () {
  	return {
  		componentId: Math.floor(Math.random() * 100)
  	}
  }
}
</script>
