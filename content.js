const checkUrl = async (url) => {
	return fetch(
		`https://api.are.na/v2/channels/${channelId}/contents`,
		{
			method: 'GET',
			headers: {
				'X-AUTH-TOKEN': arenaAccessToken,
			},
		}
	)
		.then((res) => res.json())
		.then(({ contents }) => {
			// TODO: API docs say this is paginated(?)
			const urls = contents.map((item) => {
				return item.content.split('\n')[0].replace(/#+ +/ig, '').trim();
			});
			const exists = urls.includes(url);
			return !exists;
		});
};


const matchMultiplePatterns = (s, patterns) => {
	return patterns.reduce(
		(acc, pattern) => {
			const m = s.match(pattern);
			return (!m)
				? acc
				: [...acc, m];
		}, 
		[]
	)
};


const checkMatch = (strings, patterns) => {
	return !!strings.find(
		(s) => (matchMultiplePatterns(s, patterns).length > 0)
	);
};


const main = async (override = false) => {
	const $descriptions = document.querySelectorAll(`
		meta[name$="description"],
		meta[property$="description"]
	`);

	// site must have a description
	if ($descriptions && $descriptions.length) {
		const patterns = [/design/i];
		// 'design' does not necessarily have to be mentioned in the 
		// description, as long as it is a keyword
		
		const descriptionStr = $descriptions[0].getAttribute('content');
		let strings = [descriptionStr];

		const $keywords = document.querySelector('meta[name="keywords"]');
		if ($keywords) {
			const keywordsStr = $keywords.getAttribute('content');
			strings = [...strings, keywordsStr];
		}

		const isMatch = checkMatch(strings, patterns);
		if (isMatch || override) {
			// check if url is already in existing blocks
			const url = window.location.origin;
			const isNew = await checkUrl(url);

			if (isNew) {
				if (!confirm(descriptionStr)) {
					return;
				}
				return fetch(
					`https://api.are.na/v2/channels/${channelSlug}/blocks`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json; charset=utf-8',
							'X-AUTH-TOKEN': arenaAccessToken,
						},
						body: JSON.stringify({
							content: `# ${url}\n${description}`,
						}),
					}
				);
			} else {
				console.info('RRR: url exists already');
			}
		}
	} else {
		console.log('RRR: no description found');
	}
};


chrome.runtime.onMessage.addListener(
	async (req, sender, sendResponse) => {
		await main(true);
		sendResponse('ok');
	}
);


console.log('RRReady');
main();
