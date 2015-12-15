// Inject script on every page load
var script = document.createElement('script');
script.src = chrome.extension.getURL("script.js");
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);


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
  chrome.storage.sync.get("RedditBoost_NameTags", function (obj) {
    window.dispatchEvent(new CustomEvent("RetrievedNameTags", { "detail": obj }));
});}, false);


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
 * Stores the user submissions banlist in chrome storage.
 */
window.addEventListener("StoreSubmissionBans", function(event) {
  chrome.storage.sync.set(event.detail, function() {
});}, false);

/**
 * Returns the user submissions banlist from chrome storage.
 */
window.addEventListener("GetSubmissionBans", function(event) {
  chrome.storage.sync.get("RedditPlus_BlockedUserForSubmissions", function (obj) {
    window.dispatchEvent(new CustomEvent("RetrievedSubmissionBans", { "detail": obj }));
});}, false);

/**
 * Stores the custom css banlist in chrome storage.
 */
window.addEventListener("StoreCssBans", function(event) {
  chrome.storage.sync.set(event.detail, function() {
});}, false);

/**
 * Returns the custom css banlist from chrome storage.
 */
window.addEventListener("GetCssBans", function(event) {
  chrome.storage.sync.get("RedditPlus_BlockedCss", function (obj) {
    window.dispatchEvent(new CustomEvent("RetrievedCssBans", { "detail": obj }));
});}, false);