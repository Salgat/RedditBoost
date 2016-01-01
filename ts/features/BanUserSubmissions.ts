/// <reference path="../utils/Singleton.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />

/**
 * Block specific user's submission
 */
module RedditBoostPlugin {
    class BanUserSubmissionsPlugin extends utils.Singleton {
        private _bannedSubmissionUsers: string[] = [];
	    private _hideLoaded: boolean = false;
        
        get init() { return this._init; }
        
        private _init(): void {
            this.setSingleton();
            
            // Add click listener for blocking a user's submissions.
            $(document).on("click", ".blockUserSubmissions", (event) => {
                this._blockUserSubmissions(event.currentTarget);
            });
            
            // Add click listener for unblocking a user's submissions.
            $(document).on("click", ".unblockUserSubmissions", (event) => {
                this._unblockUserSubmissions(event.currentTarget);
            });
            
            // Initiates user submission blocking upon receiving the banned users list from storage.
            window.addEventListener("RedditBoost_RetrievedSubmissionBans", (event) => {
                this._retrievedSubmissionsBans(event);
            }, false);
            
            // When page loads, initiate event to get banned users list and collapse all submissions by those users
		    window.dispatchEvent(new CustomEvent("RedditBoost_GetSubmissionBans"));
        }
        
        private _retrievedSubmissionsBans(event) {
            if (!event.detail.hasOwnProperty("RedditBoost_BlockedUserForSubmissions")) {
                // Create a new empty entry in storage
                var bannedList = {}; 
                bannedList["RedditBoost_BlockedUserForSubmissions"] = this._bannedSubmissionUsers;
                window.dispatchEvent(new CustomEvent("StoreSubmissionBans", { "detail": bannedList }));
            } else {
                this._bannedSubmissionUsers = event.detail["RedditBoost_BlockedUserForSubmissions"];
            }
        
            // Go through each user and hide if matching
            $("*[data-type='link']").each((index, thisLink) => {
                var userName = $(thisLink).children(".entry").children(".tagline").children(".author").text();
                if (this._bannedSubmissionUsers.indexOf(userName) >= 0) {
                    var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;' data-usernamebanned='" + userName +"'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockUserSubmissions' data-username='" + userName +"'>show " + userName + "'s submissions</a>" + "</div>";
                    $(thisLink).after(element);
                    $(thisLink).hide();
                }
            });
        
            // Add option to block or unblock a user
            $("*[data-type='link']").each((index, thisLink) => {
                var user = $(thisLink).children(".entry").children(".tagline").children(".author").text();
                var tagline = $(thisLink).children(".entry").children(".tagline");
                tagline.append(this._tagLineSpan(user, "blockUserSubmissions", "hide user submissions"));
		    });
        }
        
        private _blockUserSubmissions(elem) {
            // Block the user by replacing it with a title, username, and "show link button"
            var userName = $(elem).attr("data-username");
            
            this._bannedSubmissionUsers.push(userName);
            var bannedList = {}; 
            bannedList["RedditBoost_BlockedUserForSubmissions"] = this._bannedSubmissionUsers;
            window.dispatchEvent(new CustomEvent("RedditBoost_StoreSubmissionBans", { "detail": bannedList }));
            
            $("*[data-type='link']").each((index, thisLink) => {
                if ($(thisLink).children(".entry").children(".tagline").children(".author").text() == userName) {
                    var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f5f5f5; border-radius: 3px; padding: 1px 0;' data-usernamebanned='" + userName +"'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockUserSubmissions' data-username='" + userName +"'>show " + userName + "'s submissions</a>" + "</div>";
                    $(thisLink).after(element);
                    $(thisLink).hide();
                }
            });
        }
        
        private _unblockUserSubmissions(elem) {
            // Unblock the user
            var userName = $(elem).attr("data-username");
            var blockedIndex = this._bannedSubmissionUsers.indexOf(userName);
            if (blockedIndex >= 0) {
                this._bannedSubmissionUsers.splice(blockedIndex, 1);
                var bannedList = {}; 
                bannedList["RedditBoost_BlockedUserForSubmissions"] = this._bannedSubmissionUsers;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreSubmissionBans", { "detail": bannedList }));
            }
            
            $("*[data-type='link']").each((index, thisSubmissionBan) => {
                if ($(thisSubmissionBan).children(".entry").children(".tagline").children(".author").text() == userName) {
                    var element = $(thisSubmissionBan).parent().find("*[data-usernamebanned=" + userName + "]");
                    element.remove();
                    $(thisSubmissionBan).show();
                }
            });
        }
        
        /**
         * Return span element HTML to append to tagline for showing or hiding submissions.
         * @param {string} userName The username this element belongs to
         * @param {string} classToAdd The class to add (either blockUserSubmissionBans or unblockUserSubmissionBans)
         * @param {string} textToAdd The text displayed to the user to click
         */
        private _tagLineSpan(userName, classToAdd, textToAdd) {
            return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry" + "' data-username='" + userName + "'>" + textToAdd + "</a>";
        }
    }
        
    export var BanUserSubmissions: BanUserSubmissionsPlugin = new BanUserSubmissionsPlugin();
}