<template>
	<div id="image-viewer" ref="viewer" :class="{opened: link !== null}" @click="closeViewer">
		<template v-if="link !== null">
			<button class="close-btn" aria-label="Close"></button>

			<!--button
			v-if="hasPreviousImage"
			class="previous-image-btn"
			aria-label="Previous image"
		></button>
		<button v-if="hasNextImage" class="next-image-btn" aria-label="Next image"></button-->

			<a class="image-link" :href="link.link" target="_blank">
				<img :src="link.thumb" decoding="async" alt="" />
			</a>

			<a class="btn open-btn" :href="link.link" target="_blank">
				<span v-if="link.type == 'image'">Open image</span>
				<span v-else>Visit page</span>
			</a>
		</template>
	</div>
</template>

<script>
export default {
	name: "ImageViewer",
	data() {
		return {
			link: null,
		};
	},
	watch: {
		link() {
			// TODO: history.pushState
		},
	},
	methods: {
		closeViewer() {
			this.link = null;
		},
	},
};
</script>
