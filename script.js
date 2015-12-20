/**
 * Common functionality
 */
(function ( RedditBoost, $, undefined) {
	//$('head').append('<link rel="stylesheet" href="style2.css" type="text/css" />');
}( window.RedditBoost = window.RedditBoost || {}, jQuery ));


/** 
 * User Tagging
 */
(function ( RedditBoost, $, undefined) {
	var loadedTags = false;
	var userTags = {};
	
	var tagHtmlPopup = "<div id='taggingPopup'>																								\
							<h3 id='taggingTitle'>Tag {username}</h3>																		\
							<div id='closeTag'>×</div>																						\
							<div id='taggingContents'>																						\
								<form id='tagginForm' name='taggingForm' action='javascript:void(0)'>										\
									<label class='tagPopupLabel'>Tag</label>																\
									<input id='tagInput' type='text'></input>																\
									<label class='tagPopupLabel'>Color</label>																\
									<select id='colorSelector'>																				\
										<option style='background-color: transparent; color: black !important;' value='none'>none</option>	\
										<option style='background-color: aqua; color: black !important;' value='aqua'>aqua</option>			\
										<option style='background-color: black; color: white !important;' value='black'>black</option>		\
										<option style='background-color: blue; color: white !important;' value='blue'>blue</option>			\
										<option style='background-color: fuchsia; color: white !important;' value='fuchsia'>fuchsia</option>\
										<option style='background-color: pink; color: black !important;' value='pink'>pink</option>			\
										<option style='background-color: gray; color: white !important;' value='gray'>gray</option>			\
										<option style='background-color: green; color: white !important;' value='green'>green</option>		\
										<option style='background-color: lime; color: black !important;' value='lime'>lime</option>			\
										<option style='background-color: maroon; color: white !important;' value='maroon'>maroon</option>	\
										<option style='background-color: navy; color: white !important;' value='navy'>navy</option>			\
										<option style='background-color: olive; color: white !important;' value='olive'>olive</option>		\
										<option style='background-color: orange; color: white !important;' value='orange'>orange</option>	\
										<option style='background-color: purple; color: white !important;' value='purple'>purple</option>	\
										<option style='background-color: red; color:  white !important;' value='red'>red</option>			\
										<option style='background-color: silver; color: black !important;' value='silver'>silver</option>	\
										<option style='background-color: teal; color: white !important;' value='teal'>teal</option>			\
										<option style='background-color: white; color: black !important;' value='white'>white</option>		\
										<option style='background-color: yellow; color: black !important;' value='yellow'>yellow</option>	\
									</select>																								\
									<input type='submit' id='saveTag' data-username='' value='save tag'>									\
								</form>																										\
							</div>																											\
						</div>																												";
	
	/**
	* Initiates user tagging upon receiving the user tags list from storage.
	*/
	window.addEventListener("RetrievedNameTags", function(event) {
		if (event.detail.hasOwnProperty("RedditBoost_NameTags")) {
			userTags = event.detail["RedditBoost_NameTags"];
		}
		
		// Go through each user and add their tag (if it exists)
		$(".entry").each(function( index ) {
			addTagOption(this);
		});
		loadedTags = true;
	});
	
	/**
	 * Update add tag tagline entries for newly loaded comments
	 */
	$(".entry").initialize( function(){
		if (loadedTags && !$(this).find('.addTagName').length) {
			addTagOption(this);
		}
	});
	
	/**
	 * Adds "add tag" tagline option to provided entry
	 */
	function addTagOption(entry) {
		if (!$(entry).closest('.deleted').length && !$(entry).find('.morecomments').length && !$(entry).find('.deepthread').length) {
			var user = $(entry).children(".tagline").children(".author").text();
			var addText = "add tag";
			var tagline = $(entry).children(".tagline");
			if (userTags != null && userTags.hasOwnProperty(user)) {
				var tagName = userTags[user].tag;
				tagline.children(".author").after("<span class='userTag' style='margin-right: 5px;" + userTags[user].tagColor + "'>" + tagName + "</a>");
				addText = "update tag";
			}

			// Also add a tagging button
			tagline.append("<a href='javascript:void(0)' class='RedditBoostTaglineEntry addTagName' data-username='" + user + "'>" + addText + "</a>");
		}
	}
	
	
	/**
	 * Display tagging popup.
	 */
	$(document).on("click", ".addTagName", function(event) {
		var userName = $(this).attr("data-username");
		var offset = $(this).offset();
		
		$('body').append(tagHtmlPopup);
		$("#taggingTitle").text($("#taggingTitle").text().replace("{username}", userName));
		
		$('#taggingPopup').offset({ top: offset.top+15, left: offset.left});
		$('#saveTag').attr("data-username", userName);
	});
	
	/**
	 * Close tagging popup.
	 */
	$(document).on("click", "#closeTag", function(event) {
		$('#taggingPopup').remove();
	});
	
	/**
	* Add click listener for tagging a user.
	*/
	$(document).on("click", "#saveTag", function(event) {
		var userName = $(this).attr("data-username");
		//var tag = prompt("Please enter desired tag for user '" + userName + "'\n\nNOTE: Leave empty to remove tag.","");
		var tag = $('#tagInput').val();
		var tagColor = $('#colorSelector option:selected').attr('style');
		
		// Save Tag
		if (tag != null) {
			if (tag == "") {
				// Empty string, remove tag
				delete userTags[userName];
			} else {
				userTags[userName] = {"tag": tag, "tagColor": tagColor};
			}
			
			var tagsList = {}; 
			tagsList["RedditBoost_NameTags"] = userTags;
			window.dispatchEvent(new CustomEvent("StoreNameTags", { "detail": tagsList }));	
		
			// Go through each user and add their tag (if it exists)
			$(".entry").each(function( index ) {
				var tagline = $(this).children(".tagline");
				var user = tagline.children(".author").text();
				if (user == userName) {
					var tagName = "";
					if (userTags[user] != null) {
						tagName = userTags[user].tag;
					}
					
					if (tag == "" || tagName == "") {
						// Remove tag
						tagline.children('.userTag').remove();
					} else if (tagline.children('.userTag').length) {
						tagline.children('.userTag').text(tagName).attr('style', userTags[user].tagColor);
					} else {
						tagline.children(".author").after("<span class='userTag' style='margin-right: 5px;" + userTags[user].tagColor + "'>" + tagName + "</a>");
					}
				
					var addText = "update tag";
					if (tag == "") {
						addText = "add tag";
					}
				
					// Also update the tagging button
					tagline.children(".addTagName").text(addText);
				}
			});
		}
		
		$('#taggingPopup').remove();
	});

	/**
	* Upon loading, initiates events with onLoad.js that load name tagging functionality.
	*/
	$(document).ready(function() {
		// When page loads, initiate event to get banned users list and collapse all comments by those users
		window.dispatchEvent(new CustomEvent("GetNameTags"));
	});
}( window.RedditBoost = window.RedditBoost || {}, jQuery ));


/**
 * User comment banning
 */
(function ( RedditBoost, $, undefined) {
	var bannedUsers = [];
	var hideLoaded = false;
	
	/**
	* Initiates user comment blocking upon receiving the banned users list from storage.
	*/
	window.addEventListener("RetrievedCommentBans", function(event) {
		if (!event.detail.hasOwnProperty("RedditBoost_BlockedUserForComments")) {
			// Create a new empty entry in storage
			var bannedList = {}; 
			bannedList["RedditBoost_BlockedUserForComments"] = bannedUsers;
			window.dispatchEvent(new CustomEvent("StoreCommentBans", { "detail": bannedList }));
		} else {
			bannedUsers = event.detail["RedditBoost_BlockedUserForComments"];
		}
	
		// Go through each user and add a class to hide if matching
		$( ".author" ).each(function( index ) {
			hideUserIfBanned(this);
		});
	
		// Add option to block or unblock a user
		$(".comment").each(function( index ) {
			addBlockOptionTagline(this);
		});
		hideLoaded = true;
	}, false);
	
	/**
	 * Update newly loaded comments for both the tagline and hiding
	 */
	$(".author").initialize( function(){
		if (hideLoaded) {
			hideUserIfBanned(this);
		}
	});
	
	/**
	 * Update newly loaded comments for both the tagline and hiding
	 */
	$(".comment").initialize( function(){
		if (hideLoaded) {
			addBlockOptionTagline(this);
		}
	});
	
	/**
	 * Add class to hide if matching banlist.
	 */
	function hideUserIfBanned(element) {
		var comment = $(element).parent().parent().parent();
		if (bannedUsers != null && bannedUsers.indexOf($(element).text()) >= 0 && comment.attr("data-type") == "comment") {
			comment.removeClass("noncollapsed").addClass("collapsed");
		}
	}
	
	/**
	 * 
	 */
	function addBlockOptionTagline(element) {
		var user = $(element).children(".entry").children(".tagline").children(".author").text();
		var tagline = $(element).children(".entry").children(".tagline");
		if (bannedUsers != null && bannedUsers.indexOf(user) >= 0) {
			// Unhide
			tagline.append(tagLineSpan(user, "unblockUserComments", "show user comments"));
		} else {
			// Hide
			tagline.append(tagLineSpan(user, "blockUserComments", "hide user comments"));
		}
	}
	
	/**
	 * Return span element HTML to append to tagline for showing or hiding comments.
	 * @param {string} userName The username this element belongs to
	 * @param {string} classToAdd The class to add (either blockUserComments or unblockUserComments)
	 * @param {string} textToAdd The text displayed to the user to click
	 */
	function tagLineSpan(userName, classToAdd, textToAdd) {
		return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry hideTaglineEntry" + "' data-username='" + userName + "'>" + textToAdd + "</a>";
	}
	
	/**
	* Add click listener for blocking a user's comments.
	*/
	$(document).on("click", ".unblockUserComments", function() {
		// Block the user
		blockOrUnblockUserComments(this, bannedUsers, false);
	});
	
	/**
	* Add click listener for unblocking a user's comments.
	*/
	$(document).on("click", ".blockUserComments", function() {
		// Unblock the user
		blockOrUnblockUserComments(this, bannedUsers, true);
	});
	
	/**
	* Blocks or unblocks a user's comments based on parameters.
	* @param {object} thisElement The element of the comment.
	* @param {array} bannedUsers An array of banned users.
	* @param {bool} isBlocking Whether to block or not the user's comments.
	*/
	function blockOrUnblockUserComments(thisElement, bannedUsers, isBlocking) {
		var blockingClass;
		if (!isBlocking) {
			blockingClass = ".unblockUserComments";
		} else {
			blockingClass = ".blockUserComments";
		}
		var textHeadline;
		if (!isBlocking) {
			textHeadline = "hide user comments";
		} else {
			textHeadline = "show user comments";
		}
		
		if (bannedUsers == null) bannedUsers = [];
		
		var userToChange = $(thisElement).attr("data-username");
		var blockedIndex = bannedUsers.indexOf(userToChange);
		if ((isBlocking && blockedIndex < 0) || (!isBlocking)) {
			if (isBlocking) {
				bannedUsers.push(userToChange);
			} else {
				bannedUsers.splice(blockedIndex, 1);
			}
			var bannedList = {}; 
			bannedList["RedditBoost_BlockedUserForComments"] = bannedUsers;
			window.dispatchEvent(new CustomEvent("StoreCommentBans", { "detail": bannedList }));
			
			$("*[data-type='comment']").each(function( index, thisComment ) {
				if ($(thisComment).children(".entry").children(".tagline").children(".author").text() == userToChange) {
					var textElement = $(thisComment).children(".entry").children(".tagline").children(blockingClass);
					textElement.text(textHeadline);
					
					if (isBlocking) {
						textElement.removeClass("blockUserComments").addClass("unblockUserComments");
						$(thisComment).removeClass("noncollapsed").addClass("collapsed");
					} else {
						textElement.removeClass("unblockUserComments").addClass("blockUserComments");
						$(thisComment).removeClass("collapsed").addClass("noncollapsed");
					}
				}
			});
		}
	}
	
	/**
	* Upon loading, initiates events with onLoad.js that load comment blocking functionality.
	*/
	$(document).ready(function() {
		// When page loads, initiate event to get banned users list and collapse all comments by those users
		window.dispatchEvent(new CustomEvent("GetCommentBans"));
	});
	
}( window.RedditBoost = window.RedditBoost || {}, jQuery ));


/** 
 * User submission blocking
 */
(function ( RedditBoost, $, undefined) {
	var bannedSubmissionUsers = [];
	
	/**
	* Initiates user submission blocking upon receiving the banned users list from storage.
	*/
	window.addEventListener("RetrievedSubmissionBans", function(event) {
		if (!event.detail.hasOwnProperty("RedditBoost_BlockedUserForSubmissions")) {
			// Create a new empty entry in storage
			var bannedList = {}; 
			bannedList["RedditBoost_BlockedUserForSubmissions"] = bannedSubmissionUsers;
			window.dispatchEvent(new CustomEvent("StoreSubmissionBans", { "detail": bannedList }));
		} else {
			bannedSubmissionUsers = event.detail["RedditBoost_BlockedUserForSubmissions"];
		}
	
		// Go through each user and hide if matching
		$("*[data-type='link']").each(function( index, thisLink ) {
			var userName = $(thisLink).children(".entry").children(".tagline").children(".author").text();
			if (bannedSubmissionUsers.indexOf(userName) >= 0) {
				var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;' data-usernamebanned='" + userName +"'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockUserSubmissions' data-username='" + userName +"'>show " + userName + "'s submissions</a>" + "</div>";
				$(thisLink).after(element);
				$(thisLink).hide();
			}
		});
	
		// Add option to block or unblock a user
		$("*[data-type='link']").each(function( index ) {
			var user = $(this).children(".entry").children(".tagline").children(".author").text();
			var tagline = $(this).children(".entry").children(".tagline");
			tagline.append(tagLineSpan(user, "blockUserSubmissions", "hide user submissions"));
		});
	}, false);
	
	/**
	 * Return span element HTML to append to tagline for showing or hiding submissions.
	 * @param {string} userName The username this element belongs to
	 * @param {string} classToAdd The class to add (either blockUserSubmissionBans or unblockUserSubmissionBans)
	 * @param {string} textToAdd The text displayed to the user to click
	 */
	function tagLineSpan(userName, classToAdd, textToAdd) {
		return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry" + "' data-username='" + userName + "'>" + textToAdd + "</a>";
	}
	
	/**
	* Add click listener for blocking a user's submissions.
	*/
	$(document).on("click", ".blockUserSubmissions", function() {
		// Block the user by replacing it with a title, username, and "show link button"
		var userName = $(this).attr("data-username");
		
		bannedSubmissionUsers.push(userName);
		var bannedList = {}; 
		bannedList["RedditBoost_BlockedUserForSubmissions"] = bannedSubmissionUsers;
		window.dispatchEvent(new CustomEvent("StoreSubmissionBans", { "detail": bannedList }));
		
		$("*[data-type='link']").each(function( index, thisLink ) {
			if ($(thisLink).children(".entry").children(".tagline").children(".author").text() == userName) {
				var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f5f5f5; border-radius: 3px; padding: 1px 0;' data-usernamebanned='" + userName +"'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockUserSubmissions' data-username='" + userName +"'>show " + userName + "'s submissions</a>" + "</div>";
				$(this).after(element);
				$(this).hide();
			}
		});
	});
	
	/**
	* Add click listener for unblocking a user's submissions.
	*/
	$(document).on("click", ".unblockUserSubmissions", function() {
		// Unblock the user
		var userName = $(this).attr("data-username");
		var blockedIndex = bannedSubmissionUsers.indexOf(userName);
		if (blockedIndex >= 0) {
			bannedSubmissionUsers.splice(blockedIndex, 1);
			var bannedList = {}; 
			bannedList["RedditBoost_BlockedUserForSubmissions"] = bannedSubmissionUsers;
			window.dispatchEvent(new CustomEvent("StoreSubmissionBans", { "detail": bannedList }));
		}
		
		$("*[data-type='link']").each(function( index, thisSubmissionBan ) {
			if ($(thisSubmissionBan).children(".entry").children(".tagline").children(".author").text() == userName) {
				var element = $(thisSubmissionBan).parent().find("*[data-usernamebanned=" + userName + "]");
				element.remove();
				$(this).show();
			}
		});
	});
	
	/**
	* Upon loading, initiates events with onLoad.js that load submission blocking functionality.
	*/
	$(document).ready(function() {
		// When page loads, initiate event to get banned users list and collapse all submissions by those users
		window.dispatchEvent(new CustomEvent("GetSubmissionBans"));
	});
}( window.RedditBoost = window.RedditBoost || {}, jQuery ));

/** 
 * Image Hover Preview
 */
(function ( RedditBoost, $, undefined) {
	var imageCache = {};
	var lastImage = { lastLink: "", active: false, element: null};
	
	var loadingAnimation = "<div id='loadingAnimation' class='uil-default-css' style='transform:scale(1);'>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(0deg) translate(0,-60px);transform:rotate(0deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(30deg) translate(0,-60px);transform:rotate(30deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(60deg) translate(0,-60px);transform:rotate(60deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(90deg) translate(0,-60px);transform:rotate(90deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(120deg) translate(0,-60px);transform:rotate(120deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(150deg) translate(0,-60px);transform:rotate(150deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(180deg) translate(0,-60px);transform:rotate(180deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(210deg) translate(0,-60px);transform:rotate(210deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(240deg) translate(0,-60px);transform:rotate(240deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(270deg) translate(0,-60px);transform:rotate(270deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(300deg) translate(0,-60px);transform:rotate(300deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
								<div style='top:80px;left:93px;width:14px;height:40px;background:black;-webkit-transform:rotate(330deg) translate(0,-60px);transform:rotate(330deg) translate(0,-60px);border-radius:10px;position:absolute;'></div>\
							</div>"
	
	var tagHtmlPopup = "<div id='imagePopup'>																								\
						<img class='targetImage' src='' id='imagePopupImg'>																	\
						<h3 id='imagePopupTitle'>																							\
						</div>																												";

	var gifvPlayer = "<video class='targetImage' preload='auto' autoplay='autoplay' muted='muted' loop='loop' webkit-playsinline>			\
					  <source src='' id='imageWebm'	type='video/webm'>																		\
					  <source src='' id='imageMp4'	type='video/mp4'>																		\
					  </video>																												";
	
	/**
	 * Inserts the image preview when a mouse hovers over a supported image link.
	 */
	$("a.title, p a").mouseover(function() {
		var link = $(this).attr("href");
		lastImage.lastLink = link;
		lastImage.element = this;
		lastImage.active = true;
		TryDisplayImage(this);
	});
	
	/**
	 * Try to display image.
	 */
	function TryDisplayImage(element) {
		var offset = $(element).offset();
		var link = $(element).attr("href");
		var title = $(element).text();
		var result = isImageLink(link, true);
		link = result.link;
		if (result.type != "img" && result.type != "gif" && result.type != "gifv") return;
		
		displayImage(link, title, offset, result.type);
		$(element).addClass("activeImagePopup");
	}
	
	/**
	 * Removes the image preview when the mouse is no longer hovering over the link.
	 */
	$("a.title, p a").mouseleave(function() {
		lastImage.active = false;
		$('#imagePopup').remove();
		$(this).removeClass("activeImagePopup");
		loadingRemoved = false;
	});
	
	/**
	 * Returns the filename with no parameters.
	 */
	function filenameWithoutParameters(link) {
		var splitString = link.split("/");
		var fileString = splitString.pop();
		var fileWithoutParameters = fileString.split("?")[0];
		return fileWithoutParameters;
	}
	
	/**
	 * Returns true if the link is a supported image type.
	 */
	function isImageLink(link, checkApi) {
		var fileWithoutParameters = filenameWithoutParameters(link);
		
		// Checking for gifv with imgur
		imagePattern = new RegExp(".(gifv)$"); // Todo: Handle gifv and other html5 images
		imagePattern.ignoreCase = true;
		result = imagePattern.test(fileWithoutParameters);
		if (result && link.indexOf("imgur.com") >= 0) return {link: link, type: "gifv"};
		
		// Checking for gif with imgur
		imagePattern = new RegExp(".(gif)$"); // Todo: Handle gifv and other html5 images
		imagePattern.ignoreCase = true;
		result = imagePattern.test(fileWithoutParameters);
		if (result && (link.indexOf("imgur.com") >= 0 || link.indexOf("gfycat.com") >= 0)) return {link: link, type: "gif"};
		
		// Checking for default image types
		var imagePattern = new RegExp(".(gif|jpg|jpeg|png|bmp)$"); // Todo: Handle gifv and other html5 images
		imagePattern.ignoreCase = true;
		var result = imagePattern.test(fileWithoutParameters);
		if (result) return {link: link, type: "img"};
		
		// Does not end in any extension, so check if it is an imgur link
		if (checkApi && link.indexOf("imgur.com") >= 0) {
			if (link.indexOf("/gallery/") >= 0 || link.indexOf("/a/") >= 0) {
				// For now block gallery imgurs
				return {link: link, type: ""};
			} else {
				return TryLoadImageFromCache(link, fileWithoutParameters, getImgurData);
			}
		} else if (checkApi && link.indexOf("gfycat.com") >= 0) {
			return TryLoadImageFromCache(link, fileWithoutParameters, getGfycatData);
		}
			
		return {link: link, type: ""};
	}
	
	function TryLoadImageFromCache(link, fileName, apiCaller) {
		if (imageCache[fileName] == "") {
			// Link has no image
			return {link: link, type: ""};
		} else if (imageCache[fileName] != null) {
			// Try processing the image again with the link from the api call
			return isImageLink(imageCache[fileName], false);
		} else {
			// Retrieve image information and for now, load nothing
			if (fileName != "") {
				apiCaller(fileName);
			}
			return {link: link, type: ""}
		}
	}
	
	/**
	 * Image has been retrieved asynchronously, try showing the image again if still hovering
	 */
	window.addEventListener("RetrievedImgurData", function(event) {
		var hash = event.detail["image"]["image"]["hash"];
		var imageUrl = event.detail["image"]["links"]["original"];
		if (imageUrl != null) {
			imageCache[hash] = imageUrl;
			
			var lastImageHash = filenameWithoutParameters(lastImage.lastLink);
			if (lastImage.active && lastImageHash == hash) {
				// Still hovering over image, display it
				TryDisplayImage(lastImage.element);
			}
		} else {
			imageCache[hash] = "";
		}
	}, false);
	window.addEventListener("RetrievedGfycatData", function(event) {
		var hash = event.detail["gfyItem"]["gfyName"];
		var imageUrl = event.detail["gfyItem"]["gifUrl"];
		if (imageUrl != null) {
			imageCache[hash] = imageUrl;
			
			var lastImageHash = filenameWithoutParameters(lastImage.lastLink);
			if (lastImage.active && lastImageHash == hash) {
				// Still hovering over image, display it
				TryDisplayImage(lastImage.element);
			}
		} else {
			imageCache[hash] = "";
		}
	}, false);
	
	/**
	 * Updates the image cache and raises an event notifying that it finished.
	 */
	function getImgurData(filename) {
		var imageApiUrl = "//api.imgur.com/2/image/" + filename + ".json";
		$.get(imageApiUrl)
		.done(function( data ) {
			window.dispatchEvent(new CustomEvent("RetrievedImgurData", { "detail": data }));
		});
	}
	function getGfycatData(filename) {
		var imageApiUrl = "//gfycat.com/cajax/get/" + filename;
		$.get(imageApiUrl)
		.done(function( data ) {
			window.dispatchEvent(new CustomEvent("RetrievedGfycatData", { "detail": data }));
		});
	}
	
	/**
	 * Inserts a popup with the image to preview.
	 */
	function displayImage(link, title, offset, type) {
		$('body').append(tagHtmlPopup);
		$('#imagePopup').offset({ top: offset.top+20, left: offset.left});
		$('#imagePopup h3').text(title);
		imageUpdated = false;
		
		if (type == "gifv" || type == "gif" && (link.indexOf("imgur.com") >= 0 || link.indexOf("gfycat.com") >= 0)) {
			// Replace img with video player
			$('#imagePopup img').remove();
			$('#imagePopup').prepend(gifvPlayer);
			var filename = filenameWithoutParameters(link);
			if (link.indexOf("imgur.com") >= 0) {
				$('#imageWebm').attr("src", "//i.imgur.com/" + filename.replace("." + type, ".webm"));
				$('#imageMp4').attr("src", "//i.imgur.com/" + filename.replace("." + type, ".mp4"));
			} else if (link.indexOf("gfycat.com") >= 0) {
				$('#imageWebm').attr("src", "//giant.gfycat.com/" + filename.replace("." + type, ".webm"));
				$('#imageMp4').attr("src", "//giant.gfycat.com/" + filename.replace("." + type, ".mp4"));
			}
		} else {
			$('#imagePopup img').attr("src", link);
		}
	}
	
	/**
	 * Continuously checks the popup image to make sure it fits properly on the screen.
	 */
	var imageHeight = 0;
	var imageWidth = 0;
	var imageUpdated = false;
	var loadingRemoved = false;
	(function(){
		setInterval(function() {
			if ($(".targetImage").height() > 0 && !loadingRemoved) {
				// Once something starts loading, remove it
				$("#loadingAnimation").remove();
				loadingRemoved = true;
			}
			
			if ($("#imagePopup").length <= 0 || imageUpdated) {
				$("#loadingAnimation").remove();
				return;
			}
			
			if ($("#loadingAnimation").length <= 0 && !loadingRemoved) {
				$('#imagePopup').prepend(loadingAnimation);
			}
			
			// Check if there is more space above the link
			var offset = $(".activeImagePopup").offset();
			var viewportWidth = $(window).width();
			var viewportHeight = $(window).height();
			var linkOffset = $(".activeImagePopup").offset();
			var linkWindowOffsetTop = linkOffset.top - $(window).scrollTop();
			var spaceBelow = viewportHeight - linkWindowOffsetTop;
			var spaceAbove = viewportHeight - spaceBelow;
			var showBelow = true;
			if (spaceAbove > spaceBelow) {
				showBelow = false;
				$('#imagePopup').offset({ top: $(window).scrollTop()});
				
				var windowOffsetTop = offset.top - $(window).scrollTop();
				var windowOffsetLeft = offset.left - $(window).scrollLeft();
				var popupWidth = $('#imagePopup').width();
				var popupHeight = $('#imagePopup').height();
				if (popupWidth < viewportWidth - windowOffsetLeft - 20) {
					$('#imagePopup .targetImage').css("max-width", viewportWidth - windowOffsetLeft - 20);
					//imageUpdated = true;
				} else {
					$('#imagePopup .targetImage').removeAttr('max-width');
				}
				if (windowOffsetTop - 50 < popupHeight) {
					$('#imagePopup .targetImage').css("max-height", windowOffsetTop - 50);
					imageUpdated = true;
				} else {
					$('#imagePopup .targetImage').removeAttr('max-height');
				}
				
			} else {
				$('#imagePopup').offset({ top: offset.top+20, left: offset.left});
				offset.top = offset.top - 20;
				windowOffsetTop = offset.top - $(window).scrollTop();
				windowOffsetLeft = offset.left - $(window).scrollLeft();
				popupWidth = $('#imagePopup').width();
				popupHeight = $('#imagePopup').height();
				if (popupWidth > viewportWidth - windowOffsetLeft - 20) {
					$('#imagePopup .targetImage').css("max-width", viewportWidth - windowOffsetLeft -20);
					//imageUpdated = true;
				} else {
					$('#imagePopup .targetImage').removeAttr('max-width');
				}
				if (popupHeight > viewportHeight - windowOffsetTop - 90) {
					$('#imagePopup .targetImage').css("max-height", viewportHeight - windowOffsetTop - 90);
					imageUpdated = true;
				} else {
					$('#imagePopup .targetImage').removeAttr('max-height');
				}
			}
			
			var currentImageHeight = $('.targetImage').height();
			var currentImageWidth = $('.targetImage').width();
			if ((currentImageHeight > 0 && currentImageHeight == imageHeight) && (currentImageWidth > 0 && currentImageWidth == imageWidth)) {
				imageUpdated = true;
				imageHeight = 0;
				imageWidth = 0;
			}
		}, 10);
	})();

}( window.RedditBoost = window.RedditBoost || {}, jQuery ));



/** 
 * Block custom CSS
 */
(function ( RedditBoost, $, undefined) {
	var bannedCss = [];
	var cssButton = "<div id='disableCss' class='disableCss'>Disable CSS</div>"
	
	$(document).ready(function() {
		window.dispatchEvent(new CustomEvent("GetCssBans"));
	});
	
	window.addEventListener("RetrievedCssBans", function(event) {
		if (!event.detail.hasOwnProperty("RedditBoost_BlockedCss")) {
			// Create a new empty entry in storage
			var bannedList = {}; 
			bannedList["RedditBoost_BlockedCss"] = bannedCss;
			window.dispatchEvent(new CustomEvent("StoreCssBans", { "detail": bannedList }));
		} else {
			bannedCss = event.detail["RedditBoost_BlockedCss"];
		}
		
		var subredditName = $(".redditname").text();
		$('body').append(cssButton);
		var buttonWidth = $("#disableCss").width();
		$("#disableCss").css("width", (buttonWidth + 1) + "px");
		if (bannedCss.indexOf(subredditName) >= 0) {
			$("#disableCss").text("Enable CSS").removeClass("disableCss").addClass("enableCss");
			$('link[title="applied_subreddit_stylesheet"]').prop('disabled', true);
		} else {
			$('link[title="applied_subreddit_stylesheet"]').prop('disabled', false);
		}
	}, false);
	
	$(document).on("click", ".disableCss", function(event) {
		$(this).text("Enable CSS");
		$(this).removeClass('disableCss').addClass('enableCss');
		$('link[title="applied_subreddit_stylesheet"]').prop('disabled', true);
		
		var subredditName = $(".redditname").text();
		bannedCss.push(subredditName);
		var bannedList = {}; 
		bannedList["RedditBoost_BlockedCss"] = bannedCss;
		window.dispatchEvent(new CustomEvent("StoreCssBans", { "detail": bannedList }));
		
	});
	
	$(document).on("click", ".enableCss", function(event) {
		$(this).text("Disable CSS");
		$(this).removeClass('enableCss').addClass('disableCss');
		$('link[title="applied_subreddit_stylesheet"]').prop('disabled', false)
		
		var subredditName = $(".redditname").text();
		var blockedIndex = bannedCss.indexOf(subredditName);
		if (blockedIndex >= 0) {
			bannedCss.splice(blockedIndex, 1);
			var bannedList = {}; 
			bannedList["RedditBoost_BlockedCss"] = bannedCss;
			window.dispatchEvent(new CustomEvent("StoreCssBans", { "detail": bannedList }));
		}
	});

}( window.RedditBoost = window.RedditBoost || {}, jQuery ));


/** 
 * Subreddit blocking
 */
(function ( RedditBoost, $, undefined) {
	var bannedSubreddits = [];
	
	/**
	* Initiates subreddit blocking upon receiving the banned subreddits list from storage.
	*/
	window.addEventListener("RetrievedSubredditBans", function(event) {
		if (!event.detail.hasOwnProperty("RedditBoost_BlockedSubreddits")) {
			// Create a new empty entry in storage
			var bannedList = {}; 
			bannedList["RedditBoost_BlockedSubreddits"] = bannedSubreddits;
			window.dispatchEvent(new CustomEvent("StoreSubredditBans", { "detail": bannedList }));
		} else {
			bannedSubreddits = event.detail["RedditBoost_BlockedSubreddits"];
		}
		
		// Add hiding tagline for each link
		$("*[data-type='link']").each(function( index ) {
			var subreddit = $(this).children(".entry").children(".tagline").children(".subreddit").text().substring(3);
			var tagline = $(this).children(".entry").children(".tagline");
			tagline.append(tagLineSpan(subreddit, "blockSubreddit", "hide subreddit"));
		});
		
		// Go through each user and hide if matching
		$("*[data-type='link']").each(function( index, thisLink ) {
			// Todo: Handle if link is already hidden due to banned user
			var subreddit = $(this).children(".entry").children(".tagline").children(".subreddit").text().substring(3);
			if (bannedSubreddits.indexOf(subreddit) >= 0) {
				var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;' data-subredditbanned='" + subreddit +"'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockSubreddit' data-subreddit='" + subreddit +"'>show /r/" + subreddit + " links</a>" + "</div>";
				$(thisLink).after(element);
				$(thisLink).hide();
			}
		});
	}, false);
	
	/**
	 * Return span element HTML to append to tagline for showing or hiding subreddits.
	 * @param {string} userName The username this element belongs to
	 * @param {string} classToAdd The class to add
	 * @param {string} textToAdd The text displayed to the user to click
	 */
	function tagLineSpan(subreddit, classToAdd, textToAdd) {
		return "<a href='javascript:void(0)' class='" + classToAdd + " RedditBoostTaglineEntry" + "' data-subreddit='" + subreddit + "'>" + textToAdd + "</a>";
	}
	
	/**
	* Add click listener for blocking a subreddit.
	*/
	$(document).on("click", ".blockSubreddit", function() {
		// Block the subreddit by replacing it with a title, username, and "show subreddit links button"
		var subreddit = $(this).attr("data-subreddit");
		
		bannedSubreddits.push(subreddit);
		var bannedList = {}; 
		bannedList["RedditBoost_BlockedSubreddits"] = bannedSubreddits;
		window.dispatchEvent(new CustomEvent("StoreSubredditBans", { "detail": bannedList }));
		
		$("*[data-type='link']").each(function( index, thisLink ) {
			if ($(this).children(".entry").children(".tagline").children(".subreddit").text().substring(3) == subreddit) {
				var element = "<div class='link RedditBoostTaglineEntry' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;' data-subredditbanned='" + subreddit +"'>" + $(thisLink).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='unblockSubreddit' data-subreddit='" + subreddit +"'>show /r/" + subreddit + " links</a>" + "</div>";
				$(this).after(element);
				$(this).hide();
			}
		});
	});
	
	/**
	* Add click listener for unblocking a subreddit.
	*/
	$(document).on("click", ".unblockSubreddit", function() {
		// Unblock the subreddit
		var subreddit = $(this).attr("data-subreddit");
		var blockedIndex = bannedSubreddits.indexOf(subreddit);
		if (blockedIndex >= 0) {
			bannedSubreddits.splice(blockedIndex, 1);
			var bannedList = {}; 
			bannedList["RedditBoost_BlockedSubreddits"] = bannedSubreddits;
			window.dispatchEvent(new CustomEvent("StoreSubredditBans", { "detail": bannedList }));
		}
		
		$("*[data-type='link']").each(function( index, thisSubredditBan ) {
			if ($(thisSubredditBan).children(".entry").children(".tagline").children(".subreddit").text().substring(3) == subreddit) {
				var element = $(thisSubredditBan).parent().find("*[data-subredditbanned=" + subreddit + "]");
				element.remove();
				$(thisSubredditBan).show();
			}
		});
	});
	
	/**
	* Upon loading, initiates events with onLoad.js that load subreddit blocking functionality.
	*/
	$(document).ready(function() {
		// First make sure we're not on a subreddit or multi-subreddit.
		var currentSubreddit = $(".redditname").first().text();
		if (currentSubreddit != "" && currentSubreddit != "all") return;
		
		// When page loads, initiate event to get banned subreddits list and collapse all submissions by those subreddits
		window.dispatchEvent(new CustomEvent("GetSubredditBans"));
	});
}( window.RedditBoost = window.RedditBoost || {}, jQuery ));




