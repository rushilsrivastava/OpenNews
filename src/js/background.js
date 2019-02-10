// all the referers we can use
const referers = [
  "https://www.facebook.com", "https://news.google.com", "https://www.google.com"
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

// sites with blocking strategy
const sites = {
  washingtonpost: {
    js: ["*://*.washingtonpost.com/*pwapi/*.js*", "*://*.washingtonpost.com/*drawbridge/drawbridge.js?_*"]
  },
  wsj: {
    url: "*://*.wsj.com/*",
    js: ["*://sts3.wsj.net/iweb/static_html_files/cxense-candy.js", "*://tags.tiqcdn.com/utag/wsjdn/wsj/prod/utag*"],
    cookies: true
  },
  ft: {
    url: "*://*.ft.com/*"
  },
  nyt: {
    url: "*://*.nytimes.com/*",
    js: ["*://meter-svc.nytimes.com/*", ]
  },
  bloomberg: {
    url: "*://*.bloomberg.com/*",
    js: ["*://*.bwbx.io/s3/fence/v4/app.bundle.js"]
  },
  bizjournals: {
    url: "*://*.bizjournals.com/*",
    js: ["*://*.bizjournals.com/dist/js/58.min.js?*"],
    cookies: true
  },
  philly: {
    url: "*://*.philly.com/*",
    cookies: true
  },
  kleinezeitung: {
    url: "*://*.kleinezeitung.at/*",
    cookies: true
  },
  globeandmail: {
    url: "*://*.theglobeandmail.com/*",
    js: ["*://*.theglobeandmail.com/pb/gr/c/default/*/story-bundle-js/*.js*"]
  },
  nydailynews: {
    url: "*://*.nydailynews.com/*",
    js: ["*://*.tribdss.com/reg/tribune/*"]
  },
  mercurynews: {
    url: "*://*.mercurynews.com/*",
    js: ["*://*.mercurynews.com/_static/*.js"],
    cookies: true
  },
  wired: {
    url: "*://*.wired.com/*",
    cookies: true
  },
  medium: {
    url: "*://*.medium.com/*",
    js: ["*://cdn-static-1.medium.com/_/fp/gen-js/main-notes.bundle.*.js"]
  },
  bostonglobe: {
    url: "*://*.bostonglobe.com/*",
    js: ["*://meter.bostonglobe.com/js/meter.js"]
  },
  newyorker: {
    url: "*://*.newyorker.com/*",
    cookies: true
  },
  latimes: {
    url: "*://*.latimes.com/*",
    js: ["*://*.tribdss.com/meter/*"]
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
    js: ["*://*.hbr.org/resources/js/*"]
  },
  economist: {
    url: "*://*.economist.com/*",
    cookies: true
  },
  seattletimes: {
    url: "*://*.seattletimes.com/*",
    js: ["*://*.matheranalytics.com/*"],
    cookies: true
  },
  dn: {
    url: "*://*.dn.se/*",
    js: ["*://auth.dn.se/*"]
  },
  barrons: {
    url: "*://*.barrons.com/*",
    cookies: true
  },
  dailypress: {
    url: "*://*.dailypress.com/*",
    js: ["*://*.tribdss.com/meter/*"]
  },
  denverpost: {
    url: "*://*.denverpost.com/*",
    js: ["*://*.matheranalytics.com/*"],
    cookies: true
  },
  dynamed: {
    url: "*://*.dynamed.com/*",
    cookies: true
  },
  newyorker: {
    url: "*://*.newyorker.com/*",
    cookies: true
  },
  technologyreview: {
    url: "*://*.technologyreview.com/*",
    js: ["*://cdn.technologyreview.com/_/dist/js/article.js?v=*"]
  },
  foreignpolicy: {
    url: "*://*.foreignpolicy.com/*",
    js: ["*://validate.onecount.net/js/all.min.js"],
    cookies: true
  },
  sunsentinel: {
    url: "*://*.sun-sentinel.com/*",
    js: ["*://ssor.tribdss.com/*"]
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
  .filter(site => {
    return site.cookies == true
  })
  .map(site => site.url);

// add firefox and edge support with the global `browser` object #5
browser = typeof browser !== "undefined" ? browser : chrome;

// script blocking
browser.webRequest.onBeforeRequest.addListener(function(details) {
  var url = new URL(details.url)
    .hostname
  console.log(`OpenNews [DEBUG]: Blocking Paywall Javascripts from ${url}`);
  return {
    cancel: true
  };
}, {
  urls: scriptURLs,
  types: ["script"]
}, ["blocking"]);

// header blocking
browser.webRequest.onBeforeSendHeaders.addListener(function(details) {
  var url = new URL(details.url).hostname
  console.log(`OpenNews [DEBUG]: Modifying Request Headers on ${url}.`);
  // remove existing referer and cookie
  for (let i = 0; i < details.requestHeaders.length; i++) {
    if (details.requestHeaders[i].name === newHeader.referer.name || details.requestHeaders[i].name === newHeader.cookie
      .name) {
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
  types: ["main_frame"]
}, ["blocking", "requestHeaders", "extraHeaders"]);

// cookie blocking
browser.webRequest.onCompleted.addListener(function(details) {
  var url = new URL(details.url)
    .hostname;
  var baseURL = url.replace("www", ""); // temporay work around
  browser.cookies.getAll({
    domain: baseURL
  }, function(cookies) {
    for (var i = 0; i < cookies.length; i++) {
      console.log(`OpenNews [DEBUG]: Clearing Cookies After Load from ${url}`);
      browser.cookies.remove({
        url: (cookies[i].secure ? "https://" : "http://") + cookies[i].domain + cookies[i].path,
        name: cookies[i].name
      });
    }
  });
}, {
  urls: cookieBasedURLs
});

// analytics

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-124175680-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();