<template>
	<div class="mentions-popup">
		<h3 class="mentions-popup-title">Recent mentions</h3>
		<template v-for="message in resolvedMessages">
			<div :key="message.id" :class="['msg', message.type]">
				<span class="from">
					<Username :user="message.from" />
					<template v-if="message.channel">
						in {{ message.channel.channel.name }} on {{ message.channel.network.name }}
					</template>
					<template v-else>
						in unknown channel
					</template>
				</span>

				<span :aria-label="message.time | localetime" class="time tooltipped tooltipped-n">
					{{ messageTime(message.time) }}
				</span>
				<div class="content" dir="auto">
					<ParsedMessage :network="null" :message="message" />
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import Username from "./Username.vue";
import ParsedMessage from "./ParsedMessage.vue";
const socket = require("../js/socket");
const moment = require("moment");

export default {
	name: "Mentions",
	components: {
		Username,
		ParsedMessage,
	},
	computed: {
		resolvedMessages() {
			const {findChannel} = require("../js/vue");

			const messages = this.$root.mentions.reverse();

			for (const message of messages) {
				message.channel = findChannel(message.chanId);
			}

			return messages;
		},
	},
	mounted() {
		socket.emit("mentions:get");
	},
	methods: {
		messageTime(time) {
			return moment(time).fromNow();
		},
	},
};
</script>
