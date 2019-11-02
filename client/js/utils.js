"use strict";

const $ = require("jquery");
const escape = require("css.escape");
const store = require("./store").default;

var serverHash = -1; // eslint-disable-line no-var

module.exports = {
	findCurrentNetworkChan,
	serverHash,
	scrollIntoViewNicely,
	hasRoleInChannel,
	requestIdleCallback,
};

function findCurrentNetworkChan(name) {
	name = name.toLowerCase();

	return store.state.activeChannel.network.channels.find((c) => c.name.toLowerCase() === name);
}

// Given a channel element will determine if the lounge user or a given nick is one of the supplied roles.
function hasRoleInChannel(channel, roles, nick) {
	if (!channel || !roles) {
		return false;
	}

	const channelID = channel.attr("data-id");
	const network = $("#sidebar .network").has(`.chan[data-id="${channelID}"]`);
	const target = nick || network.attr("data-nick");
	const user = channel.find(`.names .user[data-name="${escape(target)}"]`).first();
	return user.parent().is("." + roles.join(", ."));
}

// Reusable scrollIntoView parameters for channel list / user list
function scrollIntoViewNicely(el) {
	// Ideally this would use behavior: "smooth", but that does not consistently work in e.g. Chrome
	// https://github.com/iamdustan/smoothscroll/issues/28#issuecomment-364061459
	el.scrollIntoView({block: "center", inline: "nearest"});
}

function requestIdleCallback(callback, timeout) {
	if (window.requestIdleCallback) {
		// During an idle period the user agent will run idle callbacks in FIFO order
		// until either the idle period ends or there are no more idle callbacks eligible to be run.
		window.requestIdleCallback(callback, {timeout});
	} else {
		callback();
	}
}
