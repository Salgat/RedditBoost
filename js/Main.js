var utils;
(function (utils) {
    var Singleton = (function () {
        function Singleton() {
        }
        Singleton.prototype._setSingleton = function () {
            if (this._initialized)
                throw Error('Singleton is already initialized.');
            this._initialized = true;
        };
        Object.defineProperty(Singleton.prototype, "setSingleton", {
            get: function () { return this._setSingleton; },
            enumerable: true,
            configurable: true
        });
        return Singleton;
    })();
    utils.Singleton = Singleton;
})(utils || (utils = {}));
/// <reference path="../utils/Singleton.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Tag users
 */
var RedditBoostPlugin;
(function (RedditBoostPlugin) {
    var TagUserPlugin = (function (_super) {
        __extends(TagUserPlugin, _super);
        function TagUserPlugin() {
            _super.apply(this, arguments);
            this._tagsLoaded = false;
            this._userTags = {};
        }
        Object.defineProperty(TagUserPlugin.prototype, "init", {
            get: function () { return this._init; },
            enumerable: true,
            configurable: true
        });
        TagUserPlugin.prototype._init = function () {
            var _this = this;
            this.setSingleton();
            // Update add tag tagline entries for newly loaded comments
            $(".entry").initialize(function (index) {
                if (_this._tagsLoaded && !$(index.currentTarget).find('.addTagName').length) {
                    _this._addTagOption(index.currentTarget);
                }
            });
            // Display tagging popup.
            $(document).on("click", ".addTagName", function (index) {
                _this._showTagPopup(index);
            });
            // Close tagging popup.
            $(document).on("click", "#closeTag", function (event) {
                $('#taggingPopup').remove();
            });
            // Add click listener for tagging a user.
            $(document).on("click", "#saveTag", function (index) {
                _this._saveTag(index);
            });
            // Handle event to process retrieved tags from memory
            window.addEventListener("RedditBoost_RetrievedNameTags", function (event) {
                _this._handleRetrievedTags(event);
            });
            // Initiate event to get banned users list and collapse all comments by those users
            window.dispatchEvent(new CustomEvent("RedditBoost_GetNameTags"));
        };
        /**
         * Load tags and tagging interface onto page.
         */
        TagUserPlugin.prototype._handleRetrievedTags = function (event) {
            var _this = this;
            if (event.detail.hasOwnProperty("RedditBoost_NameTags")) {
                this._userTags = event.detail["RedditBoost_NameTags"];
            }
            // Go through each user and add their tag (if it exists)
            $(".entry").each(function (index, elem) {
                _this._addTagOption(elem);
            });
            this._tagsLoaded = true;
        };
        /**
         * Adds "add tag" tagline option to provided entry
         */
        TagUserPlugin.prototype._addTagOption = function (entry) {
            if (!$(entry).closest('.deleted').length && !$(entry).find('.morecomments').length && !$(entry).find('.deepthread').length) {
                var user = $(entry).children(".tagline").children(".author").text();
                var addText = "add tag";
                var tagline = $(entry).children(".tagline");
                if (RedditBoostPlugin.TagUser._userTags != null && RedditBoostPlugin.TagUser._userTags.hasOwnProperty(user)) {
                    var tagName = RedditBoostPlugin.TagUser._userTags[user].tag;
                    tagline.children(".author").after("<span class='userTag' style='margin-right: 5px;" + RedditBoostPlugin.TagUser._userTags[user].tagColor + "'>" + tagName + "</a>");
                    addText = "update tag";
                }
                // Also add a tagging button
                tagline.append("<a href='javascript:void(0)' class='RedditBoostTaglineEntry addTagName' data-username='" + user + "'>" + addText + "</a>");
            }
        };
        /**
         * Display tagging popup.
         */
        TagUserPlugin.prototype._showTagPopup = function (index) {
            var userName = $(index.currentTarget).attr("data-username");
            var offset = $(index.currentTarget).offset();
            $('body').append(TagUserPlugin._tagHtmlPopup);
            $("#taggingTitle").text($("#taggingTitle").text().replace("{username}", userName));
            $('#taggingPopup').offset({ top: offset.top + 15, left: offset.left });
            $('#saveTag').attr("data-username", userName);
        };
        /**
         * Using tag popup, saves tag for user.
         */
        TagUserPlugin.prototype._saveTag = function (index) {
            var _this = this;
            var userName = $(index.currentTarget).attr("data-username");
            var tag = $('#tagInput').val();
            var tagColor = $('#colorSelector option:selected').attr('style');
            // Save Tag
            if (tag != null) {
                if (tag == "") {
                    // Empty string, remove tag
                    delete this._userTags[userName];
                }
                else {
                    this._userTags[userName] = { "tag": tag, "tagColor": tagColor };
                }
                var tagsList = {};
                tagsList["RedditBoost_NameTags"] = this._userTags;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreNameTags", { "detail": tagsList }));
                // Go through each user and add their tag (if it exists)
                $(".entry").each(function (index, elem) {
                    var tagline = $(elem).children(".tagline");
                    var user = tagline.children(".author").text();
                    if (user == userName) {
                        var tagName = "";
                        if (_this._userTags[user] != null) {
                            tagName = _this._userTags[user].tag;
                        }
                        if (tag == "" || tagName == "") {
                            // Remove tag
                            tagline.children('.userTag').remove();
                        }
                        else if (tagline.children('.userTag').length) {
                            tagline.children('.userTag').text(tagName).attr('style', _this._userTags[user].tagColor);
                        }
                        else {
                            tagline.children(".author").after("<span class='userTag' style='margin-right: 5px;" + _this._userTags[user].tagColor + "'>" + tagName + "</a>");
                        }
                        var addText = "update tag";
                        if (tag == "") {
                            addText = "add tag";
                        }
                        // Also update the tagging button
                        tagline.children(".addTagName").text(addText);
                    }
                });
            }
            $('#taggingPopup').remove();
        };
        TagUserPlugin._tagHtmlPopup = "<div id='taggingPopup'>																		\
							<h3 id='taggingTitle'>Tag {username}</h3>																		\
							<div id='closeTag'>×</div>																						\
							<div id='taggingContents'>																						\
								<form id='tagginForm' name='taggingForm' action='javascript:void(0)'>										\
									<label class='tagPopupLabel'>Tag</label>																\
									<input id='tagInput' type='text'></input>																\
									<label class='tagPopupLabel'>Color</label>																\
									<select id='colorSelector'>																				\
										<option style='background-color: transparent; color: black !important;' value='none'>none</option>	\
										<option style='background-color: aqua; color: black !important;' value='aqua'>aqua</option>			\
										<option style='background-color: black; color: white !important;' value='black'>black</option>		\
										<option style='background-color: blue; color: white !important;' value='blue'>blue</option>			\
										<option style='background-color: fuchsia; color: white !important;' value='fuchsia'>fuchsia</option>\
										<option style='background-color: pink; color: black !important;' value='pink'>pink</option>			\
										<option style='background-color: gray; color: white !important;' value='gray'>gray</option>			\
										<option style='background-color: green; color: white !important;' value='green'>green</option>		\
										<option style='background-color: lime; color: black !important;' value='lime'>lime</option>			\
										<option style='background-color: maroon; color: white !important;' value='maroon'>maroon</option>	\
										<option style='background-color: navy; color: white !important;' value='navy'>navy</option>			\
										<option style='background-color: olive; color: white !important;' value='olive'>olive</option>		\
										<option style='background-color: orange; color: white !important;' value='orange'>orange</option>	\
										<option style='background-color: purple; color: white !important;' value='purple'>purple</option>	\
										<option style='background-color: red; color:  white !important;' value='red'>red</option>			\
										<option style='background-color: silver; color: black !important;' value='silver'>silver</option>	\
										<option style='background-color: teal; color: white !important;' value='teal'>teal</option>			\
										<option style='background-color: white; color: black !important;' value='white'>white</option>		\
										<option style='background-color: yellow; color: black !important;' value='yellow'>yellow</option>	\
									</select>																								\
									<input type='submit' id='saveTag' data-username='' value='save tag'>									\
								</form>																										\
							</div>																											\
						</div>                                                                                                             ";
        return TagUserPlugin;
    })(utils.Singleton);
    RedditBoostPlugin.TagUser = new TagUserPlugin();
})(RedditBoostPlugin || (RedditBoostPlugin = {}));
/// <reference path="../utils/Singleton.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />
/**
 * Block specific user's comments
 */
var RedditBoostPlugin;
(function (RedditBoostPlugin) {
    var BanUserCommentsPlugin = (function (_super) {
        __extends(BanUserCommentsPlugin, _super);
        function BanUserCommentsPlugin() {
            _super.apply(this, arguments);
            this._bannedUsers = [];
            this._hideLoaded = false;
        }
        Object.defineProperty(BanUserCommentsPlugin.prototype, "init", {
            get: function () { return this._init; },
            enumerable: true,
            configurable: true
        });
        BanUserCommentsPlugin.prototype._init = function () {
            var _this = this;
            this.setSingleton();
            // Add click listener for blocking a user's comments.
            $(document).on("click", ".unblockUserComments", function (event) {
                _this._blockOrUnblockUserComments(event.currentTarget, _this._bannedUsers, false);
            });
            /// Add click listener for unblocking a user's comments.
            $(document).on("click", ".blockUserComments", function (event) {
                _this._blockOrUnblockUserComments(event.currentTarget, _this._bannedUsers, true);
            });
            /**
             * Update newly loaded comments for both the tagline and hiding
             */
            $(".author").initialize(function (index) {
                if (_this._hideLoaded) {
                    _this._hideUserIfBanned(index.currentTarget);
                }
            });
            /**
             * Update newly loaded comments for both the tagline and hiding
             */
            $(".comment").initialize(function (index) {
                if (_this._hideLoaded) {
                    _this._addBlockOptionTagline(index.currentTarget);
                }
            });
            window.addEventListener("RedditBoost_RetrievedCommentBans", function (event) {
                _this._handleRetrievedCommentBans(event);
            });
            window.dispatchEvent(new CustomEvent("RedditBoost_GetCommentBans"));
        };
        /**
         * Block banned user comments and add block option next to usernames.
         */
        BanUserCommentsPlugin.prototype._handleRetrievedCommentBans = function (event) {
            var _this = this;
            if (!event.detail.hasOwnProperty("RedditBoost_BlockedUserForComments")) {
                // Create a new empty entry in storage
                var bannedList = {};
                bannedList["RedditBoost_BlockedUserForComments"] = this._bannedUsers;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreCommentBans", { "detail": bannedList }));
            }
            else {
                this._bannedUsers = event.detail["RedditBoost_BlockedUserForComments"];
            }
            // Go through each user and add a class to hide if matching
            $(".author").each(function (index, elem) {
                _this._hideUserIfBanned(elem);
            });
            // Add option to block or unblock a user
            $(".comment").each(function (index, elem) {
                _this._addBlockOptionTagline(elem);
            });
            this._hideLoaded = true;
        };
        /**
         * Add class to hide if matching banlist.
         */
        BanUserCommentsPlugin.prototype._hideUserIfBanned = function (element) {
            var comment = $(element).parent().parent().parent();
            if (this._bannedUsers != null && this._bannedUsers.indexOf($(element).text()) >= 0 && comment.attr("data-type") == "comment") {
                comment.removeClass("noncollapsed").addClass("collapsed");
            }
        };
        /**
         * Adds option to block user's comments in tagline.
         */
        BanUserCommentsPlugin.prototype._addBlockOptionTagline = function (element) {
            var user = $(element).children(".entry").children(".tagline").children(".author").text();
            var tagline = $(element).children(".entry").children(".tagline");
            if (this._bannedUsers != null && this._bannedUsers.indexOf(user) >= 0) {
                // Unhide
                tagline.append(this._tagLineSpan(user, "unblockUserComments", "show user comments"));
            }
            else {
                // Hide
                tagline.append(this._tagLineSpan(user, "blockUserComments", "hide user comments"));
            }
        };
        /**
         * Return span element HTML to append to tagline for showing or hiding comments.
         * @param {string} userName The username this element belongs to
         * @param {string} classToAdd The class to add (either blockUserComments or unblockUserComments)
         * @param {string} textToAdd The text displayed to the user to click
         */
        BanUserCommentsPlugin.prototype._tagLineSpan = function (userName, classToAdd, textToAdd) {
            return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry hideTaglineEntry" + "' data-username='" + userName + "'>" + textToAdd + "</a>";
        };
        /**
        * Blocks or unblocks a user's comments based on parameters.
        * @param {object} thisElement The element of the comment.
        * @param {array} bannedUsers An array of banned users.
        * @param {bool} isBlocking Whether to block or not the user's comments.
        */
        BanUserCommentsPlugin.prototype._blockOrUnblockUserComments = function (thisElement, bannedUsers, isBlocking) {
            var blockingClass;
            if (!isBlocking) {
                blockingClass = ".unblockUserComments";
            }
            else {
                blockingClass = ".blockUserComments";
            }
            var textHeadline;
            if (!isBlocking) {
                textHeadline = "hide user comments";
            }
            else {
                textHeadline = "show user comments";
            }
            if (bannedUsers == null)
                bannedUsers = [];
            var userToChange = $(thisElement).attr("data-username");
            var blockedIndex = bannedUsers.indexOf(userToChange);
            if ((isBlocking && blockedIndex < 0) || (!isBlocking)) {
                if (isBlocking) {
                    bannedUsers.push(userToChange);
                }
                else {
                    bannedUsers.splice(blockedIndex, 1);
                }
                var bannedList = {};
                bannedList["RedditBoost_BlockedUserForComments"] = bannedUsers;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreCommentBans", { "detail": bannedList }));
                $("*[data-type='comment']").each(function (index, thisComment) {
                    if ($(thisComment).children(".entry").children(".tagline").children(".author").text() == userToChange) {
                        var textElement = $(thisComment).children(".entry").children(".tagline").children(blockingClass);
                        textElement.text(textHeadline);
                        if (isBlocking) {
                            textElement.removeClass("blockUserComments").addClass("unblockUserComments");
                            $(thisComment).removeClass("noncollapsed").addClass("collapsed");
                        }
                        else {
                            textElement.removeClass("unblockUserComments").addClass("blockUserComments");
                            $(thisComment).removeClass("collapsed").addClass("noncollapsed");
                        }
                    }
                });
            }
        };
        return BanUserCommentsPlugin;
    })(utils.Singleton);
    RedditBoostPlugin.BanUserComments = new BanUserCommentsPlugin();
})(RedditBoostPlugin || (RedditBoostPlugin = {}));
/// <reference path="../utils/Singleton.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />
/**
 * Block specific user's submission
 */
var RedditBoostPlugin;
(function (RedditBoostPlugin) {
    var BanUserSubmissionsPlugin = (function (_super) {
        __extends(BanUserSubmissionsPlugin, _super);
        function BanUserSubmissionsPlugin() {
            _super.apply(this, arguments);
            this._bannedSubmissionUsers = [];
            this._hideLoaded = false;
        }
        Object.defineProperty(BanUserSubmissionsPlugin.prototype, "init", {
            get: function () { return this._init; },
            enumerable: true,
            configurable: true
        });
        BanUserSubmissionsPlugin.prototype._init = function () {
            var _this = this;
            this.setSingleton();
            // Add click listener for blocking a user's submissions.
            $(document).on("click", ".blockUserSubmissions", function (event) {
                _this._blockUserSubmissions(event.currentTarget);
            });
            // Add click listener for unblocking a user's submissions.
            $(document).on("click", ".unblockUserSubmissions", function (event) {
                _this._unblockUserSubmissions(event.currentTarget);
            });
            // Initiates user submission blocking upon receiving the banned users list from storage.
            window.addEventListener("RedditBoost_RetrievedSubmissionBans", function (event) {
                _this._retrievedSubmissionsBans(event);
            }, false);
            // When page loads, initiate event to get banned users list and collapse all submissions by those users
            window.dispatchEvent(new CustomEvent("RedditBoost_GetSubmissionBans"));
        };
        BanUserSubmissionsPlugin.prototype._retrievedSubmissionsBans = function (event) {
            var _this = this;
            if (!event.detail.hasOwnProperty("RedditBoost_BlockedUserForSubmissions")) {
                // Create a new empty entry in storage
                var bannedList = {};
                bannedList["RedditBoost_BlockedUserForSubmissions"] = this._bannedSubmissionUsers;
                window.dispatchEvent(new CustomEvent("StoreSubmissionBans", { "detail": bannedList }));
            }
            else {
                this._bannedSubmissionUsers = event.detail["RedditBoost_BlockedUserForSubmissions"];
            }
            // Go through each user and hide if matching
            $("*[data-type='link']").each(function (index, thisLink) {
                var userName = $(thisLink).children(".entry").children(".tagline").children(".author").text();
                if (_this._bannedSubmissionUsers.indexOf(userName) >= 0) {
                    var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;' data-usernamebanned='" + userName + "'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockUserSubmissions' data-username='" + userName + "'>show " + userName + "'s submissions</a>" + "</div>";
                    $(thisLink).after(element);
                    $(thisLink).hide();
                }
            });
            // Add option to block or unblock a user
            $("*[data-type='link']").each(function (index, thisLink) {
                var user = $(thisLink).children(".entry").children(".tagline").children(".author").text();
                var tagline = $(thisLink).children(".entry").children(".tagline");
                tagline.append(_this._tagLineSpan(user, "blockUserSubmissions", "hide user submissions"));
            });
        };
        BanUserSubmissionsPlugin.prototype._blockUserSubmissions = function (elem) {
            // Block the user by replacing it with a title, username, and "show link button"
            var userName = $(elem).attr("data-username");
            this._bannedSubmissionUsers.push(userName);
            var bannedList = {};
            bannedList["RedditBoost_BlockedUserForSubmissions"] = this._bannedSubmissionUsers;
            window.dispatchEvent(new CustomEvent("RedditBoost_StoreSubmissionBans", { "detail": bannedList }));
            $("*[data-type='link']").each(function (index, thisLink) {
                if ($(thisLink).children(".entry").children(".tagline").children(".author").text() == userName) {
                    var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f5f5f5; border-radius: 3px; padding: 1px 0;' data-usernamebanned='" + userName + "'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockUserSubmissions' data-username='" + userName + "'>show " + userName + "'s submissions</a>" + "</div>";
                    $(thisLink).after(element);
                    $(thisLink).hide();
                }
            });
        };
        BanUserSubmissionsPlugin.prototype._unblockUserSubmissions = function (elem) {
            // Unblock the user
            var userName = $(elem).attr("data-username");
            var blockedIndex = this._bannedSubmissionUsers.indexOf(userName);
            if (blockedIndex >= 0) {
                this._bannedSubmissionUsers.splice(blockedIndex, 1);
                var bannedList = {};
                bannedList["RedditBoost_BlockedUserForSubmissions"] = this._bannedSubmissionUsers;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreSubmissionBans", { "detail": bannedList }));
            }
            $("*[data-type='link']").each(function (index, thisSubmissionBan) {
                if ($(thisSubmissionBan).children(".entry").children(".tagline").children(".author").text() == userName) {
                    var element = $(thisSubmissionBan).parent().find("*[data-usernamebanned=" + userName + "]");
                    element.remove();
                    $(thisSubmissionBan).show();
                }
            });
        };
        /**
         * Return span element HTML to append to tagline for showing or hiding submissions.
         * @param {string} userName The username this element belongs to
         * @param {string} classToAdd The class to add (either blockUserSubmissionBans or unblockUserSubmissionBans)
         * @param {string} textToAdd The text displayed to the user to click
         */
        BanUserSubmissionsPlugin.prototype._tagLineSpan = function (userName, classToAdd, textToAdd) {
            return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry" + "' data-username='" + userName + "'>" + textToAdd + "</a>";
        };
        return BanUserSubmissionsPlugin;
    })(utils.Singleton);
    RedditBoostPlugin.BanUserSubmissions = new BanUserSubmissionsPlugin();
})(RedditBoostPlugin || (RedditBoostPlugin = {}));
/// <reference path="../utils/Singleton.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />
/**
 * Block custom CSS
 */
var RedditBoostPlugin;
(function (RedditBoostPlugin) {
    var BanCustomCssPlugin = (function (_super) {
        __extends(BanCustomCssPlugin, _super);
        function BanCustomCssPlugin() {
            _super.apply(this, arguments);
            this._bannedCss = [];
            this._cssButton = "<div id='disableCss' class='disableCss'>Disable CSS</div>";
        }
        Object.defineProperty(BanCustomCssPlugin.prototype, "init", {
            get: function () { return this._init; },
            enumerable: true,
            configurable: true
        });
        BanCustomCssPlugin.prototype._init = function () {
            var _this = this;
            this.setSingleton();
            window.addEventListener("RedditBoost_RetrievedCssBans", function (event) {
                _this._handleRetrievedCssBans(event);
            }, false);
            $(document).on("click", ".disableCss", function (event) {
                _this._disableCssButtonHandler(event);
            });
            $(document).on("click", ".enableCss", function (event) {
                _this._enableCssButtonHandler(event);
            });
            window.dispatchEvent(new CustomEvent("RedditBoost_GetCssBans"));
        };
        BanCustomCssPlugin.prototype._handleRetrievedCssBans = function (event) {
            if (!event.detail.hasOwnProperty("RedditBoost_BlockedCss")) {
                // Create a new empty entry in storage
                var bannedList = {};
                bannedList["RedditBoost_BlockedCss"] = this._bannedCss;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreCssBans", { "detail": bannedList }));
            }
            else {
                this._bannedCss = event.detail["RedditBoost_BlockedCss"];
            }
            var subredditName = $(".redditname").text();
            $('body').append(this._cssButton);
            var buttonWidth = $("#disableCss").width();
            $("#disableCss").css("width", (buttonWidth + 1) + "px");
            if (this._bannedCss.indexOf(subredditName) >= 0) {
                $("#disableCss").text("Enable CSS").removeClass("disableCss").addClass("enableCss");
                $('link[title="applied_subreddit_stylesheet"]').prop('disabled', true);
            }
            else {
                $('link[title="applied_subreddit_stylesheet"]').prop('disabled', false);
            }
        };
        BanCustomCssPlugin.prototype._disableCssButtonHandler = function (event) {
            $(event.currentTarget).text("Enable CSS");
            $(event.currentTarget).removeClass('disableCss').addClass('enableCss');
            $('link[title="applied_subreddit_stylesheet"]').prop('disabled', true);
            var subredditName = $(".redditname").text();
            this._bannedCss.push(subredditName);
            var bannedList = {};
            bannedList["RedditBoost_BlockedCss"] = this._bannedCss;
            window.dispatchEvent(new CustomEvent("RedditBoost_StoreCssBans", { "detail": bannedList }));
        };
        BanCustomCssPlugin.prototype._enableCssButtonHandler = function (event) {
            $(event.currentTarget).text("Disable CSS");
            $(event.currentTarget).removeClass('enableCss').addClass('disableCss');
            $('link[title="applied_subreddit_stylesheet"]').prop('disabled', false);
            var subredditName = $(".redditname").text();
            var blockedIndex = this._bannedCss.indexOf(subredditName);
            if (blockedIndex >= 0) {
                this._bannedCss.splice(blockedIndex, 1);
                var bannedList = {};
                bannedList["RedditBoost_BlockedCss"] = this._bannedCss;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreCssBans", { "detail": bannedList }));
            }
        };
        return BanCustomCssPlugin;
    })(utils.Singleton);
    RedditBoostPlugin.BanCustomCss = new BanCustomCssPlugin();
})(RedditBoostPlugin || (RedditBoostPlugin = {}));
/*
Ideas:
    - Have a main function that simply loads the modules
    - Each module holds a seperate feature for RedditBoost
    - Compile to a single js file: tsc --target ES5 --out js/Main.js ts/Main.ts
*/
/// <reference path='references/jquery.d.ts' />
/// <reference path='features/TagUser.ts'/>
/// <reference path='features/BanUserComments.ts'/>
/// <reference path='features/BanUserSubmissions.ts'/>
/// <reference path='features/BanCustomCss.ts'/>
var RedditBoost;
(function (RedditBoost) {
    $(document).ready(function () {
        // Initialize feature plugins
        RedditBoostPlugin.TagUser.init();
        RedditBoostPlugin.BanUserComments.init();
        RedditBoostPlugin.BanUserSubmissions.init();
        RedditBoostPlugin.BanCustomCss.init();
    });
})(RedditBoost || (RedditBoost = {}));
