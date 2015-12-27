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
        Object.defineProperty(TagUserPlugin.prototype, "self", {
            get: function () { return this; },
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
/*
Ideas:
    - Have a main function that simply loads the modules
    - Each module holds a seperate feature for RedditBoost
    - Compile to a single js file: tsc --out Main.js Main.ts
*/
/// <reference path="references/jquery.d.ts" />
/// <reference path='features/TagUser.ts'/>
var RedditBoost;
(function (RedditBoost) {
    $(document).ready(function () {
        // Initialize feature plugins
        var tagUser = RedditBoostPlugin.TagUser;
        tagUser.init();
    });
})(RedditBoost || (RedditBoost = {}));
