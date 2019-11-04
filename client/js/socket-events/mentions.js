"use strict";

const socket = require("../socket");

socket.on("mentions:list", function(data) {
	console.log(data);
});
