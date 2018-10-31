chrome.browserAction.onClicked.addListener((tab) => {
	chrome.tabs.sendMessage(
		tab.id,
		{ args: 'do it!' },
		() => {}
	);
});
