/// <reference path="../utils/Singleton.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />

module RedditBoostPlugin {
    class BanUserCommentsPlugin extends utils.Singleton {
        private _bannedUsers: string[] = [];
	    private _hideLoaded: boolean = false;
        
        get init() { return this._init; }
        
        private _init(): void {
            this.setSingleton();
            
            // Add click listener for blocking a user's comments.
            $(document).on("click", ".unblockUserComments", (event) => {
                this._blockOrUnblockUserComments(event.currentTarget, this._bannedUsers, false);
            });
            
            /// Add click listener for unblocking a user's comments.
            $(document).on("click", ".blockUserComments", (event) => {
                this._blockOrUnblockUserComments(event.currentTarget, this._bannedUsers, true);
            });
            
            /**
             * Update newly loaded comments for both the tagline and hiding
             */
            $(".author").initialize((index) => {
                if (this._hideLoaded) {
                    this._hideUserIfBanned(index.currentTarget);
                }
            });
            
            /**
             * Update newly loaded comments for both the tagline and hiding
             */
            $(".comment").initialize((index) => {
                if (this._hideLoaded) {
                    this._addBlockOptionTagline(index.currentTarget);
                }
            });
            
            window.addEventListener("RedditBoost_RetrievedCommentBans", (event) => {
                this._handleRetrievedCommentBans(event);
            });
            
            window.dispatchEvent(new CustomEvent("RedditBoost_GetCommentBans"));
        }
        
        /**
         * Block banned user comments and add block option next to usernames.
         */
        private _handleRetrievedCommentBans(event) : void {
            if (!event.detail.hasOwnProperty("RedditBoost_BlockedUserForComments")) {
                // Create a new empty entry in storage
                var bannedList = {}; 
                bannedList["RedditBoost_BlockedUserForComments"] = this._bannedUsers;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreCommentBans", { "detail": bannedList }));
            } else {
                this._bannedUsers = event.detail["RedditBoost_BlockedUserForComments"];
            }
        
            // Go through each user and add a class to hide if matching
            $( ".author" ).each((index, elem) => {
                this._hideUserIfBanned(elem);
            });
        
            // Add option to block or unblock a user
            $(".comment").each((index, elem) => {
                this._addBlockOptionTagline(elem);
            });
            this._hideLoaded = true;
        }
        
        /**
         * Add class to hide if matching banlist.
         */
        private _hideUserIfBanned(element) {
            var comment = $(element).parent().parent().parent();
            if (this._bannedUsers != null && this._bannedUsers.indexOf($(element).text()) >= 0 && comment.attr("data-type") == "comment") {
                comment.removeClass("noncollapsed").addClass("collapsed");
            }
        }
        
        /**
         * Adds option to block user's comments in tagline.
         */
        private _addBlockOptionTagline(element) {
            var user = $(element).children(".entry").children(".tagline").children(".author").text();
            var tagline = $(element).children(".entry").children(".tagline");
            if (this._bannedUsers != null && this._bannedUsers.indexOf(user) >= 0) {
                // Unhide
                tagline.append(this._tagLineSpan(user, "unblockUserComments", "show user comments"));
            } else {
                // Hide
                tagline.append(this._tagLineSpan(user, "blockUserComments", "hide user comments"));
            }
        }
        
        /**
         * Return span element HTML to append to tagline for showing or hiding comments.
         * @param {string} userName The username this element belongs to
         * @param {string} classToAdd The class to add (either blockUserComments or unblockUserComments)
         * @param {string} textToAdd The text displayed to the user to click
         */
        private _tagLineSpan(userName, classToAdd, textToAdd) {
            return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry hideTaglineEntry" + "' data-username='" + userName + "'>" + textToAdd + "</a>";
        }
        
        /**
        * Blocks or unblocks a user's comments based on parameters.
        * @param {object} thisElement The element of the comment.
        * @param {array} bannedUsers An array of banned users.
        * @param {bool} isBlocking Whether to block or not the user's comments.
        */
        private _blockOrUnblockUserComments(thisElement, bannedUsers, isBlocking) {
            var blockingClass;
            if (!isBlocking) {
                blockingClass = ".unblockUserComments";
            } else {
                blockingClass = ".blockUserComments";
            }
            var textHeadline;
            if (!isBlocking) {
                textHeadline = "hide user comments";
            } else {
                textHeadline = "show user comments";
            }
            
            if (bannedUsers == null) bannedUsers = [];
            
            var userToChange = $(thisElement).attr("data-username");
            var blockedIndex = bannedUsers.indexOf(userToChange);
            if ((isBlocking && blockedIndex < 0) || (!isBlocking)) {
                if (isBlocking) {
                    bannedUsers.push(userToChange);
                } else {
                    bannedUsers.splice(blockedIndex, 1);
                }
                var bannedList = {}; 
                bannedList["RedditBoost_BlockedUserForComments"] = bannedUsers;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreCommentBans", { "detail": bannedList }));
                
                $("*[data-type='comment']").each(function( index, thisComment ) {
                    if ($(thisComment).children(".entry").children(".tagline").children(".author").text() == userToChange) {
                        var textElement = $(thisComment).children(".entry").children(".tagline").children(blockingClass);
                        textElement.text(textHeadline);
                        
                        if (isBlocking) {
                            textElement.removeClass("blockUserComments").addClass("unblockUserComments");
                            $(thisComment).removeClass("noncollapsed").addClass("collapsed");
                        } else {
                            textElement.removeClass("unblockUserComments").addClass("blockUserComments");
                            $(thisComment).removeClass("collapsed").addClass("noncollapsed");
                        }
                    }
                });
            }
        }
    }
        
    export var BanUserComments: BanUserCommentsPlugin = new BanUserCommentsPlugin();
}