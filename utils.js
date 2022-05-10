/* global chrome */

const blockedFieldName = 'blockedHosts';


// https://developer.chrome.com/docs/extensions/reference/storage/#usage
// storage can be inspected at chrome://sync-internals/
// → "sync node browser" → "extension settings"
// eslint-disable-next-line no-unused-vars
const getBlockedFromStorage = async () => {
	return JSON.parse(
		await new Promise((resolve) => {
			chrome.storage.sync.get(
				blockedFieldName,
				(result) => resolve(result[blockedFieldName])
			);
		}) || '[]'
	);
};


// eslint-disable-next-line no-unused-vars
const setBlocked = (blockedList) => {
	return new Promise((resolve) => {
		chrome.storage.sync.set(
			{ [blockedFieldName]: JSON.stringify(blockedList) },
			() => resolve()
		);
	});
};
