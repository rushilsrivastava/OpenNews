var url = window.location.href;
var redirect = true;

if (url.indexOf('?mod=rsswn') != -1)
    redirect = false;
else if (url.indexOf('&mod=rsswn') != -1)
    redirect = false;

// redirect
if (redirect) {
	console.log("Disabling Paywall on WSJ.com");
	window.location = '//' + location.host + location.pathname + '?mod=rsswn';
}
