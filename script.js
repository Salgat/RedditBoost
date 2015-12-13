/**
 * Common functionality
 */
(function ( redditBuddy, $, undefined) {
	//$('head').append('<link rel="stylesheet" href="style2.css" type="text/css" />');
}( window.redditBuddy = window.redditBuddy || {}, jQuery ));


/** 
 * User Tagging
 */
(function ( redditBuddy, $, undefined) {
	var userTags = {};
	
	var tagHtmlPopup = "<div id='taggingPopup'>																								\
							<h3 id='taggingTitle'>Tag {username}</h3>																		\
							<div id='closeTag'>×</div>																						\
							<div id='taggingContents'>																						\
								<form id='tagginForm' name='taggingForm' action='javascript:void(0)'>														\
									<label class='tagPopupLabel'>Tag</label>																						\
									<input id='tagInput' type='text'></input>															\
									<label class='tagPopupLabel'>Color</label>																					\
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
		if (event.detail.hasOwnProperty("RedditBuddy_NameTags")) {
			userTags = event.detail["RedditBuddy_NameTags"];
		}
		
		// Go through each user and add their tag (if it exists)
		$(".entry").each(function( index ) {
			var user = $(this).children(".tagline").children(".author").text();
			var addText = "add tag";
			var tagline = $(this).children(".tagline");
			if (userTags != null && userTags.hasOwnProperty(user)) {
				var tagName = userTags[user].tag;
				tagline.children(".author").after("<span class='userTag' style='margin-right: 5px;" + userTags[user].tagColor + "'>" + tagName + "</a>");
				addText = "update tag";
			}
			
			// Also add a tagging button
			tagline.append("<a href='javascript:void(0)' class='redditBuddyTaglineEntry addTagName' data-username='" + user + "'>" + addText + "</a>");
		});
	});
	
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
			tagsList["RedditBuddy_NameTags"] = userTags;
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
}( window.redditBuddy = window.redditBuddy || {}, jQuery ));


/**
 * User comment banning
 */
(function ( redditBuddy, $, undefined) {
	var bannedUsers = [];
	
	/**
	* Initiates user comment blocking upon receiving the banned users list from storage.
	*/
	window.addEventListener("RetrievedCommentBans", function(event) {
		if (!event.detail.hasOwnProperty("RedditPlus_BlockedUserForComments")) {
			// Create a new empty entry in storage
			var bannedList = {}; 
			bannedList["RedditPlus_BlockedUserForComments"] = bannedUsers;
			window.dispatchEvent(new CustomEvent("StoreCommentBans", { "detail": bannedList }));
		} else {
			bannedUsers = event.detail["RedditPlus_BlockedUserForComments"];
		}
	
		// Go through each user and add a class to hide if matching
		$( ".author" ).each(function( index ) {
			var comment = $(this).parent().parent().parent();
			if (bannedUsers != null && bannedUsers.indexOf($(this).text()) >= 0 && comment.attr("data-type") == "comment") {
				comment.removeClass("noncollapsed").addClass("collapsed");
			}
		});
	
		// Add option to block or unblock a user
		$("*[data-type='comment']").each(function( index ) {
			var user = $(this).children(".entry").children(".tagline").children(".author").text();
			var tagline = $(this).children(".entry").children(".tagline");
			if (bannedUsers != null && bannedUsers.indexOf(user) >= 0) {
				// Unhide
				tagline.append(tagLineSpan(user, "unblockUserComments", "show user comments"));
			} else {
				// Hide
				tagline.append(tagLineSpan(user, "blockUserComments", "hide user comments"));
			}
		});
	}, false);
	
	/**
	 * Return span element HTML to append to tagline for showing or hiding comments.
	 * @param {string} userName The username this element belongs to
	 * @param {string} classToAdd The class to add (either blockUserComments or unblockUserComments)
	 * @param {string} textToAdd The text displayed to the user to click
	 */
	function tagLineSpan(userName, classToAdd, textToAdd) {
		return "<a href='javascript:void(0)' class='" + classToAdd + " redditBuddyTaglineEntry" + "' data-username='" + userName + "'>" + textToAdd + "</a>";
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
			bannedList["RedditPlus_BlockedUserForComments"] = bannedUsers;
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
	
}( window.redditBuddy = window.redditBuddy || {}, jQuery ));


/** 
 * User submission blocking
 */
(function ( redditBuddy, $, undefined) {
	var bannedSubmissionUsers = [];
	
	/**
	* Initiates user submission blocking upon receiving the banned users list from storage.
	*/
	window.addEventListener("RetrievedSubmissionBans", function(event) {
		if (!event.detail.hasOwnProperty("RedditPlus_BlockedUserForSubmissions")) {
			// Create a new empty entry in storage
			var bannedList = {}; 
			bannedList["RedditPlus_BlockedUserForSubmits"] = bannedSubmissionUsers;
			window.dispatchEvent(new CustomEvent("StoreCommentBans", { "detail": bannedList }));
		} else {
			bannedSubmissionUsers = event.detail["RedditPlus_BlockedUserForSubmissions"];
		}
	
		// Go through each user and add a class to hide if matching
		$( ".author" ).each(function( index ) {
			var comment = $(this).parent().parent().parent();
			if (bannedSubmissionUsers != null && bannedSubmissionUsers.indexOf($(this).text()) >= 0 && comment.attr("data-type") == "comment") {
				comment.removeClass("noncollapsed").addClass("collapsed");
			}
		});
	
		// Add option to block or unblock a user
		$("*[data-type='link']").each(function( index ) {
			var user = $(this).children(".entry").children(".tagline").children(".author").text();
			var tagline = $(this).children(".entry").children(".tagline");
			if (bannedSubmissionUsers != null && bannedSubmissionUsers.indexOf(user) >= 0) {
				// Unhide
				tagline.append(tagLineSpan(user, "unblockUserSubmissions", "show user submissions"));
			} else {
				// Hide
				tagline.append(tagLineSpan(user, "blockUserSubmissions", "hide user submissions"));
			}
		});
	}, false);
	
	/**
	 * Return span element HTML to append to tagline for showing or hiding comments.
	 * @param {string} userName The username this element belongs to
	 * @param {string} classToAdd The class to add (either blockUserComments or unblockUserComments)
	 * @param {string} textToAdd The text displayed to the user to click
	 */
	function tagLineSpan(userName, classToAdd, textToAdd) {
		return "<a href='javascript:void(0)' class='" + classToAdd + " redditBuddyTaglineEntry" + "' data-username='" + userName + "'>" + textToAdd + "</a>";
	}
	
	/**
	* Add click listener for blocking a user's submissions.
	*/
	$(document).on("click", ".blockUserSubmissions", function() {
		// Block the user by replacing it with a title, username, and "show link button"
		//var link = $(this).closest("*[data-type='link']");
		//link.hide();
		
		var userName = $(this).attr("data-username");
		$("*[data-type='link']").each(function( index, thisComment ) {
			if ($(thisComment).children(".entry").children(".tagline").children(".author").text() == userName) {
				var element = "<div class='link' style='text-align: center; background-color: #f2f2f2; border-radius: 3px; padding: 1px 0;'>" + $(thisComment).find("a.title").text() + " - " + "<a  href='javascript:void(0)' style='background-color: #e3e3e3 !important;' class='redditBuddyTaglineEntry' data-username='" + userName +"'>show " + userName + "'s submissions</a>" + "</div>";
				$(this).after(element);
				$(this).hide();
			}
		});
	});
	
	/**
	* Add click listener for unblocking a user's comments.
	*/
	$(document).on("click", ".unblockUserSubmissions", function() {
		// Unblock the user
		
	});
	
	/**
	* Upon loading, initiates events with onLoad.js that load submission blocking functionality.
	*/
	$(document).ready(function() {
		// When page loads, initiate event to get banned users list and collapse all submissions by those users
		window.dispatchEvent(new CustomEvent("GetSubmissionBans"));
	});
}( window.redditBuddy = window.redditBuddy || {}, jQuery ));















