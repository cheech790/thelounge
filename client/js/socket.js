"use strict";

const $ = require("jquery");
const io = require("socket.io-client");

const socket = io({
	transports: $(document.body).data("transports"),
	path: window.location.pathname + "socket.io/",
	autoConnect: false,
	reconnection: !$(document.body).hasClass("public"),
});

module.exports = socket;
