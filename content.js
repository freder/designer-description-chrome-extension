const arenaAccessToken = '...';
const channelSlug = 'designer-studio-self-descriptions';
const channelId = '269319';


// TODO: also check keywords


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
			// console.log(contents.total_pages);
			// console.log(contents.current_page);
			// console.log(contents.per);
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

	if ($descriptions && $descriptions.length) {
		const description = $descriptions[0].getAttribute('content');
		if (description.includes('design')) {
			alert(description);

			// check if url is already in existing blocks
			const url = window.location.origin;
			const isNew = await checkUrl(url);
			if (isNew) {
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
