const container = document.getElementById('list');
getBlockedFromStorage().then((urls) => {
	urls.forEach((url) => {
		const elem = document.createElement('div');

		const link = document.createElement('a');
		link.textContent = url;
		link.href = 'http://' + url;
		link.target = '_blank';

		const button = document.createElement('a');
		button.textContent = 'remove';
		button.style.marginRight = 10 + 'px';
		button.style.color = 'red';
		button.style.cursor = 'pointer';
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
