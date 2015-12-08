console.log("RedditPlus Loaded");

// Applies a CSS style rule to the provided stylesheet
function applyStyleToSheet(stylesheet, css) {
	if (style.styleSheet) {
		style.styleSheet.cssText += css;
	} else {
		style.appendChild(document.createTextNode(css));
	}
}

// Create a universal stylesheet
var css = "",
	head = document.head || document.getElementsByTagName('head')[0],
	style = document.createElement("style");
style.type = 'text/css';
head.appendChild(style);

////////////////// Hover picture load //////////////////
function createFloatingImage(href) {
	$("body").append("<div class='image_hover' style='position:absolute; top: 0; left: 0;'><img src=" + href + " style='width: 10%;'></img>Test</div>");
}

// Todo: Have it so that the hoving image 1) never covers up with link and 2) follows the mouse and 3) is always visible (either above or below the link)
$("a").hover( 
	function() {
		// Check if the link is a supported img type
		var href = $(this).attr("href");
		if (href.endsWith(".jpg")) {
			console.log("hovering over jpg image");
			createFloatingImage(href);
		}
	}, 
	function() {
		var href = $(this).attr("href");
		if (href.endsWith(".jpg")) {
			console.log("removing hovering over jpg image");
			$(".image_hover").remove();
		}
	}
);

////////////////// User Comments Blocking //////////////////
/*
TODO:
	- Nested comments aren't working right

*/
var bannedUsers = [];
window.addEventListener("RetrievedObject", function(event) {
	bannedUsers = event.detail["RedditPlus_BlockedUserForComments"];
	console.log("Banned Users: " + bannedUsers);
  
	// Go through each user and add a class to hide if matching
	$( ".author" ).each(function( index ) {
	  	var comment = $(this).parent().parent().parent();
	  	if (bannedUsers != null && bannedUsers.indexOf($(this).text()) >= 0 && comment.attr("data-type") == "comment") {
			console.log("Found match for user: " + $(this).text());
			comment.removeClass("noncollapsed").addClass("collapsed");
		}
	});
 
	// Add option to block or unblock a user
	$("*[data-type='comment']").each(function( index ) {
		console.log("Iterating through comment");
		var user = $(this).children(".entry").children(".tagline").children(".author").text();
		if (bannedUsers != null && bannedUsers.indexOf($(this).children(".entry").children(".tagline").children(".author").text()) >= 0) {
			// Hide (not banned yet)
			$(this).children(".entry").children(".tagline").append("<a href='javascript:void(0)' class='unblockUserComments' style='margin-left: 5px;' data-username='" + user + "'>" + "unhide user comments" + "</a>");
		} else {
			// Unhide (banned)
			$(this).children(".entry").children(".tagline").append("<a href='javascript:void(0)' class='blockUserComments' style='margin-left: 5px;' data-username='" + user + "'>" + "hide user comments" + "</a>");
		}
	});
	
	
}, false);

// Add click listeners for blocking users
$(document).on("click", ".unblockUserComments", function() {
	// Unblock the user
	console.log("Unblocking user");
	if (bannedUsers == null) bannedUsers = [];
	
	var userToUnban = $(this).attr("data-username");
	var blockedIndex = bannedUsers.indexOf(userToUnban);
	if (blockedIndex >= 0) {
		bannedUsers.splice(blockedIndex, 1);
		var bannedList = {}; 
		bannedList["RedditPlus_BlockedUserForComments"] = bannedUsers;
		window.dispatchEvent(new CustomEvent("StoreObject", { "detail": bannedList }));
		
		// Remove collapsed for all comments of this user
		$("*[data-type='comment']").each(function( index ) {
			if ($(this).children(".entry").children(".tagline").children(".author").text() == userToUnban) {
				var textElement = $(this).children(".entry").children(".tagline").children(".unblockUserComments");
				textElement.text("hide user comments");
				textElement.removeClass("unblockUserComments").addClass("blockUserComments");
				$(this).removeClass("collapsed").addClass("noncollapsed");
			}
		});
	}
});

// Add click listeners for unblocking users
$(document).on("click", ".blockUserComments", function() {
	// Unblock the user
	console.log("Blocking user");
	if (bannedUsers == null) bannedUsers = [];
	
	var userToUnban = $(this).attr("data-username");
	var blockedIndex = bannedUsers.indexOf(userToUnban);
	if (blockedIndex < 0) {
		bannedUsers.push(userToUnban);
		var bannedList = {}; 
		bannedList["RedditPlus_BlockedUserForComments"] = bannedUsers;
		window.dispatchEvent(new CustomEvent("StoreObject", { "detail": bannedList }));
		
		// Add collapsed for all comments of this user
		$("*[data-type='comment']").each(function( index ) {
			if ($(this).children(".entry").children(".tagline").children(".author").text() == userToUnban) {
				var textElement = $(this).children(".entry").children(".tagline").children(".blockUserComments");
				textElement.text("show user comments");
				textElement.removeClass("blockUserComments").addClass("unblockUserComments");
				$(this).removeClass("noncollapsed").addClass("collapsed");
			}
		});
	}
});

$(document).ready(function() {
    console.log("ready!");
	// When page loads, initiate event to get banned users list and collapse all comments by those users
	window.dispatchEvent(new CustomEvent("GetObject", { "detail": "RedditPlus_BlockedUserForComments"}));
});






















