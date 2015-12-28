var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RedditBoostPlugin;
(function (RedditBoostPlugin) {
    var HoverPreviewPlugin = (function (_super) {
        __extends(HoverPreviewPlugin, _super);
        function HoverPreviewPlugin() {
            _super.apply(this, arguments);
            this._loadingAnimation = "<div id='loadingAnimation' class='uil-default-css' style='transform:scale(1);'>\
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
            this._lastLink = { lastLink: "", isActive: false, element: null };
            this._processing = false;
            this._imageCache = string;
        }
        return HoverPreviewPlugin;
    })(utils.Singleton);
    { }
    ;
    get;
    init();
    {
        return this._init;
    }
    _init();
    void {
        this: .setSingleton(),
        this: ._supportedMediaPattern = new RegExp(".(gif|gifv|jpg|jpeg|png|bmp)$"),
        this: ._supportedMediaPattern.ignoreCase = true,
        this: ._supportedDomains = new RegExp("(imgur.com|gfycat.com)$"),
        this: ._supportedDomains.ignoreCase = true,
        $: function () { }, 'body': , append: function () { }, "<div id='RedditBoost_imagePopup'><h3 id='RedditBoost_imagePopupTitle'></div>": ,
        $: function () { }, '#RedditBoost_imagePopup': , hide: function () { },
        setInterval: function () { } }();
    {
        this._showPreview();
    }
    15;
    ;
})(RedditBoostPlugin || (RedditBoostPlugin = {}));
_showPreview();
{
    if (this._processing)
        return;
    this._processing = true;
    var hoveredLink = $('a.title:hover, p a:hover').first();
    if (hoveredLink.length > 0) {
        var linkType = this._getLinkType(hoveredLink);
        if (this._isSupported(linkType)) {
            this._tryPreview(linkType);
        }
        this._adjustPreviewPopup();
    }
    else {
        $('#RedditBoost_imagePopup').hide();
        this._lastLink = { lastLink: "", isActive: false, element: null };
    }
    this._processing = false;
}
_getLinkType(linkElement, JQuery);
{
    link: string, extension;
    string, source;
    string, fileName;
    string;
}
{
    var link = $(linkElement).attr("href");
    var fileName = HoverPreviewPlugin._getFileName(link);
    var extension = this._getExtension(fileName);
    var source = HoverPreviewPlugin._getDomain(link);
    return { link: link, extension: extension, source: source, fileName: fileName };
}
_getFileName(link, string);
string;
{
    var linkSections = link.split("/");
    var filenameWithParameters = linkSections.pop();
    var fileWithoutParameters = filenameWithParameters.split("?")[0];
    return fileWithoutParameters;
}
_getExtension(fileName, string);
string;
{
    var extension = fileName.split('.').pop();
    if (!this._supportedMediaPattern.test(fileName.toLowerCase())) {
        return "";
    }
    return extension;
}
_getDomain(link, string);
string;
{
    link = link.replace(/.*?:\/\//g, "");
    link = link.split('/')[0];
    if ((link.toLowerCase().match('/\./g') || []).length == 4 || ((link.toLowerCase().match('/\./g') || []).length == 3 && link.toLowerCase().indexOf('.co.') < 0)) {
        link = link.split('.').shift().concat();
    }
    return link;
}
_isSupported(linkType, { link: string, extension: string, source: string, fileName: string });
boolean;
{
    if (this._isSupportedMediaPattern(linkType.extension)) {
        return true;
    }
    if (this._isSupportedDomain(linkType.source, linkType.link)) {
        return true;
    }
    return false;
}
_isSupportedMediaPattern(link, string);
boolean;
{
    if (this._supportedMediaPattern.test(link.toLowerCase())) {
        return true;
    }
    return false;
}
_isSupportedDomain(domain, string, link, string);
boolean;
{
    if (this._supportedDomains.test(domain)) {
        if (link.toLowerCase().indexOf('/a/') < 0 && link.toLowerCase().indexOf('/gallery/') < 0 && link.toLowerCase().indexOf(',') < 0) {
            return true;
        }
    }
    return false;
}
_tryPreview(linkType, { link: string, extension: string, source: string, fileName: string });
void {
    if: function () { }, this: ._isSupportedMediaPattern(linkType.extension) };
{
    this._displayImage(linkType);
}
if (this._imageCache[fileName] != null) {
}
else if (this._isSupportedDomain(linkType.source, linkType.link)) {
}
_displayImage(linkType, { link: string, extension: string, source: string, fileName: string });
void {};
_adjustPreviewPopup();
{
}
exports.HoverPreview = new HoverPreviewPlugin();
//# sourceMappingURL=HoverPreview.js.map