const cfg = {
	arenaAccessToken,
	channelSlug,
	channelId,
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
			chrome.runtime.sendMessage(
				{
					fn: 'checkUrl',
					url,
					cfg,
				},
				(isNew) => {
					if (isNew) {
						if (!confirm(descriptionStr)) {
							return;
						}
						console.log('RRR: saving...');
						return chrome.runtime.sendMessage(
							{
								fn: 'addBlock',
								url,
								descriptionStr,
								cfg,
							},
							(res) => {
								console.log(res);
							}
						);
					} else {
						console.info('RRR: url exists already');
					}
				}
			);
		}
	} else {
		console.log('RRR: no description found');
	}
};


chrome.runtime.onMessage.addListener(
	async (req, sender, sendResponse) => {
		await main(true);
		// sendResponse('ok');
	}
);


console.log('RRReady');
main();
