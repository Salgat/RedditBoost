var script = document.createElement('script');
script.src = chrome.extension.getURL("script.js");

(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

// Handle chrome storage event requests
window.addEventListener("StoreObject", function(event) {
  chrome.storage.sync.set(event.detail, function() {
	console.log("Object saved");
});}, false);

window.addEventListener("GetObject", function(event) {
  chrome.storage.sync.get(event.detail, function (obj) {
    window.dispatchEvent(new CustomEvent("RetrievedObject", { "detail": obj }));
});}, false);