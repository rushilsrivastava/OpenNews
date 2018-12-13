window.onload = function () {
	console.log("Disabling Paywall on FT.com");
	var disablePaywall = document.createElement("script");
	disablePaywall.innerHTML = "window.FT.flags[\"disablePaywall\"] = true;"
	document.head.appendChild(disablePaywall);
}