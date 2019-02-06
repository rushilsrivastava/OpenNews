document.arrive("body > script", function() {
    let script = this.innerHTML;
    if (script.includes("window.FT.flags")) {
        console.log("Disabling Paywall on FT.com");
        var flags = script.substring(script.lastIndexOf("window.FT.flags = ") + 18, script.lastIndexOf("window.FT.nUiConfig = "));
        flags = flags.replace(/ /g, '').replace(/;/g, '')
        flags = JSON.parse(flags);
        flags["disablePaywall"] = true;
        flags["ads"] = false;
        flags["adTargetingUserApi"] = false;
        flags = "window.FT.flags = " + JSON.stringify(flags) + ";";
        script = script.substring(0, script.lastIndexOf("window.FT.flags = ")) + flags + script.substring(script.lastIndexOf("window.FT.nUiConfig = "))
        this.innerHTML = script;
    }
});