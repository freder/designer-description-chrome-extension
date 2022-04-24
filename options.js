/* global hostBlacklist, setBlocked, getBlockedFromStorage */

function populateHardcodedList() {
	const container = document.getElementById('list-hardcoded');
	hostBlacklist.forEach((url) => {
		const elem = document.createElement('div');

		const link = document.createElement('a');
		link.textContent = url;
		link.href = 'http://' + url;
		link.target = '_blank';

		elem.appendChild(link);
		container.appendChild(elem);
	});
}

function populateList() {
	const container = document.getElementById('list');

	const removeAllButton = document.getElementById('remove-all');
	removeAllButton.onclick = (event) => {
		console.log('here');
		event.preventDefault();
		setBlocked([]).then(
			() => window.location.reload()
		);
	};

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
}

populateHardcodedList();
populateList();
