const cfg = {
	arenaAccessToken,
	channelSlug,
	channelId,
	hostBlacklist,
};


const matchMultiplePatterns = (s, patterns) => {
	return patterns.reduce(
		(acc, pattern) => {
			const m = (s || '').match(pattern);
			return (!m)
				? acc
				: [...acc, m];
		},
		[]
	)
};


const checkMatch = (strings, patterns) => {
	return strings.find(
		(s) => (matchMultiplePatterns(s, patterns).length > 0)
	);
};


const main = async (override = false) => {
	const { host } = window.location;
	if (hostBlacklist.includes(host)) {
		return;
	}

	const $descriptions = document.querySelectorAll(`
		meta[name$="description"],
		meta[property$="description"]
	`);

	// site must have a description
	if ($descriptions && $descriptions.length) {
		const patterns = [/design/i];
		// 'design' does not necessarily have to be mentioned in the
		// description, as long as it is a keyword

		let strings = [];
		$descriptions.forEach(($desc) => {
			const descriptionStr = $desc.getAttribute('content');
			strings = [...strings, descriptionStr];
		});

		const $keywords = document.querySelector('meta[name="keywords"]');
		if ($keywords) {
			const keywordsStr = $keywords.getAttribute('content');
			strings = [...strings, keywordsStr];
		}

		const match = checkMatch(strings, patterns);
		const isMatch = !!match;
		if (isMatch || override) {
			// check if url is already in existing blocks
			const url = window.location.origin;
			chrome.runtime.sendMessage(
				{
					fn: 'isUrlNew',
					url,
					cfg,
				},
				{ /* options */ },
				(isNew) => {
					if (chrome.runtime.lastError) {
						console.warn(chrome.runtime.lastError.message);
					}
					if (isNew) {
						if (!confirm(match)) {
							return;
						}
						console.log('RRR: saving...');
						return chrome.runtime.sendMessage(
							{
								fn: 'addBlock',
								url,
								descriptionStr: match,
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
