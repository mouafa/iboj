<style lang="less" scoped>
.wait-message {
  margin-top: 50px;
  min-width: 10px;
}
</style>

<template>
<section class="row">
	<div class="col s6 wait-message"></div>
	<div class="col s6 wait-message">
		<div class="preloader-wrapper big active">
			<div class="spinner-layer spinner-blue">
				<div class="circle-clipper left">
					<div class="circle"></div>
				</div>
				<div class="gap-patch">
					<div class="circle"></div>
				</div>
				<div class="circle-clipper right">
					<div class="circle"></div>
				</div>
			</div>
		</div>
	</div>
</section>
</template>
