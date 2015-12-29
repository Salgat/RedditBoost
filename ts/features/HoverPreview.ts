/// <reference path="../utils/Singleton.ts" />
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
                            
        private _lastLink: { lastLink: string, isActive: boolean, element: Element} = { lastLink: "", isActive: false, element: null};
        private _processing: boolean = false;
        private _supportedMediaPattern: RegExp;
        private _supportedDomains: RegExp;
        private _staticImageType: RegExp;
        private _imageCache: {[fileName: string]: {source: string, mp4Url: string, webmUrl: string, gifUrl: string}} = {};
        private _mousePosition: {x: number, y: number} = {x: 0, y: 0};
        private _failedLinks: string[] = [];
        
        get init() { return this._init; }
        
        private _init(): void {
            this.setSingleton();
            
            // Setup Regex
            this._supportedMediaPattern = new RegExp("(gif|gifv|jpg|jpeg|png|bmp)$");
            this._supportedMediaPattern.ignoreCase = true;
            this._supportedDomains = new RegExp("(imgur.com|gfycat.com)$");
            this._supportedDomains.ignoreCase = true;
            this._staticImageType = new RegExp("(jpg|jpeg|png|bmp)$");
            this._staticImageType.ignoreCase = true;
            
            // Create preview window (hidden by default)
            $('body').append("<div id='RedditBoost_imagePopup'><h3 id='RedditBoost_imagePopupTitle'></div>");
            $('#RedditBoost_imagePopup').hide();
            $('#RedditBoost_imagePopup').prepend(this._loadingAnimation);
            $("#RedditBoost_loadingAnimation").hide();
            
            // Update mouse position
            $(document).mousemove((event) => {
                this._mousePosition.x = event.pageX;
                this._mousePosition.y = event.pageY;
            });
            
            // Call preview logic at ~60Hz (note that the lambda style syntax is to preserve 'this' context)
            setInterval(() => {this._showPreview();}, 15);
        }
        
        /**
         * Preview any images/gifs if possible. This is called on a regular basis.
         */
        private _showPreview() {
            // Don't do any preview logic if still processing last loop
            if (this._processing) return;
            this._processing = true;
            
            // Check if mouse is hovering over a link
            let hoveredLink = $('a.title:hover, p a:hover').first();
            if (hoveredLink.length > 0) {
                // Get link type and attempt to display if a supported media format
                let linkType =  this._getLinkType(hoveredLink);
                if (this._isSupported(linkType)) {
                    // Either start loading the preview, or do an async call to get the information needed to preview
                    this._tryPreview(linkType);
                }
                
                this._adjustPreviewPopup();
            } else {
                // Remove link preview and reset state
                $('#RedditBoost_imagePopup').hide();
                this._lastLink = { lastLink: "", isActive: false, element: null};
            }
            
            this._processing = false;
        }
        
        /**
         * Returns what link's media type and other information.
         */
        private _getLinkType(linkElement: JQuery) : {link: string, extension: string, source: string, fileName: string} {
            let link: string = $(linkElement).attr("href");
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
            if ((link.toLowerCase().match('/\./g')||[]).length == 4 || ((link.toLowerCase().match('/\./g')||[]).length == 3 && link.toLowerCase().indexOf('.co.') < 0)) {
                // Test and remove the subdomain if the formatted link either has 4 periods or 3 periods and does not end with a .co.* (such as .co.uk)
                link = link.split('.').shift().concat();
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
         * Attempts to show a preview of the media, starting an async call for more information if needed.
         */
        private _tryPreview(linkType: {link: string, extension: string, source: string, fileName: string}) : void {
            // Determine whether the link is a supported media type or domain
            if (this._isSupportedMediaPattern(linkType.extension)) {
                // Can immediately display the preview
                this._displayImage(linkType);
            } else if (this._imageCache[linkType.fileName] != null) {
                // More information has already been received, either display the image or hide the preview popup
                
            } else if (this._isSupportedDomain(linkType.source, linkType.link)) {
                // Need to request more information first, initially display loading screen   
            }
        }
        
        /**
         * Displays the provided image.
         */
        private _displayImage(linkType: {link: string, extension: string, source: string, fileName: string}) : void {
            if (this._failedLinks.indexOf(linkType.link) >= 0) {
                // The image has already failed to load before, so don't try to display it again
                // TODO: Perhaps indicate the image failed to load?
                $('#RedditBoost_imagePopup').hide();
                return;
            }
            
            if (this._staticImageType.test(linkType.extension.toLowerCase())) {
                // Show loading animation
                $("#RedditBoost_loadingAnimation").show();
                
                // Display IMG element if current content is not correct
                if ($('#RedditBoost_imagePopup .RedditBoost_Content').attr('src') != linkType.link) {
                    $('#RedditBoost_imagePopup .RedditBoost_Content').remove();
                    $('#RedditBoost_imagePopup').append("<img class='RedditBoost_Content' src='" + linkType.link + "' id='imagePopupImg'>");
                
                    // Handle failed image load
                    $('.RedditBoost_Content').bind('error', (event) => {
                        this._handleErrorLoading(event);
                    });
                }
                
                $('#RedditBoost_imagePopup').show();
                console.log("displaying link: " + linkType.link);
            }
        }
        
        /**
         * Adjusts the popup screen and automatically removes the loading animation.
         */
        private _adjustPreviewPopup() {
            if ($(".RedditBoost_Content").height()) {
				// Once something starts loading, remove it
				$("#RedditBoost_loadingAnimation").hide();
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
                $('#RedditBoost_imagePopup').offset({ top: $(window).scrollTop()+this._mousePosition.x-popupHeight, left: 10});
            } else {
                // Display below the mouse
                $('#RedditBoost_imagePopup').offset({ top: this._mousePosition.y+10, left: 0});
            }
            
            // Center the popup either vertically or horizontally
            
            // Update loading animation position
            $("#RedditBoost_loadingAnimation").css("left", popupWidth/2 - 100);
        }
        
        /**
         * Returns either above, below, left, or right
         */
        private _findMostSpace(mouseLocation: {x: number, y: number}) : Region {
            let windowWidth = $(window).width();
			let windowHeight = $(window).height();
            console.log("window: " + windowWidth + ", " + windowHeight);
            console.log("mouseLocation: " + this._mousePosition.x + ", " + this._mousePosition.y);
            console.log("scrollT: " + $(window).scrollTop() + ", " + $(window).scrollLeft());
            
            let distanceLeft = (mouseLocation.x - $(window).scrollLeft());
            let distanceRight = windowWidth - (mouseLocation.x - $(window).scrollLeft());
            let distanceAbove = (mouseLocation.y - $(window).scrollTop());
            let distanceBelow = windowHeight - (mouseLocation.y - $(window).scrollTop());
            
            console.log("distances: " + distanceLeft + ", " + distanceRight + ", " + distanceAbove + ", " + distanceBelow);
            
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
            
            // TODO: Need to compare the newly calculated max-width/max-height against the current one. If the difference is negligible (<1?),
            //       don't update the ma-width/max-height.
            if (region == Region.Left) {
                $('.RedditBoost_Content').css("max-height", $(window).height() - 90);
                $('.RedditBoost_Content').css("max-width", distanceLeft - 30);
            } else if (region == Region.Right) {
                $('.RedditBoost_Content').css("max-height", $(window).height() - 90);
                $('.RedditBoost_Content').css("max-width", distanceRight - 30);
            } else if (region == Region.Above) {
                $('.RedditBoost_Content').css("max-height", distanceAbove - 90);
                $('.RedditBoost_Content').css("max-width", $(window).width());
            } else { // Region.Below
                $('.RedditBoost_Content').css("max-height", distanceBelow - 90);
                $('.RedditBoost_Content').css("max-width", $(window).width());
            }
        }
    }
    
    export var HoverPreview: HoverPreviewPlugin = new HoverPreviewPlugin();
}