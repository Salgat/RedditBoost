/// <reference path="../utils/Singleton.ts" />
/// <reference path="../references/jquery.d.ts" />
/// <reference path="../references/jquery.initialize.d.ts" />

/**
 * Preview certain media links.
 */
module RedditBoostPlugin {
    class HoverPreviewPlugin extends utils.Singleton {
        private _loadingAnimation: string = "<div id='loadingAnimation' class='uil-default-css' style='transform:scale(1);'>\
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
        
        get init() { return this._init; }
        
        private _init(): void {
            this.setSingleton();
            
            // Setup Regex
            this._supportedMediaPattern = new RegExp(".(gif|gifv|jpg|jpeg|png|bmp)$");
            this._supportedMediaPattern.ignoreCase = true;
            
            // Create preview window (hidden by default)
            $('body').append("<div id='RedditBoost_imagePopup'><h3 id='RedditBoost_imagePopupTitle'></div>");
            $('#RedditBoost_imagePopup').hide();
            
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
                console.log(linkType);
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
            if (!this._supportedMediaPattern.test(fileName)) {
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
            if ((link.match('/\./g')||[]).length == 4 || ((link.match('/\./g')||[]).length == 3 && link.indexOf('.co.') < 0)) {
                // Test and remove the subdomain if the formatted link either has 4 periods or 3 periods and does not end with a .co.* (such as .co.uk)
                link = link.split('.').shift().concat();
            }
            
            return link;
        }
    }
    
    export var HoverPreview: HoverPreviewPlugin = new HoverPreviewPlugin();
}