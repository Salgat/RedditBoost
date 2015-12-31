/// <reference path="../utils/Singleton.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />

/** 
 * Block custom CSS
 */
module RedditBoostPlugin {
    class BanCustomCssPlugin extends utils.Singleton {
        private _bannedCss: string[] = [];
	    private _cssButton: string = "<div id='disableCss' class='disableCss'>Disable CSS</div>";
        
        get init() { return this._init; }
        
        private _init(): void {
            this.setSingleton();
            
            window.addEventListener("RedditBoost_RetrievedCssBans", (event) => {
                this._handleRetrievedCssBans(event);
            }, false);
            
            $(document).on("click", ".disableCss", (event) => {
                this._disableCssButtonHandler(event);
            });
            
            $(document).on("click", ".enableCss", (event) => {
                this._enableCssButtonHandler(event);
            })
            
            window.dispatchEvent(new CustomEvent("RedditBoost_GetCssBans"));
        }    
        
        private _handleRetrievedCssBans(event) {
            if (!event.detail.hasOwnProperty("RedditBoost_BlockedCss")) {
                // Create a new empty entry in storage
                var bannedList = {}; 
                bannedList["RedditBoost_BlockedCss"] = this._bannedCss;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreCssBans", { "detail": bannedList }));
            } else {
                this._bannedCss = event.detail["RedditBoost_BlockedCss"];
            }
            
            var subredditName = $(".redditname").text();
            $('body').append(this._cssButton);
            var buttonWidth = $("#disableCss").width();
            $("#disableCss").css("width", (buttonWidth + 1) + "px");
            if (this._bannedCss.indexOf(subredditName) >= 0) {
                $("#disableCss").text("Enable CSS").removeClass("disableCss").addClass("enableCss");
                $('link[title="applied_subreddit_stylesheet"]').prop('disabled', true);
            } else {
                $('link[title="applied_subreddit_stylesheet"]').prop('disabled', false);
            }
        }
            
        private _disableCssButtonHandler(event) {
            $(event.currentTarget).text("Enable CSS");
            $(event.currentTarget).removeClass('disableCss').addClass('enableCss');
            $('link[title="applied_subreddit_stylesheet"]').prop('disabled', true);
            
            var subredditName = $(".redditname").text();
            this._bannedCss.push(subredditName);
            var bannedList = {}; 
            bannedList["RedditBoost_BlockedCss"] = this._bannedCss;
            window.dispatchEvent(new CustomEvent("RedditBoost_StoreCssBans", { "detail": bannedList }));
        }
        
        private _enableCssButtonHandler(event) {
            $(event.currentTarget).text("Disable CSS");
            $(event.currentTarget).removeClass('enableCss').addClass('disableCss');
            $('link[title="applied_subreddit_stylesheet"]').prop('disabled', false)
            
            var subredditName = $(".redditname").text();
            var blockedIndex = this._bannedCss.indexOf(subredditName);
            if (blockedIndex >= 0) {
                this._bannedCss.splice(blockedIndex, 1);
                var bannedList = {}; 
                bannedList["RedditBoost_BlockedCss"] = this._bannedCss;
                window.dispatchEvent(new CustomEvent("RedditBoost_StoreCssBans", { "detail": bannedList }));
            }
        }
    }
        
    export var BanCustomCss: BanCustomCssPlugin = new BanCustomCssPlugin();
}