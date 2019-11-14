"use strict";

const Vue = require("vue").default;

const store = require("./store").default;
const App = require("../components/App.vue").default;
const {localetime} = require("./helpers/localetime");
const storage = require("./localStorage");
const {router, navigate} = require("./router");
const constants = require("./constants");
const socket = require("./socket");

Vue.filter("localetime", localetime);

require("./socket-events");
require("./contextMenuFactory");
require("./webpush");
require("./keybinds");

const vueApp = new Vue({
	el: "#viewport",
	router,
	mounted() {
		socket.open();
	},
	methods: {
		switchToChannel(channel) {
			navigate("RoutedChat", {id: channel.id});
		},
	},
	render(createElement) {
		return createElement(App, {
			ref: "app",
			props: this,
		});
	},
	store,
});

store.watch(
	(state) => state.sidebarOpen,
	(sidebarOpen) => {
		if (window.outerWidth > constants.mobileViewportPixels) {
			storage.set("thelounge.state.sidebar", sidebarOpen);
		}

		vueApp.$emit("resize");
	}
);

store.watch(
	(state) => state.userlistOpen,
	(userlistOpen) => {
		storage.set("thelounge.state.userlist", userlistOpen);
		vueApp.$emit("resize");
	}
);

store.watch(
	(_, getters) => getters.title,
	(title) => {
		document.title = title;
	}
);

store.watch(
	(_, getters) => getters.highlightCount,
	() => {
		// Toggles the favicon to red when there are unread notifications
		const favicon = document.getElementById("favicon");
		const old = favicon.getAttribute("href");
		favicon.setAttribute("href", favicon.dataset.other);
		favicon.dataset.other = old;
	}
);

Vue.config.errorHandler = function(e) {
	store.commit("currentUserVisibleError", `Vue error: ${e.message}`);
	console.error(e); // eslint-disable-line
};
