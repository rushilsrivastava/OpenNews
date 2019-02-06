console.log("Disabling Paywall on WSJ.com");
// edit meta data
document.arrive('meta[name="cx_shield"]', function() {
    this.setAttribute("content", "{\"campaign\":2000,\"placement\":\"cx-articlecover\", \"tag\":\"default\", \"type\":\"free\"}");
});
// make free article in first meta JSON
document.arrive('script[type="application/ld+json"]', function() {
    let data = JSON.parse(this.innerHTML);
    data["isAccessibleForFree"] = "true";
    data["hasPart"]["isAccessibleForFree"] = "true";
    this.innerHTML = JSON.stringify(data);
});
// make free article in second meta JSON
document.arrive('#article_body > script[type="text/javascript"]', function() {
  	let script = this.innerHTML;
    if (script.includes("var utag_data =")) {
    	console.log("found")
    	let data = JSON.parse(script.replace("var utag_data =", '').replace(/ /g, '').replace(/;/g, ''))
	    data["page_access"] = "free";
	    data["cx_shield"] = {
	        "campaign": 2000,
	        "placement": "cx-articlecover",
	        "tag": "default",
	        "type": "free"
	    };
	    this.innerHTML = "var utag_data = " + JSON.stringify(data) + ";";
	}
});