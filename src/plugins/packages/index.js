"use strict";

const log = require("../../log");
const colors = require("chalk");
const path = require("path");
const Helper = require("../../helper");
const themes = require("./themes");
const packageMap = new Map();
const inputs = require("../inputs");
const fs = require("fs");
const Utils = require("../../command-line/utils");

const stylesheets = [];
const files = [];

const TIME_TO_LIVE = 15 * 60 * 1000; // 15 minutes, in milliseconds

const cache = {
	outdated: undefined,
};

module.exports = {
	getFiles,
	getStylesheets,
	getPackage,
	loadPackages,
	outdated,
};

const packageApis = function(packageInfo) {
	return {
		Stylesheets: {
			addFile: addStylesheet.bind(this, packageInfo.packageName),
		},
		PublicFiles: {
			add: addFile.bind(this, packageInfo.packageName),
		},
		Commands: {
			add: inputs.addPluginCommand.bind(this, packageInfo),
			runAsUser: (command, targetId, client) =>
				client.inputLine({target: targetId, text: command}),
		},
		Config: {
			getConfig: () => Helper.config,
		},
	};
};

function addStylesheet(packageName, filename) {
	stylesheets.push(packageName + "/" + filename);
}

function getStylesheets() {
	return stylesheets;
}

function addFile(packageName, filename) {
	files.push(packageName + "/" + filename);
}

function getFiles() {
	return files.concat(stylesheets);
}

function getPackage(name) {
	return packageMap.get(name);
}

function loadPackages() {
	const packageJson = path.join(Helper.getPackagesPath(), "package.json");
	let packages;
	let anyPlugins = false;

	try {
		packages = Object.keys(require(packageJson).dependencies);
	} catch (e) {
		packages = [];
	}

	packages.forEach((packageName) => {
		let packageInfo;
		let packageFile;

		try {
			const packagePath = Helper.getPackageModulePath(packageName);

			packageInfo = require(path.join(packagePath, "package.json"));

			if (!packageInfo.thelounge) {
				throw "'thelounge' is not present in package.json";
			}

			packageFile = require(packagePath);
		} catch (e) {
			log.error(`Package ${colors.bold(packageName)} could not be loaded: ${colors.red(e)}`);
			log.debug(e.stack);
			return;
		}

		const version = packageInfo.version;
		packageInfo = packageInfo.thelounge;
		packageInfo.packageName = packageName;
		packageInfo.version = version;

		packageMap.set(packageName, packageFile);

		if (packageInfo.type === "theme") {
			themes.addTheme(packageName, packageInfo);

			if (packageInfo.files) {
				packageInfo.files.forEach((file) => addFile(packageName, file));
			}
		} else {
			anyPlugins = true;
		}

		if (packageFile.onServerStart) {
			packageFile.onServerStart(packageApis(packageInfo));
		}

		log.info(`Package ${colors.bold(packageName)} ${colors.green("v" + version)} loaded`);
	});

	if (anyPlugins) {
		log.info(
			"There are packages using the experimental plugin API. Be aware that this API is not yet stable and may change in future The Lounge releases."
		);
	}
}

async function outdated(cacheTimeout = TIME_TO_LIVE) {
	if (cache.outdated !== undefined) {
		return cache.outdated;
	}

	// Get paths to the location of packages directory
	const packagesPath = Helper.getPackagesPath();
	const packagesConfig = path.join(packagesPath, "package.json");
	const argsList = [
		"outdated",
		"--latest",
		"--json",
		"--production",
		"--ignore-scripts",
		"--non-interactive",
		"--cwd",
		packagesPath,
	];

	// Check if the configuration file exists
	if (!fs.existsSync(packagesConfig)) {
		// CLI calls outdated with zero TTL, so we can print the warning there
		if (!cacheTimeout) {
			log.warn("There are no packages installed.");
		}

		return false;
	}

	// If we get an error from calling outdated and the code isn't 0, then there are no outdated packages
	await Utils.executeYarnCommand(...argsList)
		.then(() => updateOutdated(false))
		.catch((code) => updateOutdated(code !== 0));

	if (cacheTimeout > 0) {
		setTimeout(() => {
			delete cache.outdated;
		}, cacheTimeout);
	}

	return cache.outdated;
}

function updateOutdated(outdatedPackages) {
	cache.outdated = outdatedPackages;
}
