// Inject script on every page load
loadScript("/plugins/jquery.initialize/jquery.initialize.js");
loadScript("/js/Main.js");

function loadScript(scriptName) {
  var script = document.createElement('script');
  script.src = chrome.extension.getURL(scriptName);
  document.head.appendChild(script);
}

/**
 * Stores the user name tags in chrome storage.
 */
window.addEventListener("RedditBoost_StoreNameTags", function(event) {
  chrome.storage.sync.set(event.detail, function() {
});}, false);

/**
 * Returns the user name tags from chrome storage.
 */
window.addEventListener("RedditBoost_GetNameTags", function(event) {
  chrome.storage.sync.get("RedditBoost_NameTags", function (obj) {
    window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedNameTags", { "detail": obj }));
});}, false);


/**
 * Stores the user comments banlist in chrome storage.
 */
window.addEventListener("RedditBoost_StoreCommentBans", function(event) {
  chrome.storage.sync.set(event.detail, function() {
});}, false);

/**
 * Returns the user comments banlist from chrome storage.
 */
window.addEventListener("RedditBoost_GetCommentBans", function(event) {
  chrome.storage.sync.get("RedditBoost_BlockedUserForComments", function (obj) {
    window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedCommentBans", { "detail": obj }));
});}, false);


/**
 * Stores the user submissions banlist in chrome storage.
 */
window.addEventListener("RedditBoost_StoreSubmissionBans", function(event) {
  chrome.storage.sync.set(event.detail, function() {
});}, false);

/**
 * Returns the user submissions banlist from chrome storage.
 */
window.addEventListener("RedditBoost_GetSubmissionBans", function(event) {
  chrome.storage.sync.get("RedditBoost_BlockedUserForSubmissions", function (obj) {
    window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedSubmissionBans", { "detail": obj }));
});}, false);


/**
 * Stores the custom css banlist in chrome storage.
 */
window.addEventListener("RedditBoost_StoreCssBans", function(event) {
  chrome.storage.sync.set(event.detail, function() {
});}, false);

/**
 * Returns the custom css banlist from chrome storage.
 */
window.addEventListener("RedditBoost_GetCssBans", function(event) {
  chrome.storage.sync.get("RedditBoost_BlockedCss", function (obj) {
    window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedCssBans", { "detail": obj }));
});}, false);


/**
 * Stores the subreddit banlist in chrome storage.
 */
window.addEventListener("RedditBoost_StoreSubredditBans", function(event) {
  chrome.storage.sync.set(event.detail, function() {
});}, false);

/**
 * Returns the subreddit submissions banlist from chrome storage.
 */
window.addEventListener("RedditBoost_GetSubredditBans", function(event) {
  chrome.storage.sync.get("RedditBoost_BlockedSubreddits", function (obj) {
    window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedSubredditBans", { "detail": obj }));
});}, false);

/**
 * Stores the previewed links in chrome storage.
 */
window.addEventListener("RedditBoost_StorePreviewedLinks", function(event) {
  chrome.storage.local.set(event.detail, function() {
});}, false);

/**
 * Returns the previewed links from chrome storage.
 */
window.addEventListener("RedditBoost_GetPreviewedLinks", function(event) {
  chrome.storage.local.get("RedditBoost_PreviewedLinks", function (obj) {
    window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedPreviewedLinks", { "detail": obj }));
});}, false);

/**
 * Returns the number of bytes in use for previewed links.
 */
window.addEventListener("RedditBoost_GetPreviewedLinksSize", function(event) {
  chrome.storage.local.getBytesInUse("RedditBoost_PreviewedLinks", function (size) {
    window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedPreviewedLinksSize", { "detail": size }));
});}, false);