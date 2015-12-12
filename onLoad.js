// Inject script on every page load
var script = document.createElement('script');
script.src = chrome.extension.getURL("script.js");
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

/**
 * Stores the user comments banlist in chrome storage.
 */
window.addEventListener("StoreCommentBans", function(event) {
  chrome.storage.sync.set(event.detail, function() {
});}, false);

/**
 * Returns the user comments banlist from chrome storage.
 */
window.addEventListener("GetCommentBans", function(event) {
  chrome.storage.sync.get("RedditPlus_BlockedUserForComments", function (obj) {
    window.dispatchEvent(new CustomEvent("RetrievedCommentBans", { "detail": obj }));
});}, false);

/**
 * Stores the user name tags in chrome storage.
 */
window.addEventListener("StoreNameTags", function(event) {
  chrome.storage.sync.set(event.detail, function() {
});}, false);

/**
 * Returns the user name tags from chrome storage.
 */
window.addEventListener("GetNameTags", function(event) {
  chrome.storage.sync.get("RedditBuddy_NameTags", function (obj) {
    window.dispatchEvent(new CustomEvent("RetrievedNameTags", { "detail": obj }));
});}, false);

