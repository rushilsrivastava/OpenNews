// new http header parameters to override
const newHeader = {
  referer: {
    name: "Referer",
    value: "https://www.facebook.com", // or "https://www.twitter.com"
  },
  cookie: {
    name: "Cookie",
    value: ""
  },
  cachecontrol: {
    name: "Cache-Control",
    value: "max-age=0"
  }
};

// sites that we want to access
const sites = {
  washingtonpost: {
    js: [
      "*://*.washingtonpost.com/*pwapi/*.js*", // this one causes paywall/ad-wall lightbox for every article
      "*://*.washingtonpost.com/*drawbridge/drawbridge.js?_*", // this one causes paywall/ad-wall lightbox sometimes with Adblock Plus enabled
    ]
  },
  wsj: {
    url: "*://*.wsj.com/*",
    js: [
      "*://*/*cxense-candy.js", // this one causes a pop up advertisement for every article
    ]
  },
  ft: {
    url: "*://*.ft.com/*",
  },
  nyt: {
    js: [
      "*://*.com/*mtr.js", // this one causes a pop up asking for subscription
    ]
  },
  bloomberg: {
    url: "*://*.bloomberg.com/*",
    js: [
      "*://*.bwbx.io/s3/javelin/public/javelin/js/pianola/*",
    ]
  },
  bizjournals: {
    url: "*://*.bizjournals.com/*",
    js: [
      "*://*.bizjournals.com/dist/js/article.min.js*"
    ]
  },
  philly: {
    url: "*://*.philly.com/*",
  },
  kleinezeitung: {
    url: "*://*.kleinezeitung.at/*",
  },
  globeandmail: {
    js: [
      "*://*.theglobeandmail.com/pb/gr/c/default/*/story-bundle/*.js*"
    ]
  },
  nydailynews: {
    url: "*://*.nydailynews.com/*",
    js: [
      "*://*.tribdss.com/reg/tribune/*"
    ]
  },
  mercurynews: {
    url: "*://*.mercurynews.com/*",
    js: [
      "*://*.mercurynews.com/_static/*.js*"
    ]
  },
  wired: {
    url: "*://*.wired.com/*",
    cookies: true
  },
  medium: {
    url: "*://*.medium.com/*",
    js: [
      "*://cdn-static-1.medium.com/_/fp/gen-js/main-notes.bundle.84wyUGxUdUkjDoQr9oYsLg.js"
    ]
  },
  bostonglobe: {
    url: "*://*.bostonglobe.com/*",
    js: [
      "*://meter.bostonglobe.com/js/meter.js"
    ]
  }
};

// extract all script urls we want to block
var scriptURLs = Object.values(sites)
  .map(site => site.js)
  .filter(Array.isArray)
  .reduce((prev, curr) => prev.concat(curr), []);

// extract all main_frame urls we want to override
var mainFrameURLs = Object.values(sites)
  .map(site => site.url)
  .filter(url => url);

// extract all cookie based blocking
var cookieBasedURLs = Object.values(sites)
  .filter(site => {return site.cookies == true})
  .map(site => site.url);

// add Firefox and Edge support with the global `browser` object
browser = typeof browser !== "undefined" ? browser : chrome;

browser.webRequest.onBeforeRequest.addListener(
  function() {
    console.log("OpenNews [DEBUG]: Blocking Paywall Javascripts");

    return {
      cancel: true
    };
  }, {
    urls: scriptURLs,
    // target is script
    types: ["script"]
  }, ["blocking"]
);

browser.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    console.log("OpenNews [DEBUG]: Modifying Request Headers");

    // remove existing referer and cookie
    for (let i = 0; i < details.requestHeaders.length; i++) {
      if (details.requestHeaders[i].name === newHeader.referer.name || details.requestHeaders[i].name === newHeader.cookie.name) {
        details.requestHeaders.splice(i, 1);
        i--;
      }
    }

    // add new referer
    details.requestHeaders.push(newHeader.referer);
    // remove cache
    details.requestHeaders.push(newHeader.cachecontrol);

    return {
      requestHeaders: details.requestHeaders
    };
  }, {
    urls: mainFrameURLs,
    // target is the document that is loaded for a top-level frame
    types: ["main_frame"]
  }, ["blocking", "requestHeaders"]
);

chrome.webRequest.onCompleted.addListener(function(details) {
  for (var urlIndex in cookieBasedURLs) {
    console.log("OpenNews [DEBUG]: Clearing cookies after load");
    var url = cookieBasedURLs[urlIndex];
    baseURL = url.substring(6, url.length - 2)
    chrome.cookies.getAll({domain: baseURL}, function(cookies) {
      for (var i = 0; i < cookies.length; i++) {

        var protocol = cookies[i].secure ? 'https://' : 'http://';

        chrome.cookies.remove({url: protocol + cookies[i].domain + cookies[i].path, name: cookies[i].name});

      }
    });
  }
}, {
  urls: ["<all_urls>"]
});
