/// <reference path="../utils/Singleton.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />

/**
 * Block specific subreddit
 */
module RedditBoostPlugin {
    class BanSubredditsPlugin extends utils.Singleton {
        private _bannedSubreddits: string[] = [];
        
        get init() { return this._init; }
        
        private _init(): void {
            this.setSingleton();
            
            // First make sure we're not on a subreddit or multi-subreddit.
            var currentSubreddit = $(".redditname").first().text();
            if (currentSubreddit != "" && currentSubreddit != "all") {
                return;
            }
            
            // Add click listener for blocking a subreddit.
            $(document).on("click", ".blockSubreddit", (event) => {
                this._blockSubreddit(event.currentTarget);
            });
            
            // Add click listener for unblocking a subreddit.
            $(document).on("click", ".unblockSubreddit", (event) => {
                this._unblockSubreddit(event.currentTarget);
            });
            
            // Initiates subreddit blocking upon receiving the banned list from storage.
            window.addEventListener("RedditBoost_RetrievedSubredditBans", (event) => {
                this._retrievedSubredditBans(event);
            }, false);
            
            // When page loads, initiate event to get banned subreddits list and collapse all submissions by those subreddits
		    window.dispatchEvent(new CustomEvent("RedditBoost_GetSubredditBans"));
        }

        private _retrievedSubredditBans(event) {
            if (!event.detail.hasOwnProperty("RedditBoost_BlockedSubreddits")) {
                // Create a new empty entry in storage
                var bannedList = {}; 
                bannedList["RedditBoost_BlockedSubreddits"] = this._bannedSubreddits;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreSubredditBans", { "detail": bannedList }));
            } else {
                this._bannedSubreddits = event.detail["RedditBoost_BlockedSubreddits"];
            }
        
            // Add hiding tagline for each link
            $("*[data-type='link']").each((index, thisLink) => {
                var subreddit = $(thisLink).children(".entry").children(".tagline").children(".subreddit").text().substring(3);
                var tagline = $(thisLink).children(".entry").children(".tagline");
                tagline.append(this._tagLineSpan(subreddit, "blockSubreddit", "hide subreddit"));
            });
            
            // Go through each user and hide if matching
            $("*[data-type='link']").each((index, thisLink) => {
                // Todo: Handle if link is already hidden due to banned user
                var subreddit = $(thisLink).children(".entry").children(".tagline").children(".subreddit").text().substring(3);
            
                if (this._bannedSubreddits.indexOf(subreddit) >= 0) {
                    var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;' data-subredditbanned='" + subreddit +"'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockSubreddit' data-subreddit='" + subreddit +"'>show /r/" + subreddit + " links</a>" + "</div>";
                    $(thisLink).after(element);
                    $(thisLink).hide();
                }
            });
        }
        
        /**
        * Handle blocking a subreddit.
        */
        private _blockSubreddit(elem) {
            // Block the subreddit by replacing it with a title, username, and "show subreddit links button"
            let subreddit = $(elem).attr("data-subreddit");
            
            this._bannedSubreddits.push(subreddit);
            let bannedList = {}; 
            bannedList["RedditBoost_BlockedSubreddits"] = this._bannedSubreddits;
            window.dispatchEvent(new CustomEvent("RedditBoost_StoreSubredditBans", { "detail": bannedList }));
            
            $("*[data-type='link']").each((index, thisLink) =>  {
                if ($(thisLink).children(".entry").children(".tagline").children(".subreddit").text().substring(3) == subreddit) {
                    var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;' data-subredditbanned='" + subreddit +"'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockSubreddit' data-subreddit='" + subreddit +"'>show /r/" + subreddit + " links</a>" + "</div>";
                    $(thisLink).after(element);
                    $(thisLink).hide();
                }
            });
        }
        
        /**
        * Handle unblocking a subreddit.
        */
        private _unblockSubreddit(elem) {
            // Unblock the subreddit
            var subreddit = $(elem).attr("data-subreddit");
            var blockedIndex = this._bannedSubreddits.indexOf(subreddit);
            if (blockedIndex >= 0) {
                this._bannedSubreddits.splice(blockedIndex, 1);
                var bannedList = {}; 
                bannedList["RedditBoost_BlockedSubreddits"] = this._bannedSubreddits;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreSubredditBans", { "detail": bannedList }));
            }
            
            $("*[data-type='link']").each((index, thisLink) =>  {
                if ($(thisLink).children(".entry").children(".tagline").children(".subreddit").text().substring(3) == subreddit) {
                    var element = $(thisLink).parent().find("*[data-subredditbanned=" + subreddit + "]");
                    element.remove();
                    $(thisLink).show();
                }
            });
        }
        
        /**
         * Return span element HTML to append to tagline for showing or hiding subreddits.
         * @param {string} userName The username this element belongs to
         * @param {string} classToAdd The class to add
         * @param {string} textToAdd The text displayed to the user to click
         */
        private _tagLineSpan(subreddit, classToAdd, textToAdd) {
            return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry" + "' data-subreddit='" + subreddit + "'>" + textToAdd + "</a>";
        }
    }
        
    export var BanSubreddits: BanSubredditsPlugin = new BanSubredditsPlugin();
}