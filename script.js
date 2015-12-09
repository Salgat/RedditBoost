(function ( redditBuddy, $, undefined) {
	
	////////////////////////////////////////////////////////////
	////////////////// User Comments Blocking //////////////////
	////////////////////////////////////////////////////////////
	
	var bannedUsers = [];
	
	/**
	* Initiates user comment blocking upon receiving the banned users list from storage.
	*/
	window.addEventListener("RetrievedCommentBans", function(event) {
		if (!event.detail.hasOwnProperty("RedditPlus_BlockedUserForComments")) return;
		bannedUsers = event.detail["RedditPlus_BlockedUserForComments"];
	
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
			if (bannedUsers != null && bannedUsers.indexOf(user) >= 0) {
				// Unhide
				$(this).children(".entry").children(".tagline").append("<a href='javascript:void(0)' class='unblockUserComments' style='margin-left: 5px;' data-username='" + user + "'>" + "show user comments" + "</a>");
			} else {
				// Hide
				$(this).children(".entry").children(".tagline").append("<a href='javascript:void(0)' class='blockUserComments' style='margin-left: 5px;' data-username='" + user + "'>" + "hide user comments" + "</a>");
			}
		});
	}, false);
	
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
 * User Tagging
 * TODO2: Add a background to each item to distinguish them all
 */
(function ( redditBuddy, $, undefined) {
	
	var userTags = {};
	
	/**
	* Initiates user tagging upon receiving the user tags list from storage.
	*/
	window.addEventListener("RetrievedNameTags", function(event) {
		if (event.detail.hasOwnProperty("RedditBuddy_NameTags")) {
			userTags = event.detail["RedditBuddy_NameTags"];
		}
		
		// Go through each user and add their tag (if it exists)
		$("*[data-type='comment']").each(function( index ) {
			var user = $(this).children(".entry").children(".tagline").children(".author").text();
			var addText = "add tag";
			if (userTags != null && userTags.hasOwnProperty(user)) {
				var tagName = userTags[user];
				$(this).children(".entry").children(".tagline").children(".author").after("<span class='userTag' style='margin-right: 5px;'>" + tagName + "</a>");
				
				addText = "update tag";
			}
			
			// Also add a tagging button
			$(this).children(".entry").children(".tagline").append("<a href='javascript:void(0)' class='addTagName' style='margin-left: 5px;' data-username='" + user + "'>" + addText + "</a>");
		});
	});
	
	/**
	* Add click listener for tagging a user.
	*/
	$(document).on("click", ".addTagName", function() {
		var userName = $(this).attr("data-username");
		var tag = prompt("Please enter desired tag for user '" + userName + "'\n\nNOTE: Leave empty to remove tag.","");
		
		// Save Tag
		if (tag != null) {
			if (tag == "") {
				// Empty string, remove tag
				delete userTags[userName];
			} else {
				userTags[userName] = tag;
			}
			
			var tagsList = {}; 
			tagsList["RedditBuddy_NameTags"] = userTags;
			window.dispatchEvent(new CustomEvent("StoreNameTags", { "detail": tagsList }));	
		
			// Go through each user and add their tag (if it exists)
			$("*[data-type='comment']").each(function( index ) {
				var user = $(this).children(".entry").children(".tagline").children(".author").text();
				if (user == userName) {
					var tagName = userTags[user];
					if (tag == "") {
						// Remove tag
						$(this).children(".entry").children(".tagline").children('.userTag').remove();
					} else if ($(this).children(".entry").children(".tagline").children('.userTag').length) {
						$(this).children(".entry").children(".tagline").children('.userTag').text(tagName);
					} else {
						$(this).children(".entry").children(".tagline").children(".author").after("<span class='userTag' style='margin-right: 5px;'>" + tagName + "</a>");
					}
				
					var addText = "update tag";
					if (tag == "") {
						addText = "add tag";
					}
				
					// Also update the tagging button
					$(this).children(".entry").children(".tagline").children(".addTagName").text(addText);
				}
			});
		}
	});

	/**
	* Upon loading, initiates events with onLoad.js that load name tagging functionality.
	*/
	$(document).ready(function() {
		// When page loads, initiate event to get banned users list and collapse all comments by those users
		window.dispatchEvent(new CustomEvent("GetNameTags"));
	});
}( window.redditBuddy = window.redditBuddy || {}, jQuery ));



















