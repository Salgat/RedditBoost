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
