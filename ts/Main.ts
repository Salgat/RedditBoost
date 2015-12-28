/*
Ideas:
    - Have a main function that simply loads the modules
    - Each module holds a seperate feature for RedditBoost
    - Compile with "tsc -p ."
*/


/// <reference path='references/jquery.d.ts' />
/// <reference path='features/TagUser.ts'/>
/// <reference path='features/BanUserComments.ts'/>
/// <reference path='features/BanUserSubmissions.ts'/>
/// <reference path='features/BanCustomCss.ts'/>
/// <reference path='features/HoverPreview.ts'/>

namespace RedditBoost {
    $(document).ready(function() {
        // Initialize feature plugins
        RedditBoostPlugin.TagUser.init();
        RedditBoostPlugin.BanUserComments.init();
        RedditBoostPlugin.BanUserSubmissions.init();
        RedditBoostPlugin.BanCustomCss.init();
        RedditBoostPlugin.HoverPreview.init();
    });
}
