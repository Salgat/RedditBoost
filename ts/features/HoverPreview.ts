/// <reference path="../utils/Singleton.ts" />
/// <reference path="../utils/Cookies.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />

/**
 * Preview certain media links.
 */
module RedditBoostPlugin {
    enum Region {Above, Below, Left, Right};
    
    class HoverPreviewPlugin extends utils.Singleton {
        
        private _loadingAnimation: string = "<div id='RedditBoost_loadingAnimation' class='uil-default-css' style='transform:scale(1);'>\
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
							</div>";
                            
        private _gifvPlayer: string = "<video data-filename='' class='RedditBoost_Content' preload='auto' autoplay='autoplay' muted='muted' loop='loop' webkit-playsinline>	    \
                                <source src='' id='RedditBoost_imageWebm'	type='video/webm'>																		\
                                <source src='' id='RedditBoost_imageMp4'	type='video/mp4'>																		\
                                </video>																												";
                                
        private _failedLoading: string = "<div id='RedditBoost_failedLoading'>X</div>";
                            
        private _processing: boolean = false;
        private _supportedMediaPattern: RegExp;
        private _supportedDomains: RegExp;
        private _staticImageType: RegExp;
        private _gifImageType: RegExp;
        private _imageCache: {[fileName: string]: {source: string, imgUrl: string, mp4Url: string, webmUrl: string, gifUrl: string}} = {};
        private _mousePosition: {x: number, y: number} = {x: 0, y: 0};
        private _failedLinks: string[] = [];
        private _failedVideoLinks: string[] = [];
        private _successfulVideoLinks: string[] = [];
        private _requestedLinks: string[] = [];
        private _lastMousePosition: {x: number, y: number} = {x: 0, y: 0};
        private _imageUpdates: number = 0;
        
        get init() { return this._init; }
        
        private _init(): void {
            this.setSingleton();
            
            // Setup event listeners
            this._handleImgurResponse();
            this._handleGfycatResponse();
            
            // Setup Regex
            this._supportedMediaPattern = new RegExp("(gif|gifv|jpg|jpeg|png|bmp)$");
            this._supportedMediaPattern.ignoreCase = true;
            this._supportedDomains = new RegExp("(imgur.com|gfycat.com)$");
            this._supportedDomains.ignoreCase = true;
            this._staticImageType = new RegExp("(jpg|jpeg|png|bmp)$");
            this._staticImageType.ignoreCase = true;
            this._gifImageType = new RegExp("(gif|gifv)$");
            this._gifImageType.ignoreCase = true;
            
            // Create preview window (hidden by default)
            $('body').append("<div id='RedditBoost_imagePopup'></div>");
            $('#RedditBoost_imagePopup').hide();
            $('#RedditBoost_imagePopup').prepend(this._failedLoading);
            $("#RedditBoost_failedLoading").hide();
            $('#RedditBoost_imagePopup').prepend(this._loadingAnimation);
            $("#RedditBoost_loadingAnimation").hide();
            $('#RedditBoost_imagePopup').prepend("<h3 id='RedditBoost_imagePopupTitle'>");
            
            // Update mouse position
            $(document).mousemove((event) => {
                this._mousePosition.x = event.pageX;
                this._mousePosition.y = event.pageY;
            });
            
            // Update previewed links color
            this._updatePreviewedLinks();
            
            // Call preview logic at ~60Hz (note that the lambda style syntax is to preserve 'this' context)
            setInterval(() => {this._showPreview();}, 15);
        }
        
        /**
         * Set links as previewed.
         */
        private _updatePreviewedLinks(visitedLink?: string) {
            // First get the list of already visited links
            let visitedLinksCookie = utils.Cookies.getCookie('RedditBoost_VisitedLinks');
            if (visitedLinksCookie == null) visitedLinksCookie = "";
            let visitedLinks = visitedLinksCookie.split(' '); // Space is disallowed in URLs, so it is used as a delimiter
            
            // If a new visited link is provided, update the cookie
            if (visitedLink != null && visitedLinks.indexOf(visitedLink) < 0) {
                visitedLinks.push(visitedLink);
                utils.Cookies.setCookie('RedditBoost_VisitedLinks', visitedLinks.join(' '));
            }
            
            // Add visited class to all visited links.
            visitedLinks.forEach(function(link) {
               $("a[href='" + link +"']").addClass('RedditBoost_PreviewedLink'); // May want to add a reddit supported class instead
            });
        }
        
        /**
         * Preview any images/gifs if possible. This is called on a regular basis.
         */
        private _showPreview() {
            // Don't do any preview logic if still processing last loop
            if (this._processing) return;
            this._processing = true;
            
            // Check if mouse is hovering over a link
            let hoveredLink = $('a.title:hover, form a:hover').first();
            if (hoveredLink.length > 0) {
                // Get link type and attempt to display if a supported media format
                let linkType =  this._getLinkType($(hoveredLink).attr("href"));
                if (this._isSupported(linkType)) {
                    // Either start loading the preview, or do an async call to get the information needed to preview
                    this._tryPreview(linkType);
                    this._adjustPreviewPopup();
                } else {
                    // Remove link preview and reset state
                    $('#RedditBoost_imagePopup').hide();
                }
            } else {
                // Remove link preview and reset state
                $('#RedditBoost_imagePopup').hide();
            }
            
            this._processing = false;
        }
        
        /**
         * Returns what link's media type and other information.
         */
        private _getLinkType(linkHref: string) : {link: string, extension: string, source: string, fileName: string} {
            let link: string = linkHref;
            let fileName: string = HoverPreviewPlugin._getFileName(link);
            let extension: string = this._getExtension(fileName);
            let source: string = HoverPreviewPlugin._getDomain(link);
            
            return {link, extension, source, fileName};
        }
        
        /**
         * Returns just the filename of the provided link.
         */
        private static _getFileName(link: string) : string {
            var linkSections = link.split("/");
            var filenameWithParameters = linkSections.pop();
            var fileWithoutParameters = filenameWithParameters.split("?")[0];
            return fileWithoutParameters;
        }
        
        /**
         * Returns the extension of the provided file name (if supported).
         */
        private _getExtension(fileName: string) : string {
            let extension: string = fileName.split('.').pop();
            if (!this._supportedMediaPattern.test(fileName.toLowerCase())) {
                return "";
            }
            return extension;
        }
        
        /**
         * Returns the domain of the provided link.
         */
        private static _getDomain(link: string) : string {
            // Remove protocol
            link = link.replace(/.*?:\/\//g, "");
            
            // Remove route
            link = link.split('/')[0];
            
            // Remove subdomain
            if (link.split('.').length == 4 || (link.split('.').length == 3 && link.toLowerCase().indexOf('.co.') < 0)) {
                // Test and remove the subdomain if the formatted link either has 4 periods or 3 periods and does not end with a .co.* (such as .co.uk)
                let split = link.split('.');
                split.shift();
                link = split.join('.');
            }
            
            return link;
        }
        
        /**
         * Returns whether a link can be previewed.
         */
        private _isSupported(linkType: {link: string, extension: string, source: string, fileName: string}) : boolean {
            // First check if it has a supported media type
            if (this._isSupportedMediaPattern(linkType.extension)) {
                return true;
            }
            
            // Next check if it's a supported domain
            if (this._isSupportedDomain(linkType.source, linkType.link)) {
                return true;
            }
            
            return false;
        }
        
        /**
         * Returns true if the link is a supported media pattern.
         */
        private _isSupportedMediaPattern(link: string) : boolean {
            if (this._supportedMediaPattern.test(link.toLowerCase())) {
                return true;
            }
            return false;
        }
        
        /**
         * Returns true if the link is a supported domain.
         */
        private _isSupportedDomain(domain: string, link: string) : boolean {
            if (this._supportedDomains.test(domain)) {
                if (link.toLowerCase().indexOf('/a/') < 0 && link.toLowerCase().indexOf('/gallery/') < 0 && link.toLowerCase().indexOf(',') < 0) {
                    // Exclude from the supported domains galleries and albums
                    return true;
                }
            }
            return false;
        }
        
        /**
         * Returns true if the current element is a Video element that failed to load.
         */
        private _failedLoadingVideo() : boolean {
            if ($('.RedditBoost_Content').is('video') && this._failedVideoLinks.indexOf($('#RedditBoost_imageWebm').attr('src')) >= 0 && this._failedVideoLinks.indexOf($('#RedditBoost_imageMp4').attr('src')) >= 0) {
                return true;
            }
            return false;
        }
        
        /**
         * Returns true if the current element is a video element and successfuly loaded.
         */
        private _successfulLoadingVideo() : boolean {
            if ($('.RedditBoost_Content').is('video') && (this._successfulVideoLinks.indexOf($('#RedditBoost_imageWebm').attr('src').replace(/.*?:\/\//g, "")) >= 0 || this._successfulVideoLinks.indexOf($('#RedditBoost_imageMp4').attr('src').replace(/.*?:\/\//g, "")) >= 0)) {
                return true;
            }
            return false;
        }
        
        /**
         * Attempts to show a preview of the media, starting an async call for more information if needed.
         */
        private _tryPreview(linkType: {link: string, extension: string, source: string, fileName: string}) : void {
            // Determine whether the link is a supported media type or domain
            if (this._imageCache[linkType.fileName.toLowerCase()] != null) {
                // More information has already been received, either display the image or hide the preview popup
                let mediaInformation = this._imageCache[linkType.fileName.toLowerCase()];
                if (mediaInformation.imgUrl != null) {
                    let currentLinkType = this._getLinkType(mediaInformation.imgUrl);
                    if (this._isSupportedMediaPattern(currentLinkType.extension)) {
                        this._displayMedia(currentLinkType, this._imageCache);
                    }
                } else {
                    $('#RedditBoost_imagePopup').hide();
                }
            } else if (this._isSupportedMediaPattern(linkType.extension)) {
                // Can immediately display the preview
                this._displayMedia(linkType, this._imageCache);
            } else if (this._isSupportedDomain(linkType.source, linkType.link)) {
                // Need to request more information first, initially display loading screen
                this._getMediaInformation(linkType);
            }
        }
        
        /**
         * Displays the provided image.
         */
        private _displayMedia(linkType: {link: string, extension: string, source: string, fileName: string}, mediaInformation?: {[fileName: string]: {source: string, imgUrl: string, mp4Url: string, webmUrl: string, gifUrl: string}}) : void {
            if (this._failedLinks.indexOf(linkType.link) >= 0) {
                // The image has already failed to load before, so don't try to display it again
                $('#RedditBoost_imagePopup').show();
                $('.RedditBoost_Content').hide();
                $('#RedditBoost_loadingAnimation').hide();
                $('#RedditBoost_failedLoading').show();
                return;
            } else {
                $('#RedditBoost_failedLoading').hide();
            }
            
            if (this._staticImageType.test(linkType.extension.toLowerCase())) {
                this._displayImage(linkType.link);
            } else if (this._gifImageType.test(linkType.extension.toLowerCase())) {
                let name = linkType.fileName.split('.')[0].toLowerCase();
                if (mediaInformation[name] != null && mediaInformation[name].mp4Url != null && mediaInformation[name].webmUrl != null) {
                    this._displayGifv(name, mediaInformation[name]);
                } else if (mediaInformation[name] != null && mediaInformation[name].gifUrl != null) {
                    this._displayImage(mediaInformation[name].gifUrl);
                } else if (mediaInformation[name] != null && mediaInformation[name].imgUrl != null) {
                    this._displayImage(mediaInformation[name].imgUrl);
                } else {
                    this._displayImage(linkType.link);
                }
            }
        }
        
        /**
         * Displays img type given provided src.
         */
        private _displayImage(link: string) : void {
            if ((this._getExtension(link) == 'gif' || this._getExtension(link) == 'gifv') && HoverPreviewPlugin._getDomain(link) == 'imgur.com') {
                // Imgur Gifs can be automatically played as gifv
                // TODO: Cannot do this with static Gifs, need to determine this before hand
                let name = HoverPreviewPlugin._getFileName(link).split('.')[0];
                this._displayGifv(name, {source: HoverPreviewPlugin._getDomain(link), imgUrl: null, mp4Url: "//i.imgur.com/" + name + ".mp4", webmUrl: "//i.imgur.com/" + name + ".webm", gifUrl: null});
                return;
            }
            
            // Show loading animation
            $("#RedditBoost_loadingAnimation").show();
            
            // Display IMG element if current content is not correct
            if ($('#RedditBoost_imagePopup .RedditBoost_Content').attr('src') != link) {
                $('#RedditBoost_imagePopup .RedditBoost_Content').remove();
                let hoveredLink = $('a.title:hover, form a:hover').first();
                $('#RedditBoost_imagePopup').append("<img class='RedditBoost_Content' data-original-source='" + hoveredLink.attr('href') +"' src='" + link + "' id='imagePopupImg'>");
            
                // Handle failed image load
                $('.RedditBoost_Content').bind('error', (event) => {
                    this._handleErrorLoading(event);
                });
                
                // Handle successful image loading
                $('.RedditBoost_Content').bind('load', (event) => {
                    this._handleImgLoad(event);
                });
            }
            
            $('#RedditBoost_imagePopup').show();
        }
        
        /**
         * Displays gifv with the provided information.
         */
        private _displayGifv(fileName: string, mediaInformation: {source: string, imgUrl: string, mp4Url: string, webmUrl: string, gifUrl: string}) : void {
            // Show loading animation
            $("#RedditBoost_loadingAnimation").show();
            
            // Display IMG element if current content is not correct
            if ($('#RedditBoost_imagePopup .RedditBoost_Content').attr('data-fileName') != fileName) {
                $('#RedditBoost_imagePopup .RedditBoost_Content').remove();
                $('#RedditBoost_imagePopup').append(this._gifvPlayer);
                $('#RedditBoost_imagePopup .RedditBoost_Content').attr('data-fileName', fileName);
                
                let hoveredLink = $('a.title:hover, form a:hover').first();
                $('#RedditBoost_imagePopup .RedditBoost_Content').attr('data-original-source', hoveredLink.attr('href'));
                
                if (mediaInformation.source == 'imgur.com') {
                    $('#RedditBoost_imageWebm').attr("src", mediaInformation.webmUrl);
				    $('#RedditBoost_imageMp4').attr("src", mediaInformation.mp4Url);
                } else if (mediaInformation.source == 'gfycat.com') {
                    $('#RedditBoost_imageWebm').attr("src", mediaInformation.webmUrl);
				    $('#RedditBoost_imageMp4').attr("src", mediaInformation.mp4Url);
                }
            
                // Handle failed image load
                $('#RedditBoost_imageWebm').bind('error', (event) => {
                    this._handleGifvErrorLoading(event);
                });
                $('#RedditBoost_imageMp4').bind('error', (event) => {
                    this._handleGifvErrorLoading(event);
                });
                
                // Handle successful image loading
                $('.RedditBoost_Content').bind('loadeddata', (event) => {
                    this._handleGifvLoad(event);
                });
            }
            
            $('#RedditBoost_imagePopup').show();
        }
        
        /**
         * Records when a failure of a video source to load occurs.
         */
        private _handleGifvErrorLoading(event) {
            let failedSource = event.target.attributes.src.value;
            failedSource = failedSource.replace(/.*?:\/\//g, ""); // Remove protocol if present
            this._failedVideoLinks.push(failedSource);
        }
        
        /**
         * Records when a video source load occurs successfully.
         */
        private _handleGifvLoad(event) {
            let successfulSource = $(event.target).children('#RedditBoost_imageMp4').attr('src');
            successfulSource = successfulSource.replace(/.*?:\/\//g, ""); // Remove protocol if present
            this._successfulVideoLinks.push(successfulSource);
            this._updatePreviewedLinks($(event.target).attr('data-original-source'));
        }
        
        /**
         * Handles when an img load occurs successfully.
         */
        private _handleImgLoad(event) {
            this._updatePreviewedLinks($(event.target).attr('data-original-source'));
        }
        
        /**
         * Adjusts the popup screen and automatically removes the loading animation.
         */
        private _adjustPreviewPopup() {
            if ($(".RedditBoost_Content").height() && $(".RedditBoost_Content:visible").length > 0 && !this._failedLoadingVideo()) {
				// Once something starts loading, remove it
                // TODO: This is not detecting when a gifv loads
				$("#RedditBoost_loadingAnimation").hide();
			} else {
                // Dont' start tracking image updates until after the image has loaded
                this._imageUpdates = 0;
            }
        
            if ($(".RedditBoost_Content").is('video') && !this._failedLoadingVideo() && !this._successfulLoadingVideo()) {
                // Neither failed or loaded video, so it must be loading still
                $("#RedditBoost_loadingAnimation").show();
                $('.RedditBoost_Content').hide();
                this._imageUpdates = 0;
            } else if (this._failedLoadingVideo()) {
                $("#RedditBoost_loadingAnimation").hide();
                $('#RedditBoost_failedLoading').show();
                $('.RedditBoost_Content').hide();
            } else if (this._successfulLoadingVideo()) {
                $("#RedditBoost_loadingAnimation").hide();
                $('.RedditBoost_Content').show();
            }
            
            // Don't update position or size if the mouse hasn't moved
            if (Math.abs(this._lastMousePosition.x - this._mousePosition.x) < 1.0 && Math.abs(this._lastMousePosition.y - this._mousePosition.y) < 1.0 && this._imageUpdates > 15) {
                return;
            }
            this._lastMousePosition.x = this._mousePosition.x;
            this._lastMousePosition.y = this._mousePosition.y;
            
            // Display title text
            let title = $('a.title:hover, form a:hover').first().text();
            if (title != null && $('#RedditBoost_imagePopupTitle').text() != title) {
                $('#RedditBoost_imagePopupTitle').text(title);
                this._imageUpdates = 0;
            } else {
                // The link hasn't changed, so we can confirm that this update is occurruing on the same image
                this._imageUpdates += 1;
            }
            
            // Get popup sizes
            let popupWidth = $('#RedditBoost_imagePopup').width();
            let popupHeight = $('#RedditBoost_imagePopup').height();
            
            // Adjust the popup size and position
            // Note: There are 4 positions the popup can be relative to the mouse, either above, below, left, or right. 
            let region = this._findMostSpace(this._mousePosition);
            
            // Adjust max width and heigh to fit within region
            this._adjustPopupSize(popupWidth, popupHeight, region);
            
            if (region == Region.Left) {
                // Display to the left of the mouse
                $('#RedditBoost_imagePopup').offset({ top: $(window).scrollTop(), left: this._mousePosition.x-popupWidth-10});
            } else if (region == Region.Right) {
                // Display to the right of the mouse
                $('#RedditBoost_imagePopup').offset({ top: $(window).scrollTop(), left: this._mousePosition.x+20});
            } else if (region == Region.Above) {
                // Display above the mouse
                $('#RedditBoost_imagePopup').offset({ top: this._mousePosition.y-popupHeight-5, left: 10});
            } else {
                // Display below the mouse
                $('#RedditBoost_imagePopup').offset({ top: this._mousePosition.y+10, left: 0});
            } // TODO: Fix above and below popup offset
            
            // Center the popup either vertically or horizontally
            if (region == Region.Above || region == Region.Below) {
                // Center horizontally
                this._centerPopupHorizontally(popupWidth);
            } else {
                // Center vertically
                this._centerPopupVertically(popupHeight);
            }
            
            // Update loading animation position
            let display = $("#RedditBoost_loadingAnimation").css('display');
            if ($("#RedditBoost_loadingAnimation").css('display') == 'block') {
                $("#RedditBoost_loadingAnimation").css("left", popupWidth/2 - 100);
                $("#RedditBoost_imagePopup").css("min-height", 220);
            } else {
                $("#RedditBoost_imagePopup").css("min-height", 0);
            }
        }
        
        /**
         * Returns either above, below, left, or right
         */
        private _findMostSpace(mouseLocation: {x: number, y: number}) : Region {
            let windowWidth = $(window).width();
			let windowHeight = $(window).height();
            
            let distanceLeft = (mouseLocation.x - $(window).scrollLeft());
            let distanceRight = windowWidth - (mouseLocation.x - $(window).scrollLeft());
            let distanceAbove = (mouseLocation.y - $(window).scrollTop());
            let distanceBelow = windowHeight - (mouseLocation.y - $(window).scrollTop());
            
            // Return largest region
            if (distanceLeft > distanceRight && distanceLeft > distanceAbove && distanceLeft > distanceBelow) return Region.Left;
            if (distanceRight > distanceLeft && distanceRight > distanceAbove && distanceRight > distanceBelow) return Region.Right;
            if (distanceAbove > distanceRight && distanceAbove > distanceLeft && distanceAbove > distanceBelow) return Region.Above;
            return Region.Below;
        }
        
        /**
         * Handles when media failes to load.
         */
        private _handleErrorLoading(event) : void {
            let failedLink = $(event.currentTarget).attr('src');
            this._failedLinks.push(failedLink);
        }
        
        /**
         * Adjusts max-width and max-height to fit within region.
         */
        private _adjustPopupSize(popupWidth: number, popupHeight: number, region: Region) : void {
            let distanceLeft = (this._mousePosition.x - $(window).scrollLeft());
            let distanceRight = $(window).width() - (this._mousePosition.x - $(window).scrollLeft());
            let distanceAbove = (this._mousePosition.y - $(window).scrollTop());
            let distanceBelow = $(window).height() - (this._mousePosition.y - $(window).scrollTop());
            
            let maxHeight: number;
            let maxWidth: number;
            if (region == Region.Left) {
                maxHeight = $(window).height() - 90;
                maxWidth = distanceLeft - 30;
            } else if (region == Region.Right) {
                maxHeight = $(window).height() - 90;
                maxWidth = distanceRight - 30;
            } else if (region == Region.Above) {
                maxHeight = distanceAbove - 90;
                maxWidth = $(window).width()-15;
            } else { // Region.Below
                maxHeight = distanceBelow - 90;
                maxWidth = $(window).width()-15;
            }
            $('.RedditBoost_Content').css("max-height", maxHeight);
            $('.RedditBoost_Content').css("max-width", maxWidth);
            $('#RedditBoost_imagePopupTitle').css("max-height", maxHeight);
            $('#RedditBoost_imagePopupTitle').css("max-width", maxWidth);
        }
        
        /**
         * Centers preview popup horizontally
         * 
         * Todo: May want to have this center on the mouse
         */
        private _centerPopupHorizontally(popupWidth: number) : void {
            var offset = $("#layer2").offset();
            $('#RedditBoost_imagePopup').css('left', $(window).width()/2 - popupWidth/2 + $(window).scrollLeft());
        }
        
        /**
         * Centers preview popup vertically
         */
        private _centerPopupVertically(popupHeight: number) : void {
            var offset = $("#layer2").offset();
            $('#RedditBoost_imagePopup').css('top', $(window).height()/2 - popupHeight/2 + $(window).scrollTop());
        }
        
        /**
         * Asynchronously requests information regarding the link.
         */
        private _getMediaInformation(linkType: {link: string, extension: string, source: string, fileName: string}) : void {
            // First display loading screen
            $(".RedditBoost_Content").hide();
            $("#RedditBoost_loadingAnimation").show();
            $('#RedditBoost_imagePopup').show();
            
            if (linkType.source == 'imgur.com') {
                this._getImgurData(linkType.fileName);
            } else if (linkType.source == 'gfycat.com') {
                this._getGfycatData(linkType.fileName);
            }
        }
        
        /**
         * Updates the image cache and raises an event notifying that it finished.
         */
        private _getImgurData(fileName: string) : void {
            if (this._requestedLinks.indexOf(fileName) >= 0) return;
            this._requestedLinks.push(fileName);
            
            let imageApiUrl = "//api.imgur.com/2/image/" + fileName + ".json";
            $.get(imageApiUrl)
            .done((data) => {
                window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedImgurData", { "detail": data }));
            });
        }
        private _getGfycatData(fileName: string) : void {
            if (this._requestedLinks.indexOf(fileName) >= 0) return;
            this._requestedLinks.push(fileName);
            
            let imageApiUrl = "//gfycat.com/cajax/get/" + fileName;
            $.get(imageApiUrl)
            .done((data) => {
                window.dispatchEvent(new CustomEvent("RedditBoost_RetrievedGfycatData", { "detail": data }));
            });
        }
        
        /**
         * Handle media GET responses.
         */
        private _handleImgurResponse() {
            window.addEventListener("RedditBoost_RetrievedImgurData", (event: any) => {
                let hash = event.detail["image"]["image"]["hash"].toLowerCase();
                let imageUrl = event.detail["image"]["links"]["original"];
                if (imageUrl != null) {
                    this._imageCache[hash] = {source: 'imgur.com', imgUrl: imageUrl, mp4Url: null, gifUrl: null, webmUrl: null};
                } else {
                    this._imageCache[hash] = {source: 'imgur.com', imgUrl: null, mp4Url: null, gifUrl: null, webmUrl: null};
                }
            }, false);
        }
        private _handleGfycatResponse() {
            window.addEventListener("RedditBoost_RetrievedGfycatData", (event: any) => {
                var hash = event.detail["gfyItem"]["gfyName"].toLowerCase();
                var imageUrl = event.detail["gfyItem"]["gifUrl"];
                var webmUrl = event.detail["gfyItem"]["webmUrl"];
                var mp4Url = event.detail["gfyItem"]["mp4Url"];
                if (imageUrl != null) {
                    this._imageCache[hash] = {source: 'gfycat.com', imgUrl: imageUrl, mp4Url: mp4Url, gifUrl: null, webmUrl: webmUrl};
                } else {
                    this._imageCache[hash] = {source: 'gfycat.com', imgUrl: null, mp4Url: null, gifUrl: null, webmUrl: null};
                }
            }, false);
        }
        
    }
    
    export var HoverPreview: HoverPreviewPlugin = new HoverPreviewPlugin();
}