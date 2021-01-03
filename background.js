const fetchChannelContents = (cfg) => {
	return fetch(
		`https://api.are.na/v2/channels/${cfg.channelId}/contents`,
		{
			method: 'GET',
			headers: {
				'X-AUTH-TOKEN': cfg.arenaAccessToken,
			},
		}
	)
		.then((res) => res.json());
};


const isUrlNew = (url, cfg) => {
	return fetchChannelContents(cfg)
		.then(({ contents }) => {
			// TODO: API docs say this is paginated(?)
			const urls = contents.map((item) => {
				return item.content.split('\n')[0].replace(/#+ +/ig, '').trim();
			});
			const exists = urls.includes(url);
			return !exists;
		});
};


const addBlock = (url, descriptionStr, cfg) => {
	return fetch(
		`https://api.are.na/v2/channels/${cfg.channelSlug}/blocks`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'X-AUTH-TOKEN': cfg.arenaAccessToken,
			},
			body: JSON.stringify({
				content: `# ${url}\n${descriptionStr}`,
			}),
		}
	)
		.then((res) => res.json());
};


chrome.runtime.onMessage.addListener(
	(msg, sender, sendResponse) => {
		if (msg.fn === 'isUrlNew') {
			isUrlNew(msg.url, msg.cfg)
				.then(sendResponse);
		} else if (msg.fn === 'addBlock') {
			addBlock(msg.url, msg.descriptionStr, msg.cfg)
				.then(sendResponse);
		}
		// https://developer.chrome.com/apps/runtime#event-onMessage
		return true; // keeps the message channel open until `sendResponse` is executed
	}
);


chrome.browserAction.onClicked.addListener(
	(tab) => {
		chrome.tabs.sendMessage(
			tab.id,
			{ /*args: 'do it!'*/ },
			() => {}
		);
	}
);
