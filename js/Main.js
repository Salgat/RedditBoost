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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
            $(".entry").initialize(function (index) {
                if (_this._tagsLoaded && !$(index.currentTarget).find('.addTagName').length) {
                    _this._addTagOption(index.currentTarget);
                }
            });
            $(document).on("click", ".addTagName", function (index) {
                _this._showTagPopup(index);
            });
            $(document).on("click", "#closeTag", function (event) {
                $('#taggingPopup').remove();
            });
            $(document).on("click", "#saveTag", function (index) {
                _this._saveTag(index);
            });
            window.addEventListener("RedditBoost_RetrievedNameTags", function (event) {
                _this._handleRetrievedTags(event);
            });
            window.dispatchEvent(new CustomEvent("RedditBoost_GetNameTags"));
        };
        TagUserPlugin.prototype._handleRetrievedTags = function (event) {
            var _this = this;
            if (event.detail.hasOwnProperty("RedditBoost_NameTags")) {
                this._userTags = event.detail["RedditBoost_NameTags"];
            }
            $(".entry").each(function (index, elem) {
                _this._addTagOption(elem);
            });
            this._tagsLoaded = true;
        };
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
                tagline.append("<a href='javascript:void(0)' class='RedditBoostTaglineEntry addTagName' data-username='" + user + "'>" + addText + "</a>");
            }
        };
        TagUserPlugin.prototype._showTagPopup = function (index) {
            var userName = $(index.currentTarget).attr("data-username");
            var offset = $(index.currentTarget).offset();
            $('body').append(TagUserPlugin._tagHtmlPopup);
            $("#taggingTitle").text($("#taggingTitle").text().replace("{username}", userName));
            $('#taggingPopup').offset({ top: offset.top + 15, left: offset.left });
            $('#saveTag').attr("data-username", userName);
        };
        TagUserPlugin.prototype._saveTag = function (index) {
            var _this = this;
            var userName = $(index.currentTarget).attr("data-username");
            var tag = $('#tagInput').val();
            var tagColor = $('#colorSelector option:selected').attr('style');
            if (tag != null) {
                if (tag == "") {
                    delete this._userTags[userName];
                }
                else {
                    this._userTags[userName] = { "tag": tag, "tagColor": tagColor };
                }
                var tagsList = {};
                tagsList["RedditBoost_NameTags"] = this._userTags;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreNameTags", { "detail": tagsList }));
                $(".entry").each(function (index, elem) {
                    var tagline = $(elem).children(".tagline");
                    var user = tagline.children(".author").text();
                    if (user == userName) {
                        var tagName = "";
                        if (_this._userTags[user] != null) {
                            tagName = _this._userTags[user].tag;
                        }
                        if (tag == "" || tagName == "") {
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
            $(document).on("click", ".unblockUserComments", function (event) {
                _this._blockOrUnblockUserComments(event.currentTarget, _this._bannedUsers, false);
            });
            $(document).on("click", ".blockUserComments", function (event) {
                _this._blockOrUnblockUserComments(event.currentTarget, _this._bannedUsers, true);
            });
            $(".author").initialize(function (index) {
                if (_this._hideLoaded) {
                    _this._hideUserIfBanned(index.currentTarget);
                }
            });
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
        BanUserCommentsPlugin.prototype._handleRetrievedCommentBans = function (event) {
            var _this = this;
            if (!event.detail.hasOwnProperty("RedditBoost_BlockedUserForComments")) {
                var bannedList = {};
                bannedList["RedditBoost_BlockedUserForComments"] = this._bannedUsers;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreCommentBans", { "detail": bannedList }));
            }
            else {
                this._bannedUsers = event.detail["RedditBoost_BlockedUserForComments"];
            }
            $(".author").each(function (index, elem) {
                _this._hideUserIfBanned(elem);
            });
            $(".comment").each(function (index, elem) {
                _this._addBlockOptionTagline(elem);
            });
            this._hideLoaded = true;
        };
        BanUserCommentsPlugin.prototype._hideUserIfBanned = function (element) {
            var comment = $(element).parent().parent().parent();
            if (this._bannedUsers != null && this._bannedUsers.indexOf($(element).text()) >= 0 && comment.attr("data-type") == "comment") {
                comment.removeClass("noncollapsed").addClass("collapsed");
            }
        };
        BanUserCommentsPlugin.prototype._addBlockOptionTagline = function (element) {
            var user = $(element).children(".entry").children(".tagline").children(".author").text();
            var tagline = $(element).children(".entry").children(".tagline");
            if (this._bannedUsers != null && this._bannedUsers.indexOf(user) >= 0) {
                tagline.append(this._tagLineSpan(user, "unblockUserComments", "show user comments"));
            }
            else {
                tagline.append(this._tagLineSpan(user, "blockUserComments", "hide user comments"));
            }
        };
        BanUserCommentsPlugin.prototype._tagLineSpan = function (userName, classToAdd, textToAdd) {
            return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry hideTaglineEntry" + "' data-username='" + userName + "'>" + textToAdd + "</a>";
        };
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
            $(document).on("click", ".blockUserSubmissions", function (event) {
                _this._blockUserSubmissions(event.currentTarget);
            });
            $(document).on("click", ".unblockUserSubmissions", function (event) {
                _this._unblockUserSubmissions(event.currentTarget);
            });
            window.addEventListener("RedditBoost_RetrievedSubmissionBans", function (event) {
                _this._retrievedSubmissionsBans(event);
            }, false);
            window.dispatchEvent(new CustomEvent("RedditBoost_GetSubmissionBans"));
        };
        BanUserSubmissionsPlugin.prototype._retrievedSubmissionsBans = function (event) {
            var _this = this;
            if (!event.detail.hasOwnProperty("RedditBoost_BlockedUserForSubmissions")) {
                var bannedList = {};
                bannedList["RedditBoost_BlockedUserForSubmissions"] = this._bannedSubmissionUsers;
                window.dispatchEvent(new CustomEvent("StoreSubmissionBans", { "detail": bannedList }));
            }
            else {
                this._bannedSubmissionUsers = event.detail["RedditBoost_BlockedUserForSubmissions"];
            }
            $("*[data-type='link']").each(function (index, thisLink) {
                var userName = $(thisLink).children(".entry").children(".tagline").children(".author").text();
                if (_this._bannedSubmissionUsers.indexOf(userName) >= 0) {
                    var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;' data-usernamebanned='" + userName + "'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockUserSubmissions' data-username='" + userName + "'>show " + userName + "'s submissions</a>" + "</div>";
                    $(thisLink).after(element);
                    $(thisLink).hide();
                }
            });
            $("*[data-type='link']").each(function (index, thisLink) {
                var user = $(thisLink).children(".entry").children(".tagline").children(".author").text();
                var tagline = $(thisLink).children(".entry").children(".tagline");
                tagline.append(_this._tagLineSpan(user, "blockUserSubmissions", "hide user submissions"));
            });
        };
        BanUserSubmissionsPlugin.prototype._blockUserSubmissions = function (elem) {
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
        BanUserSubmissionsPlugin.prototype._tagLineSpan = function (userName, classToAdd, textToAdd) {
            return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry" + "' data-username='" + userName + "'>" + textToAdd + "</a>";
        };
        return BanUserSubmissionsPlugin;
    })(utils.Singleton);
    RedditBoostPlugin.BanUserSubmissions = new BanUserSubmissionsPlugin();
})(RedditBoostPlugin || (RedditBoostPlugin = {}));
var RedditBoostPlugin;
(function (RedditBoostPlugin) {
    var BanSubredditsPlugin = (function (_super) {
        __extends(BanSubredditsPlugin, _super);
        function BanSubredditsPlugin() {
            _super.apply(this, arguments);
            this._bannedSubreddits = [];
        }
        Object.defineProperty(BanSubredditsPlugin.prototype, "init", {
            get: function () { return this._init; },
            enumerable: true,
            configurable: true
        });
        BanSubredditsPlugin.prototype._init = function () {
            var _this = this;
            this.setSingleton();
            var currentSubreddit = $(".redditname").first().text();
            if (currentSubreddit != "" && currentSubreddit != "all") {
                return;
            }
            $(document).on("click", ".blockSubreddit", function (event) {
                _this._blockSubreddit(event.currentTarget);
            });
            $(document).on("click", ".unblockSubreddit", function (event) {
                _this._unblockSubreddit(event.currentTarget);
            });
            window.addEventListener("RedditBoost_RetrievedSubredditBans", function (event) {
                _this._retrievedSubredditBans(event);
            }, false);
            window.dispatchEvent(new CustomEvent("RedditBoost_GetSubredditBans"));
        };
        BanSubredditsPlugin.prototype._retrievedSubredditBans = function (event) {
            var _this = this;
            if (!event.detail.hasOwnProperty("RedditBoost_BlockedSubreddits")) {
                var bannedList = {};
                bannedList["RedditBoost_BlockedSubreddits"] = this._bannedSubreddits;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreSubredditBans", { "detail": bannedList }));
            }
            else {
                this._bannedSubreddits = event.detail["RedditBoost_BlockedSubreddits"];
            }
            $("*[data-type='link']").each(function (index, thisLink) {
                var subreddit = $(thisLink).children(".entry").children(".tagline").children(".subreddit").text().substring(3);
                var tagline = $(thisLink).children(".entry").children(".tagline");
                tagline.append(_this._tagLineSpan(subreddit, "blockSubreddit", "hide subreddit"));
            });
            $("*[data-type='link']").each(function (index, thisLink) {
                var subreddit = $(thisLink).children(".entry").children(".tagline").children(".subreddit").text().substring(3);
                if (_this._bannedSubreddits.indexOf(subreddit) >= 0) {
                    var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;' data-subredditbanned='" + subreddit + "'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockSubreddit' data-subreddit='" + subreddit + "'>show /r/" + subreddit + " links</a>" + "</div>";
                    $(thisLink).after(element);
                    $(thisLink).hide();
                }
            });
        };
        BanSubredditsPlugin.prototype._blockSubreddit = function (elem) {
            var subreddit = $(elem).attr("data-subreddit");
            this._bannedSubreddits.push(subreddit);
            var bannedList = {};
            bannedList["RedditBoost_BlockedSubreddits"] = this._bannedSubreddits;
            window.dispatchEvent(new CustomEvent("RedditBoost_StoreSubredditBans", { "detail": bannedList }));
            $("*[data-type='link']").each(function (index, thisLink) {
                if ($(thisLink).children(".entry").children(".tagline").children(".subreddit").text().substring(3) == subreddit) {
                    var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;' data-subredditbanned='" + subreddit + "'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockSubreddit' data-subreddit='" + subreddit + "'>show /r/" + subreddit + " links</a>" + "</div>";
                    $(thisLink).after(element);
                    $(thisLink).hide();
                }
            });
        };
        BanSubredditsPlugin.prototype._unblockSubreddit = function (elem) {
            var subreddit = $(elem).attr("data-subreddit");
            var blockedIndex = this._bannedSubreddits.indexOf(subreddit);
            if (blockedIndex >= 0) {
                this._bannedSubreddits.splice(blockedIndex, 1);
                var bannedList = {};
                bannedList["RedditBoost_BlockedSubreddits"] = this._bannedSubreddits;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreSubredditBans", { "detail": bannedList }));
            }
            $("*[data-type='link']").each(function (index, thisLink) {
                if ($(thisLink).children(".entry").children(".tagline").children(".subreddit").text().substring(3) == subreddit) {
                    var element = $(thisLink).parent().find("*[data-subredditbanned=" + subreddit + "]");
                    element.remove();
                    $(thisLink).show();
                }
            });
        };
        BanSubredditsPlugin.prototype._tagLineSpan = function (subreddit, classToAdd, textToAdd) {
            return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry" + "' data-subreddit='" + subreddit + "'>" + textToAdd + "</a>";
        };
        return BanSubredditsPlugin;
    })(utils.Singleton);
    RedditBoostPlugin.BanSubreddits = new BanSubredditsPlugin();
})(RedditBoostPlugin || (RedditBoostPlugin = {}));
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
var RedditBoostPlugin;
(function (RedditBoostPlugin) {
    var Region;
    (function (Region) {
        Region[Region["Above"] = 0] = "Above";
        Region[Region["Below"] = 1] = "Below";
        Region[Region["Left"] = 2] = "Left";
        Region[Region["Right"] = 3] = "Right";
    })(Region || (Region = {}));
    ;
    var HoverPreviewPlugin = (function (_super) {
        __extends(HoverPreviewPlugin, _super);
        function HoverPreviewPlugin() {
            _super.apply(this, arguments);
            this._loadingAnimation = "<div id='RedditBoost_loadingAnimation' class='uil-default-css' style='transform:scale(1);'>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(0deg) translate(0,-60px);transform:rotate(0deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(30deg) translate(0,-60px);transform:rotate(30deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(60deg) translate(0,-60px);transform:rotate(60deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(90deg) translate(0,-60px);transform:rotate(90deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(120deg) translate(0,-60px);transform:rotate(120deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(150deg) translate(0,-60px);transform:rotate(150deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(180deg) translate(0,-60px);transform:rotate(180deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(210deg) translate(0,-60px);transform:rotate(210deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(240deg) translate(0,-60px);transform:rotate(240deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(270deg) translate(0,-60px);transform:rotate(270deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(300deg) translate(0,-60px);transform:rotate(300deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(330deg) translate(0,-60px);transform:rotate(330deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
							</div>";
            this._gifvPlayer = "<video data-filename='' class='RedditBoost_Content' preload='auto' autoplay='autoplay' muted='muted' loop='loop' webkit-playsinline>	    \
                                <source src='' id='RedditBoost_imageWebm'	type='video/webm'>																		\
                                <source src='' id='RedditBoost_imageMp4'	type='video/mp4'>																		\
                                </video>																												";
            this._failedLoading = "<div id='RedditBoost_failedLoading'>X</div>";
            this._lastLink = { lastLink: "", isActive: false, element: null };
            this._processing = false;
            this._imageCache = {};
            this._mousePosition = { x: 0, y: 0 };
            this._failedLinks = [];
            this._failedVideoLinks = [];
            this._successfulVideoLinks = [];
            this._requestedLinks = [];
            this._lastMousePosition = { x: 0, y: 0 };
            this._imageUpdates = 0;
        }
        Object.defineProperty(HoverPreviewPlugin.prototype, "init", {
            get: function () { return this._init; },
            enumerable: true,
            configurable: true
        });
        HoverPreviewPlugin.prototype._init = function () {
            var _this = this;
            this.setSingleton();
            this._handleImgurResponse();
            this._handleGfycatResponse();
            this._supportedMediaPattern = new RegExp("(gif|gifv|jpg|jpeg|png|bmp)$");
            this._supportedMediaPattern.ignoreCase = true;
            this._supportedDomains = new RegExp("(imgur.com|gfycat.com)$");
            this._supportedDomains.ignoreCase = true;
            this._staticImageType = new RegExp("(jpg|jpeg|png|bmp)$");
            this._staticImageType.ignoreCase = true;
            this._gifImageType = new RegExp("(gif|gifv)$");
            this._gifImageType.ignoreCase = true;
            $('body').append("<div id='RedditBoost_imagePopup'></div>");
            $('#RedditBoost_imagePopup').hide();
            $('#RedditBoost_imagePopup').prepend(this._failedLoading);
            $("#RedditBoost_failedLoading").hide();
            $('#RedditBoost_imagePopup').prepend(this._loadingAnimation);
            $("#RedditBoost_loadingAnimation").hide();
            $('#RedditBoost_imagePopup').prepend("<h3 id='RedditBoost_imagePopupTitle'>");
            $(document).mousemove(function (event) {
                _this._mousePosition.x = event.pageX;
                _this._mousePosition.y = event.pageY;
            });
            setInterval(function () { _this._showPreview(); }, 15);
        };
        HoverPreviewPlugin.prototype._showPreview = function () {
            if (this._processing)
                return;
            this._processing = true;
            var hoveredLink = $('a.title:hover, form a:hover').first();
            if (hoveredLink.length > 0) {
                var linkType = this._getLinkType($(hoveredLink).attr("href"));
                if (this._isSupported(linkType)) {
                    this._tryPreview(linkType);
                }
                this._adjustPreviewPopup();
            }
            else {
                $('#RedditBoost_imagePopup').hide();
                this._lastLink = { lastLink: "", isActive: false, element: null };
            }
            this._processing = false;
        };
        HoverPreviewPlugin.prototype._getLinkType = function (linkHref) {
            var link = linkHref;
            var fileName = HoverPreviewPlugin._getFileName(link);
            var extension = this._getExtension(fileName);
            var source = HoverPreviewPlugin._getDomain(link);
            return { link: link, extension: extension, source: source, fileName: fileName };
        };
        HoverPreviewPlugin._getFileName = function (link) {
            var linkSections = link.split("/");
            var filenameWithParameters = linkSections.pop();
            var fileWithoutParameters = filenameWithParameters.split("?")[0];
            return fileWithoutParameters;
        };
        HoverPreviewPlugin.prototype._getExtension = function (fileName) {
            var extension = fileName.split('.').pop();
            if (!this._supportedMediaPattern.test(fileName.toLowerCase())) {
                return "";
            }
            return extension;
        };
        HoverPreviewPlugin._getDomain = function (link) {
            link = link.replace(/.*?:\/\//g, "");
            link = link.split('/')[0];
            if (link.split('.').length == 4 || (link.split('.').length == 3 && link.toLowerCase().indexOf('.co.') < 0)) {
                var split = link.split('.');
                split.shift();
                link = split.join('.');
            }
            return link;
        };
        HoverPreviewPlugin.prototype._isSupported = function (linkType) {
            if (this._isSupportedMediaPattern(linkType.extension)) {
                return true;
            }
            if (this._isSupportedDomain(linkType.source, linkType.link)) {
                return true;
            }
            return false;
        };
        HoverPreviewPlugin.prototype._isSupportedMediaPattern = function (link) {
            if (this._supportedMediaPattern.test(link.toLowerCase())) {
                return true;
            }
            return false;
        };
        HoverPreviewPlugin.prototype._isSupportedDomain = function (domain, link) {
            if (this._supportedDomains.test(domain)) {
                if (link.toLowerCase().indexOf('/a/') < 0 && link.toLowerCase().indexOf('/gallery/') < 0 && link.toLowerCase().indexOf(',') < 0) {
                    return true;
                }
            }
            return false;
        };
        HoverPreviewPlugin.prototype._failedLoadingVideo = function () {
            if ($('.RedditBoost_Content').is('video') && this._failedVideoLinks.indexOf($('#RedditBoost_imageWebm').attr('src')) >= 0 && this._failedVideoLinks.indexOf($('#RedditBoost_imageMp4').attr('src')) >= 0) {
                return true;
            }
            return false;
        };
        HoverPreviewPlugin.prototype._successfulLoadingVideo = function () {
            if ($('.RedditBoost_Content').is('video') && (this._successfulVideoLinks.indexOf($('#RedditBoost_imageWebm').attr('src').replace(/.*?:\/\//g, "")) >= 0 || this._successfulVideoLinks.indexOf($('#RedditBoost_imageMp4').attr('src').replace(/.*?:\/\//g, "")) >= 0)) {
                return true;
            }
            return false;
        };
        HoverPreviewPlugin.prototype._tryPreview = function (linkType) {
            if (this._imageCache[linkType.fileName.toLowerCase()] != null) {
                var mediaInformation = this._imageCache[linkType.fileName.toLowerCase()];
                if (mediaInformation.imgUrl != null) {
                    var currentLinkType = this._getLinkType(mediaInformation.imgUrl);
                    if (this._isSupportedMediaPattern(currentLinkType.extension)) {
                        this._displayMedia(currentLinkType, this._imageCache);
                    }
                }
                else {
                    $('#RedditBoost_imagePopup').hide();
                }
            }
            else if (this._isSupportedMediaPattern(linkType.extension)) {
                this._displayMedia(linkType, this._imageCache);
            }
            else if (this._isSupportedDomain(linkType.source, linkType.link)) {
                this._getMediaInformation(linkType);
            }
        };
        HoverPreviewPlugin.prototype._displayMedia = function (linkType, mediaInformation) {
            if (this._failedLinks.indexOf(linkType.link) >= 0) {
                $('#RedditBoost_imagePopup').show();
                $('.RedditBoost_Content').hide();
                $('#RedditBoost_loadingAnimation').hide();
                $('#RedditBoost_failedLoading').show();
                return;
            }
            else {
                $('#RedditBoost_failedLoading').hide();
            }
            if (this._staticImageType.test(linkType.extension.toLowerCase())) {
                this._displayImage(linkType.link);
            }
            else if (this._gifImageType.test(linkType.extension.toLowerCase())) {
                var name_1 = linkType.fileName.split('.')[0].toLowerCase();
                if (mediaInformation[name_1] != null && mediaInformation[name_1].mp4Url != null && mediaInformation[name_1].webmUrl != null) {
                    this._displayGifv(name_1, mediaInformation[name_1]);
                }
                else if (mediaInformation[name_1] != null && mediaInformation[name_1].gifUrl != null) {
                    this._displayImage(mediaInformation[name_1].gifUrl);
                }
                else if (mediaInformation[name_1] != null && mediaInformation[name_1].imgUrl != null) {
                    this._displayImage(mediaInformation[name_1].imgUrl);
                }
                else {
                    this._displayImage(linkType.link);
                }
            }
        };
        HoverPreviewPlugin.prototype._displayImage = function (link) {
            var _this = this;
            if ((this._getExtension(link) == 'gif' || this._getExtension(link) == 'gifv') && HoverPreviewPlugin._getDomain(link) == 'imgur.com') {
                var name_2 = HoverPreviewPlugin._getFileName(link).split('.')[0];
                this._displayGifv(name_2, { source: HoverPreviewPlugin._getDomain(link), imgUrl: null, mp4Url: "//i.imgur.com/" + name_2 + ".mp4", webmUrl: "//i.imgur.com/" + name_2 + ".webm", gifUrl: null });
                return;
            }
            $("#RedditBoost_loadingAnimation").show();
            if ($('#RedditBoost_imagePopup .RedditBoost_Content').attr('src') != link) {
                $('#RedditBoost_imagePopup .RedditBoost_Content').remove();
                $('#RedditBoost_imagePopup').append("<img class='RedditBoost_Content' src='" + link + "' id='imagePopupImg'>");
                $('.RedditBoost_Content').bind('error', function (event) {
                    _this._handleErrorLoading(event);
                });
            }
            $('#RedditBoost_imagePopup').show();
        };
        HoverPreviewPlugin.prototype._displayGifv = function (fileName, mediaInformation) {
            var _this = this;
            $("#RedditBoost_loadingAnimation").show();
            if ($('#RedditBoost_imagePopup .RedditBoost_Content').attr('data-fileName') != fileName) {
                $('#RedditBoost_imagePopup .RedditBoost_Content').remove();
                $('#RedditBoost_imagePopup').append(this._gifvPlayer);
                $('#RedditBoost_imagePopup .RedditBoost_Content').attr('data-fileName', fileName);
                if (mediaInformation.source == 'imgur.com') {
                    $('#RedditBoost_imageWebm').attr("src", mediaInformation.webmUrl);
                    $('#RedditBoost_imageMp4').attr("src", mediaInformation.mp4Url);
                }
                else if (mediaInformation.source == 'gfycat.com') {
                    $('#RedditBoost_imageWebm').attr("src", mediaInformation.webmUrl);
                    $('#RedditBoost_imageMp4').attr("src", mediaInformation.mp4Url);
                }
                $('#RedditBoost_imageWebm').bind('error', function (event) {
                    _this._handleGifvErrorLoading(event);
                });
                $('#RedditBoost_imageMp4').bind('error', function (event) {
                    _this._handleGifvErrorLoading(event);
                });
                $('.RedditBoost_Content').bind('loadeddata', function (event) {
                    _this._handleGifvLoad(event);
                });
            }
            $('#RedditBoost_imagePopup').show();
        };
        HoverPreviewPlugin.prototype._handleGifvErrorLoading = function (event) {
            var failedSource = event.target.attributes.src.value;
            failedSource = failedSource.replace(/.*?:\/\//g, "");
            this._failedVideoLinks.push(failedSource);
        };
        HoverPreviewPlugin.prototype._handleGifvLoad = function (event) {
            var successfulSource = $(event.target).children('#RedditBoost_imageMp4').attr('src');
            successfulSource = successfulSource.replace(/.*?:\/\//g, "");
            this._successfulVideoLinks.push(successfulSource);
        };
        HoverPreviewPlugin.prototype._adjustPreviewPopup = function () {
            if ($(".RedditBoost_Content").height() && $(".RedditBoost_Content:visible").length > 0 && !this._failedLoadingVideo()) {
                $("#RedditBoost_loadingAnimation").hide();
            }
            else {
                this._imageUpdates = 0;
            }
            if ($(".RedditBoost_Content").is('video') && !this._failedLoadingVideo() && !this._successfulLoadingVideo()) {
                $("#RedditBoost_loadingAnimation").show();
                $('.RedditBoost_Content').hide();
                this._imageUpdates = 0;
            }
            else if (this._failedLoadingVideo()) {
                $("#RedditBoost_loadingAnimation").hide();
                $('#RedditBoost_failedLoading').show();
                $('.RedditBoost_Content').hide();
            }
            else if (this._successfulLoadingVideo()) {
                $("#RedditBoost_loadingAnimation").hide();
                $('.RedditBoost_Content').show();
            }
            if (Math.abs(this._lastMousePosition.x - this._mousePosition.x) < 1.0 && Math.abs(this._lastMousePosition.y - this._mousePosition.y) < 1.0 && this._imageUpdates > 15) {
                return;
            }
            this._lastMousePosition.x = this._mousePosition.x;
            this._lastMousePosition.y = this._mousePosition.y;
            var title = $('a.title:hover, form a:hover').first().text();
            if (title != null && $('#RedditBoost_imagePopupTitle').text() != title) {
                $('#RedditBoost_imagePopupTitle').text(title);
                this._imageUpdates = 0;
            }
            else {
                this._imageUpdates += 1;
            }
            var popupWidth = $('#RedditBoost_imagePopup').width();
            var popupHeight = $('#RedditBoost_imagePopup').height();
            var region = this._findMostSpace(this._mousePosition);
            this._adjustPopupSize(popupWidth, popupHeight, region);
            if (region == Region.Left) {
                $('#RedditBoost_imagePopup').offset({ top: $(window).scrollTop(), left: this._mousePosition.x - popupWidth - 10 });
            }
            else if (region == Region.Right) {
                $('#RedditBoost_imagePopup').offset({ top: $(window).scrollTop(), left: this._mousePosition.x + 20 });
            }
            else if (region == Region.Above) {
                $('#RedditBoost_imagePopup').offset({ top: this._mousePosition.y - popupHeight - 5, left: 10 });
            }
            else {
                $('#RedditBoost_imagePopup').offset({ top: this._mousePosition.y + 10, left: 0 });
            }
            if (region == Region.Above || region == Region.Below) {
                this._centerPopupHorizontally(popupWidth);
            }
            else {
                this._centerPopupVertically(popupHeight);
            }
            $("#RedditBoost_loadingAnimation").css("left", popupWidth / 2 - 100);
        };
        HoverPreviewPlugin.prototype._findMostSpace = function (mouseLocation) {
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            var distanceLeft = (mouseLocation.x - $(window).scrollLeft());
            var distanceRight = windowWidth - (mouseLocation.x - $(window).scrollLeft());
            var distanceAbove = (mouseLocation.y - $(window).scrollTop());
            var distanceBelow = windowHeight - (mouseLocation.y - $(window).scrollTop());
            if (distanceLeft > distanceRight && distanceLeft > distanceAbove && distanceLeft > distanceBelow)
                return Region.Left;
            if (distanceRight > distanceLeft && distanceRight > distanceAbove && distanceRight > distanceBelow)
                return Region.Right;
            if (distanceAbove > distanceRight && distanceAbove > distanceLeft && distanceAbove > distanceBelow)
                return Region.Above;
            return Region.Below;
        };
        HoverPreviewPlugin.prototype._handleErrorLoading = function (event) {
            var failedLink = $(event.currentTarget).attr('src');
            this._failedLinks.push(failedLink);
        };
        HoverPreviewPlugin.prototype._adjustPopupSize = function (popupWidth, popupHeight, region) {
            var distanceLeft = (this._mousePosition.x - $(window).scrollLeft());
            var distanceRight = $(window).width() - (this._mousePosition.x - $(window).scrollLeft());
            var distanceAbove = (this._mousePosition.y - $(window).scrollTop());
            var distanceBelow = $(window).height() - (this._mousePosition.y - $(window).scrollTop());
            var maxHeight;
            var maxWidth;
            if (region == Region.Left) {
                maxHeight = $(window).height() - 90;
                maxWidth = distanceLeft - 30;
            }
            else if (region == Region.Right) {
                maxHeight = $(window).height() - 90;
                maxWidth = distanceRight - 30;
            }
            else if (region == Region.Above) {
                maxHeight = distanceAbove - 90;
                maxWidth = $(window).width() - 15;
            }
            else {
                maxHeight = distanceBelow - 90;
                maxWidth = $(window).width() - 15;
            }
            $('.RedditBoost_Content').css("max-height", maxHeight);
            $('.RedditBoost_Content').css("max-width", maxWidth);
            $('#RedditBoost_imagePopupTitle').css("max-height", maxHeight);
            $('#RedditBoost_imagePopupTitle').css("max-width", maxWidth);
        };
        HoverPreviewPlugin.prototype._centerPopupHorizontally = function (popupWidth) {
            var offset = $("#layer2").offset();
            $('#RedditBoost_imagePopup').css('left', $(window).width() / 2 - popupWidth / 2 + $(window).scrollLeft());
        };
        HoverPreviewPlugin.prototype._centerPopupVertically = function (popupHeight) {
            var offset = $("#layer2").offset();
            $('#RedditBoost_imagePopup').css('top', $(window).height() / 2 - popupHeight / 2 + $(window).scrollTop());
        };
        HoverPreviewPlugin.prototype._getMediaInformation = function (linkType) {
            $(".RedditBoost_Content").hide();
            $("#RedditBoost_loadingAnimation").show();
            $('#RedditBoost_imagePopup').show();
            if (linkType.source == 'imgur.com') {
                this._getImgurData(linkType.fileName);
            }
            else if (linkType.source == 'gfycat.com') {
                this._getGfycatData(linkType.fileName);
            }
        };
        HoverPreviewPlugin.prototype._getImgurData = function (fileName) {
            if (this._requestedLinks.indexOf(fileName) >= 0)
                return;
            this._requestedLinks.push(fileName);
            var imageApiUrl = "//api.imgur.com/2/image/" + fileName + ".json";
            $.get(imageApiUrl)
                .done(function (data) {
                window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedImgurData", { "detail": data }));
            });
        };
        HoverPreviewPlugin.prototype._getGfycatData = function (fileName) {
            if (this._requestedLinks.indexOf(fileName) >= 0)
                return;
            this._requestedLinks.push(fileName);
            var imageApiUrl = "//gfycat.com/cajax/get/" + fileName;
            $.get(imageApiUrl)
                .done(function (data) {
                window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedGfycatData", { "detail": data }));
            });
        };
        HoverPreviewPlugin.prototype._handleImgurResponse = function () {
            var _this = this;
            window.addEventListener("RedditBoost_RetrievedImgurData", function (event) {
                var hash = event.detail["image"]["image"]["hash"].toLowerCase();
                var imageUrl = event.detail["image"]["links"]["original"];
                if (imageUrl != null) {
                    _this._imageCache[hash] = { source: 'imgur.com', imgUrl: imageUrl, mp4Url: null, gifUrl: null, webmUrl: null };
                }
                else {
                    _this._imageCache[hash] = { source: 'imgur.com', imgUrl: null, mp4Url: null, gifUrl: null, webmUrl: null };
                }
            }, false);
        };
        HoverPreviewPlugin.prototype._handleGfycatResponse = function () {
            var _this = this;
            window.addEventListener("RedditBoost_RetrievedGfycatData", function (event) {
                var hash = event.detail["gfyItem"]["gfyName"].toLowerCase();
                var imageUrl = event.detail["gfyItem"]["gifUrl"];
                var webmUrl = event.detail["gfyItem"]["webmUrl"];
                var mp4Url = event.detail["gfyItem"]["mp4Url"];
                if (imageUrl != null) {
                    _this._imageCache[hash] = { source: 'gfycat.com', imgUrl: imageUrl, mp4Url: mp4Url, gifUrl: null, webmUrl: webmUrl };
                }
                else {
                    _this._imageCache[hash] = { source: 'gfycat.com', imgUrl: null, mp4Url: null, gifUrl: null, webmUrl: null };
                }
            }, false);
        };
        return HoverPreviewPlugin;
    })(utils.Singleton);
    RedditBoostPlugin.HoverPreview = new HoverPreviewPlugin();
})(RedditBoostPlugin || (RedditBoostPlugin = {}));
var RedditBoostPlugin;
(function (RedditBoostPlugin) {
    var MirrorPlugin = (function (_super) {
        __extends(MirrorPlugin, _super);
        function MirrorPlugin() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(MirrorPlugin.prototype, "init", {
            get: function () { return this._init; },
            enumerable: true,
            configurable: true
        });
        MirrorPlugin.prototype._init = function () {
            var _this = this;
            this.setSingleton();
            $(document).on("click", ".RedditBoost_getMirror", function (event) {
                _this._getMirror(event.currentTarget);
            });
            this._loadMirrorTags();
        };
        MirrorPlugin.prototype._loadMirrorTags = function () {
            $('.link .entry p.title').each(function (index, elem) {
                $(elem).append("<a href='javascript:void(0)' class='RedditBoost_getMirror RedditBoostTaglineEntry" + "' data-mirror-link='" + $(elem).children('.title').first().attr('href') + "'>mirror</a>");
            });
        };
        MirrorPlugin.prototype._getMirror = function (element) {
            var _this = this;
            var link = $(element).attr('data-mirror-link');
            link = link.replace(/.*?:\/\//g, "");
            $(element).text('loading mirror...');
            $.get('https://redditmirror.herokuapp.com/redditmirror/v1/mirror?url=' + link)
                .done(function (data) {
                _this._loadMirror(element, data);
            })
                .fail(function () {
                _this._loadMirrorFailed(element);
            });
        };
        MirrorPlugin.prototype._loadMirror = function (element, data) {
            $(element).text('mirror loaded').css('background-color', '#76ad4c');
            this._openInNewTab(data['url']);
        };
        MirrorPlugin.prototype._loadMirrorFailed = function (element) {
            $(element).text('no mirror').css('background-color', '#ff5252');
        };
        MirrorPlugin.prototype._openInNewTab = function (url) {
            $("<a>").attr("href", url).attr("target", "_blank")[0].click();
        };
        return MirrorPlugin;
    })(utils.Singleton);
    RedditBoostPlugin.Mirror = new MirrorPlugin();
})(RedditBoostPlugin || (RedditBoostPlugin = {}));
var RedditBoost;
(function (RedditBoost) {
    $(document).ready(function () {
        RedditBoostPlugin.TagUser.init();
        RedditBoostPlugin.BanUserComments.init();
        RedditBoostPlugin.BanUserSubmissions.init();
        RedditBoostPlugin.BanSubreddits.init();
        RedditBoostPlugin.BanCustomCss.init();
        RedditBoostPlugin.HoverPreview.init();
        RedditBoostPlugin.Mirror.init();
    });
})(RedditBoost || (RedditBoost = {}));
