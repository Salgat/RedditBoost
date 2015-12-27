/*
Ideas:
    - Have a main function that simply loads the modules
    - Each module holds a seperate feature for RedditBoost
    - Compile to a single js file: tsc --out Main.js Main.ts
*/

/// <reference path="references/jquery.d.ts" />
/// <reference path='features/TagUser.ts'/>

namespace RedditBoost {
    $(document).ready(function() {
        // Initialize feature plugins
        let tagUser = RedditBoostPlugin.TagUser;
        tagUser.init();
    });
}
