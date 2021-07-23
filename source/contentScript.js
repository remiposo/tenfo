const s = document.createElement('script');
s.src = chrome.runtime.getURL('tenfo.js');
document.body.appendChild(s);

s.onload = () => {
  const url = chrome.runtime.getURL('images/');
  const evt = document.createEvent('CustomEvent');
  evt.initCustomEvent('onloadTenfoExtension', true, true, url);
  document.dispatchEvent(evt);
};
