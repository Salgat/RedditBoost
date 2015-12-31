/// <reference path="../utils/Singleton.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />

/**
 * Tag users
 */
module RedditBoostPlugin {
    class MirrorPlugin extends utils.Singleton {
        
        get init() { return this._init; }
        
        private _init(): void {
            this.setSingleton();
            
            // Add click listener to try to retrieve mirror.
            $(document).on("click", ".RedditBoost_getMirror", (event) => {
                this._getMirror(event.currentTarget);
            });
            
            this._loadMirrorTags();
        }
        
        /**
         * Adds mirror button next to reddit link.
         */
        private _loadMirrorTags() {
            $('.link .entry p.title').each((index, elem) => {
                $(elem).append("<a href='javascript:void(0)' class='RedditBoost_getMirror RedditBoostTaglineEntry" + "' data-mirror-link='" + $(elem).children('.title').first().attr('href') + "'>mirror</a>");
            });
        }
        
        /**
         * Makes an GET request to retrieve the mirror link.
         */
        private _getMirror(element: EventTarget) : void {
            let link = $(element).attr('data-mirror-link');
            
            // Remove protocol
            link = link.replace(/.*?:\/\//g, "");
            
            // Indicate that we are retrieving the mirror
            $(element).text('loading mirror...');
            
            $.get('https://redditmirror.herokuapp.com/redditmirror/v1/mirror?url=' + link)
            .done((data) => {
                this._loadMirror(element, data);
            })
            .fail(() => {
                this._loadMirrorFailed(element);
            });
        }
        
        /**
         * Loads the mirror in a new window.
         */
        private _loadMirror(element: EventTarget, data: any) : void {
            $(element).text('mirror loaded').css('background-color', '#76ad4c');
            
            this._openInNewTab(data['url']);
        }
        
        /**
         * Indicates that the mirror load failed.
         */
        private _loadMirrorFailed(element: EventTarget) : void {
            $(element).text('no mirror').css('background-color', '#ff5252');
        }
        
        /**
         * Opens a link in a new tab.
         * 
         * Source: http://stackoverflow.com/questions/4907843/open-a-url-in-a-new-tab-and-not-a-new-window-using-javascript
         */
        private _openInNewTab(url) {
            $("<a>").attr("href", url).attr("target", "_blank")[0].click();
        }
    }
    
    export var Mirror: MirrorPlugin = new MirrorPlugin();
}