const container = document.getElementById('list');
getBlockedFromStorage().then((urls) => {
	urls.forEach((url) => {
		const elem = document.createElement('div');

		const link = document.createElement('a');
		link.textContent = url;
		link.href = 'http://' + url;
		link.target = '_blank';

		const button = document.createElement('a');
		button.className = 'remove-btn';
		button.textContent = 'remove';
		button.onclick = (event) => {
			event.preventDefault();
			setBlocked(
				urls.filter((u) => u !== url)
			).then(
				() => window.location.reload()
			);
		};

		elem.appendChild(button);
		elem.appendChild(link);
		container.appendChild(elem);
	});
});
