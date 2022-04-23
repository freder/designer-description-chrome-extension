/* global chrome */

const blockedFieldName = 'blockedHosts';


// https://developer.chrome.com/docs/extensions/reference/storage/#usage
// storage can be inspected at chrome://sync-internals/
// → "sync node browser" → "extension settings"
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


const setBlocked = (blockedList) => {
	return new Promise((resolve) => {
		chrome.storage.sync.set(
			{ [blockedFieldName]: JSON.stringify(blockedList) },
			() => resolve()
		);
	});
};
