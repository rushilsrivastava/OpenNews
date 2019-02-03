window.onload = function () {
	console.log("Disabling Paywall on FT.com");
	var disablePaywall = document.createElement("script");
	var code = 'window.FT.flags["disablePaywall"] = true;';
	code = code + 'window.FT.flags["ads"] = false;';
	code = code + 'window.FT.flags["adTargetingUserApi"] = false;';
	disablePaywall.innerHTML = code;
	document.head.appendChild(disablePaywall);
}