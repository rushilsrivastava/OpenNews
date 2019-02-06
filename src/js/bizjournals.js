document.arrive('head > meta[name="metered_paywall:json"]', function() {
    let data = this.getAttribute('content');
    data = JSON.parse(data);
    data["unregistered_limit"] = "10000000";
    data["light_registered_limit"] = "10000000";
    data = JSON.stringify(data);
    this.setAttribute('content', data);
});
document.arrive('head > script[type="text/javascript"]', function() {
    let script = this.innerHTML;
    if (script.includes("window.__page__")) {
        script = script.replace("isPremium: true", "isPremium: false");
        this.innerHTML = script;
    }
});
window.onload = function() {
    console.log("Disabling Paywall on bizjournals.com");
    localStorage.clear();
    var disablePaywall = document.createElement("script");
    var code = 'aaData.isPremium = "no";';
    code = code + 'aaData.isPremiumPaywall = "no";';
    disablePaywall.innerHTML = code;
    document.head.appendChild(disablePaywall);
};