/* global chrome, arenaAccessToken, channelSlug, channelId, hostBlacklist, getBlockedFromStorage, setBlocked */

// gets passed to background.js
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
	);
};


const checkMatch = (strings, patterns) => {
	return strings.find(
		(s) => (matchMultiplePatterns(s, patterns).length > 0)
	);
};


const forgetHandler = (blockedHosts, host) => {
	setBlocked([...blockedHosts, host]);
};


const saveHandler = (url, match) => {
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
};


const removeDialog = () => {
	const dialog = document.getElementById('rrr-dialog');
	dialog.remove();
};


const showDialog = (match, url, blockedHosts, host) => {
	const dialog = document.createElement('div');
	dialog.id = 'rrr-dialog';
	dialog.style.position = 'absolute';
	dialog.style.top = '0';
	dialog.style.right = '0';
	dialog.style.zIndex = '9999999';
	dialog.style.padding = '20px';
	dialog.style.border = 'solid 4px blue';
	dialog.style.background = 'white';
	dialog.style.color = 'black';
	dialog.style.fontFamily = 'sans-serif';
	dialog.style.fontSize = '16px';
	dialog.style.lineHeight = '1.2';
	dialog.style.width = '350px';
	dialog.style.lineBreak = 'anywhere';
	const btnStyle = [
		'color: blue',
		'text-decoration: none',
		'cursor: pointer',
		'border: none',
	].join('; ');
	dialog.innerHTML = `
		<div>${match}</div>
		<div style="font-size: 2em; margin-top: 0.15em">
			<a class="cancel-btn" style="float: left; ${btnStyle}">forget</a>
			<a class="save-btn" style="float: right; ${btnStyle}">save</a>
		</div>
	`;
	document.body.appendChild(dialog);
	const saveBtn = dialog.querySelector('.save-btn');
	saveBtn.addEventListener('click', () => {
		saveHandler(url, match);
		removeDialog();
	});
	const cancelBtn = dialog.querySelector('.cancel-btn');
	cancelBtn.addEventListener('click', () => {
		forgetHandler(blockedHosts, host);
		removeDialog();
	});
};


const main = async (override = false) => {
	const { host } = window.location;
	if (hostBlacklist.includes(host)) {
		console.log('RRR: blocked (config)');
		return;
	}

	const blockedHosts = await getBlockedFromStorage();
	if (blockedHosts.includes(host)) {
		console.log('RRR: blocked (storage)');
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
		const isMatch = Boolean(match);
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
						showDialog(match, url, blockedHosts, host);
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
	async (/*req, sender, sendResponse*/) => {
		await main(true);
		// sendResponse('ok');
	}
);


console.log('RRReady');
let ran = false;

// since chrome will automatically close dialogs in new tabs,
// let't wait until the tab becomes active
// document.addEventListener('visibilitychange', () => {
// 	if (document.visibilityState === 'visible' && !ran) {
// 		ran = true;
// 		setTimeout(main, 300);
// 	}
// });

if (!ran) {
	ran = true;
	setTimeout(main, 500);
}
