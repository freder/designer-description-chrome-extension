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


const main = async () => {
	const $descriptions = document.querySelectorAll(`
		meta[name$="description"],
		meta[property$="description"]
	`);

	// site must have a description
	if ($descriptions && $descriptions.length) {
		const kw = 'design';
		// 'design' does not necessarily have to be mentioned in the 
		// description, as long as it is a keyword
		const $keywords = document.querySelector('meta[name="keywords"]');
		const description = $descriptions[0].getAttribute('content');
		const isMatch = description.includes(kw) || (
			$keywords && $keywords.getAttribute('content').includes(kw)
		);

		if (isMatch) {
			// check if url is already in existing blocks
			const url = window.location.origin;
			const isNew = await checkUrl(url);

			if (isNew) {
				if (!confirm(description)) {
					return;
				}
				fetch(
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
			} /*else {
				console.info(`url exists already: ${url}`);
			}*/
		}
	}
};


main();
