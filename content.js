const $keywords = document.querySelector('meta[name="keywords"]');
if ($keywords) {
	const keywords = $keywords.getAttribute('content');
	const isDesign = keywords.includes('design');
	const $description = document.querySelector('meta[name="description"]');
	if ($description && isDesign) {
		const description = $description.getAttribute('content');
		alert(description);
	}
}
