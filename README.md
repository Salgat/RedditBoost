# RedditBoost
A set of simple features to enhance reddit.

## Running
As of now RedditBoost only works with Chrome. To setup, complete the following instructions,

1. In Chrome, go to Settings->Extensions
2. Check the "Developer mode" checkbox
3. Click "Load unpacked extension..."
4. Select the folder of the RedditBoost repo and press OK
5. To disable, either uncheck the "Enabled" checkbox or click the trash can to permanently remove it

## Features
RedditBoost is intended to be a lightweight and mostly seamless version of RES for a small set of features. Below are some of the features added.

![](https://github.com/Salgat/BubbleGrow/blob/master/doc/usertag.png)
- Tagging users

![](https://github.com/Salgat/BubbleGrow/blob/master/doc/hoverpreview.png)
- Hover over image links to preview them

![](https://github.com/Salgat/BubbleGrow/blob/master/doc/usersubmissionblock.png)
- Block all selected user's submissions

![](https://github.com/Salgat/BubbleGrow/blob/master/doc/usercommentblock.png)
- Hide all selected user's comments

![](https://github.com/Salgat/BubbleGrow/blob/master/doc/cssblock.png)
- Disable Subreddit CSS

![](https://github.com/Salgat/BubbleGrow/blob/master/doc/mirror.png)
- Link mirrors

## Feedback and contributions
This project uses Gitflow so a feature branch and pull request to the develop branch are necessary if you want your feature pulled in. Additionally, this project follows a simplistic and clean commit style of the format "Action Very Short Summary" with a more thorough description following the commit title. Actions allowed are "Add, Remove, Update, Refactor, and Fix" all in the present tense. Any failure to follow this format will result in the pull request being rejected.

## Building
Install both of these prior to running this project.

* [npm (package manager)](https://www.npmjs.com)
* ``npm install -g typescript``

After installing npm and typescript, open the command prompt and change your directory to RedditBoost's folder location. Run the following command to compile to JavaScript,

* ``tsc -p .``

While the JavaScript file is considered a build artifact, it is still included as part of a commit/pull request so that others can immediately run the latest development and master branches.
