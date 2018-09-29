// all the referers we can use
const referers = [
  "https://www.facebook.com",
  "https://www.twitter.com",
  "https://www.instagram.com",
  "https://www.reddit.com",
  "https://www.google.com"
];

// new http header parameters to override
const newHeader = {
  referer: {
    name: "Referer",
    value: referers[Math.floor(Math.random() * referers.length)],
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
      "*://*.washingtonpost.com/*pwapi/*.js*",
      "*://*.washingtonpost.com/*drawbridge/drawbridge.js?_*",
    ]
  },
  wsj: {
    url: "*://*.wsj.com/*",
    js: [
      "*://*/*cxense-candy.js",
    ]
  },
  ft: {
    url: "*://*.ft.com/*",
  },
  nyt: {
    js: [
      "*://*.com/*mtr.js",
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
      "*://*.mercurynews.com/_static/*.js"
    ],
    cookies: true
  },
  wired: {
    url: "*://*.wired.com/*",
    cookies: true
  },
  medium: {
    url: "*://*.medium.com/*",
    js: [
      "*://cdn-static-1.medium.com/_/fp/gen-js/main-notes.bundle.*.js"
    ]
  },
  bostonglobe: {
    url: "*://*.bostonglobe.com/*",
    js: [
      "*://meter.bostonglobe.com/js/meter.js"
    ]
  },
  newyorker: {
    url: "*://*.newyorker.com/*",
    cookies: true
  },
  latimes: {
    url: "*://*.latimes.com/*",
    js: [
      "*://*.tribdss.com/meter/*"
    ]
  },
  theage: {
    url: "*://*.theage.com.au/*",
    cookies: true
  },
  chicagotribune: {
    url: "*://*.chicagotribune.com/*",
    cookies: true
  },
  hbr: {
    url: "*://*.hbr.org/*",
    js: [
        "*://*.hbr.org/resources/js/*"
    ]
  },
  economist: {
    url: "*://*.economist.com/*",
    cookies: true
  },
  seattletimes: {
    url: "*://*.seattletimes.com/*",
    js: [
        "*://*.matheranalytics.com/*"
    ],
    cookies: true
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
    var url = cookieBasedURLs[urlIndex];
    baseURL = url.substring(6, url.length - 2)
    chrome.cookies.getAll({domain: baseURL}, function(cookies) {
      for (var i = 0; i < cookies.length; i++) {
        console.log("OpenNews [DEBUG]: Clearing Cookies After Load");
        chrome.cookies.remove({url: (cookies[i].secure ? "https://" : "http://") + cookies[i].domain + cookies[i].path, name: cookies[i].name});

      }
    });
  }
}, {
  urls: ["<all_urls>"]
});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-124175680-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
