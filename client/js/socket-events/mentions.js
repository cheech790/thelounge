"use strict";

const {vueApp} = require("../vue");
const socket = require("../socket");

socket.on("mentions:list", function(data) {
	vueApp.mentions = data;
});
