/*
Ideas:
    - Have a main function that simply loads the modules
    - Each module holds a seperate feature for RedditBoost
    - Compile to a single js file: tsc --target ES5 --out js/Main.js ts/Main.ts
*/

/// <reference path="references/jquery.d.ts" />
/// <reference path='features/TagUser.ts'/>

namespace RedditBoost {
    $(document).ready(function() {
        // Initialize feature plugins
        RedditBoostPlugin.TagUser.init();
    });
}
