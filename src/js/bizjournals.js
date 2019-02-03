window.onload = function () {
	console.log("Disabling Paywall on bizjournals.com");
	localStorage.clear();
	var disablePaywall = document.createElement("script");
	var code = 'aaData.isPremium = "no";';
	code = code + 'aaData.isPremiumPaywall = "no";';
	disablePaywall.innerHTML = code;
	document.head.appendChild(disablePaywall);
};