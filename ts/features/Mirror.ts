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
        private _getMirror(element: EventTarget) {
            let link = $(element).attr('data-mirror-link');
            
            // Remove protocol
            link = link.replace(/.*?:\/\//g, "");
            
            // Indicate that we are retrieving the mirror
            $(element).text('loading mirror...');
            
            //$.get('http://redditmirror.salgat.net/redditmirror/v1/mirror?url=' + link)
            $.get('http://127.0.0.1:5000/redditmirror/v1/mirror?url=' + link)
            .done((data) => {
                window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedMirror", { "detail": data }));
            });
        }
    }
    
    export var Mirror: MirrorPlugin = new MirrorPlugin();
}