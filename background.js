/* global chrome */

const fetchChannelContents = (cfg, page, perPage) => {
	const pagination = `page=${page}&per=${perPage}`;
	return fetch(
		`https://api.are.na/v2/channels/${cfg.channelId}/contents?${pagination}`,
		{
			method: 'GET',
			headers: {
				'X-AUTH-TOKEN': cfg.arenaAccessToken,
			},
		}
	)
		.then((res) => res.json());
};


const isUrlNew = async (url, cfg) => {
	const perPage = 100;
	let page = 0;
	let allContents = [];
	// fetch paginated data, until we got everything in channel:
	// eslint-disable-next-line no-constant-condition
	while (true) {
		page += 1;
		const { contents } = await fetchChannelContents(cfg, page, perPage);
		if (!contents || !contents.length) {
			break;
		}
		allContents = [...allContents, ...contents];
	}

	const urls = allContents.map((item) => {
		return item.content.split('\n')[0].replace(/#+ +/ig, '').trim();
	});
	console.log(urls);
	const exists = urls.includes(url);
	return !exists;
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


chrome.action.onClicked.addListener(
	(/* tab */) => {
		// chrome.tabs.sendMessage(
		// 	tab.id,
		// 	{ /*args: 'do it!'*/ },
		// 	() => {}
		// );
		chrome.runtime.openOptionsPage(() => { });
	}
);
