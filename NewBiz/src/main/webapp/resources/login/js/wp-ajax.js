/*
  Library of AJAX and supporting functions

  @author Krishna_Tandra
*/

var mainPageRequest;
var bookmarksPageRequest;
var submitBookmarkRequest;
var provisioningPageRequest;
var detailsPageRequest;
var detailsPageInstallerRequest;
var restoreSessionRequest;
var manualInstall;

//=========================================================
// base AJAX support
//=========================================================
// Check the current document for an EXTRAWEB_TIMED_OUT cookie.  If present, return true
// This method is called after every AJAX request so we can catch timeout pages from EW
// and display them as the entire window contents, and not just shoot the content at the
// area (div, span, etc.) the original request's contents were supposed to fill.
//
// Also, we use this method as a common return point for resetting the damn 'linkClicked'
// state for IE.  If we've gotten as far as getting an AJAX response, we've already gotten
// past the exit warning dialog (that was suppressed by SETTING the linkClicked state!).
function isResponseATimeout()
{
    var result = false;

    if (readCookie("EXTRAWEB_TIMED_OUT") != null) {
        removeCookie("EXTRAWEB_TIMED_OUT", "/");
        result = true;
    }

    var teamID = readCookie("EXTRAWEB_ID");
    if (teamID == null || teamID == "CLEAR" ) {
        result = true;
    }

    // clear up the IE click tracking mess
    resetLinkClicked();
    return (result);
}

// deal with a session timeout.  Basically, EW returns an error message that instructs the user to
// close the browser and log back in...
function handleTimeout(httpRequestObj)
{
    // the simplest way to deal with this is to 'refresh' the page.  EW will send back the same
    // timeout error for the entire page
    // setLinkClicked() needs to be called here because isResponseATimeout() resets it and we don't
    // want a log off warning dialog here
    setLinkClickedState();
    window.location.href = "/workplace/access/home";
}

// Inject the AJAX response text of the given request into the given document element
function showResponseText(httpRequestObj, containerElementId)
{
    document.getElementById(containerElementId).innerHTML = httpRequestObj.responseText;
}

// AJAX in IE6 without ActiveX requires the use of an IFRAME to request content from
// the server, then the content is taken from the IFRAME and placed in the appropriate
// place on the page.  This has the unfortunate side effect of executing static JavaScript
// when the content is fetched, so be careful where you place static (global) JS in .JSP pages
var CustomHttpRequest = function()
{
    this.method = "POST";
    this.url = null;
    this.async = true;
    this.iframe = null;
    this.responseText = null;
    this.header = new Object();
    this.id = "_xmlhttp_" + new Date().getTime();
    this.container = document.body;
}

// Open a request
CustomHttpRequest.prototype.open = function(method, url, async)
{
    this.method = method;
    this.url = url;
    this.async = async;
    this.readyState = 0;
    this.iframe = document.createElement("IFRAME");
    this.iframe.src = "javascript:false";
    this.iframe.style.visibility = "hidden";
    this.iframe.id = this.id;

    if (document.getElementById(this.id) == null) {
        this.container.appendChild(this.iframe);
    }
    this.setRequestHeader("___xmlhttp", "iframe");
}

// Set a request header
CustomHttpRequest.prototype.setRequestHeader = function(name, value)
{
    this.header[name] = value;
}

// Construct the request and go get the page
CustomHttpRequest.prototype.send = function(data)
{
    var html = [];

    html[html.length] = '<html><body><form method="' + this.method + '" action="' + this.url + '">';
    for (name in this.header) {
        html[html.length] = '<textarea name="' + name + '">' + this.header[name] + '</textarea>';
    }
    if (data != null && data.length > 0) {
        html[html.length] = '<textarea name="_data">' + data + '</textarea>';
    }
    html[html.length] = '<s' + 'cript>document.forms[0].submit();</s' + 'cript>';
    html[html.length] = '</form></body></html>';

    this.iframe._xmlhttp = this;
    this.iframe._xmlhttp._fix = -1;
    this.iframe._xmlhttp.responseText = null;
    this.iframe.onreadystatechange = this._onreadystatechange;
    this.iframe.src = "javascript:document.write('" + html.join('').replace(/\'/g, "\\'").replace(/\r\n/g, "\\r\\n") + "');void(0);";
}

// process state changes for the request, simulating normal XHLHttpRequest states
CustomHttpRequest.prototype._onreadystatechange = function()
{
    this._xmlhttp._fix++;

    if (this._xmlhttp._fix < 1) {
        return;
    }
    if (this._xmlhttp._fix == 1) {
        this._xmlhttp.readyState = 1;
    }
    else if (this._xmlhttp._fix > 1) {
        switch (this.readyState.toString()) {
        case "loading":
            this._xmlhttp.readyState = 2;
            break;

        case "interactive":
            this._xmlhttp.readyState = 3;
            break;

        case "complete":
            this._xmlhttp.responseText = window.frames[this.id].document.childNodes[0].innerHTML;
            this.onreadystatechange = function() {}
            this._xmlhttp.readyState = 4;
            this._xmlhttp.status = 200;
            break;
        }
    }
    if (typeof(this._xmlhttp.onreadystatechange) == "function") {
        this._xmlhttp.onreadystatechange();
    }
}

// Create an AJAX request object.  In all cases, except for IE6 without ActiveX,
// we use a real XMLHttpRequest.  IE6 without ActiveX causes us to jump through
// many painful hoops to successfully implement...
function createRequestObject(readystate)
{
    http_request = false;

    if (window.XMLHttpRequest) {        // Mozilla, Safari, IE7+
        http_request = new XMLHttpRequest();
        if (http_request.overrideMimeType) {
            http_request.overrideMimeType('text/xml'); // ensures non-XML content can be received
        }
    }
    else if (window.ActiveXObject) {    // IE
        try {
            http_request = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) { // create a IFRamed XmlHttpRequest object
                http_request = new CustomHttpRequest();
            }
        }
    }
    if (http_request && readystate) {
        http_request.onreadystatechange = readystate;
    }
    return http_request;
}

//=========================================================
// AJAX support for the Main WP home page
//=========================================================
function sendMainPageRequest(args)
{
        mainPageRequest = createRequestObject(function()
        {
            if (mainPageRequest.readyState == 4) {
                if (mainPageRequest.status == 200) {
                    if (isResponseATimeout()) {
                        handleTimeout(mainPageRequest);
                    }
                    else {
                        showResponseText(mainPageRequest, "content_container");
                        callMainPageJSFunctions();  // call stuff that needs to be called on each 'refresh'
                    }
                }
            }
        });

        if (mainPageRequest) {
            mainPageRequest.open('GET', '/workplace/access/main?rand=' + new Date().getTime() + args, true);
            mainPageRequest.send(null);
        }
}

function callMainPageJSFunctions()
{
    showVisibleTabs();
}

// collect and encode data to be posted for adding bookmarks
function aggregatePostData(form)
{
    var postData = '';
    var length = form.elements.length;

    for (i = 0; i < form.elements.length; i++) {
        if ((form.elements.item(i).type != 'checkbox' && form.elements.item(i).type != 'radio') || (form.elements.item(i).checked && !form.elements.item(i).disabled)) {
            // fix for 31904, 31907 & 31746...  encode '&' and '=' characters
            var name = form.elements.item(i).name;
            name = name.replace(/&/g, "%26");
            name = name.replace(/=/g, "%3D");
            name = name.replace(/\+/g, "%2B");
            var value = encodeURI(form.elements.item(i).value);
            value = value.replace(/&/g, "%26");
            value = value.replace(/=/g, "%3D");
            value = value.replace(/\+/g, "%2B");
            postData += name + '=' + value + '&';
        }
    }

    return postData.substring(0, postData.lastIndexOf('&'));
}

//=========================================================
// AJAX support for personal bookmarks
//=========================================================
function sendManageBookmarkPageRequest(bkmrkid, action)
{
    bookmarksPageRequest = createRequestObject(function()
    {
        if (bookmarksPageRequest.readyState == 4) {
            if (bookmarksPageRequest.status == 200) {
                if (isResponseATimeout()) {
                    handleTimeout(bookmarksPageRequest);
                }
                else if (action == 'delete' && !isBookmarksDialog(bookmarksPageRequest.responseText)) {
                    hideModal('modaldialog');
                    showResponseText(bookmarksPageRequest, "content_container");
                    showVisibleTabs();
                }
                else {
                    showResponseText(bookmarksPageRequest, "modaldialog");
                    showModal("modaldialog");
                    setTimeout("updateClientType()", 100);
                }
            }
        }
    });

    if (bookmarksPageRequest) {
        bookmarksPageRequest.open('GET', '/workplace/access/managebookmarks?id=' + bkmrkid + '&action=' + action + '&page=' + curPage + '&rand=' + new Date().getTime(), true);
        bookmarksPageRequest.send(null);
    }
}

function submitBookmark()
{
    submitBookmarkRequest = createRequestObject(function()
    {
        if (submitBookmarkRequest.readyState == 4) {
            if (submitBookmarkRequest.status == 200) {
                if (isResponseATimeout()) {
                    handleTimeout(submitBookmarkRequest);
                }
                else if (!isBookmarksDialog(submitBookmarkRequest.responseText)) {
                    hideModal('modaldialog');
                    showResponseText(submitBookmarkRequest, "content_container");
                    showVisibleTabs();
                }
                else {
                    showResponseText(submitBookmarkRequest, "modaldialog");
                    showModal("modaldialog");
                    setTimeout("updateClientType()", 100);
                }
            }
        }
    });

    if (submitBookmarkRequest) {
        submitBookmarkRequest.open('POST', '/workplace/access/managebookmarks?rand=' + new Date().getTime(), true);
        // aggregate all post data in a string
        var postData = aggregatePostData(document.input);
        submitBookmarkRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        submitBookmarkRequest.send(postData);
    }
}

function isBookmarksDialog(response)
{
    return response.indexOf("bookmarksdialog") != -1;
}

//=========================================================
// AJAX support for updating the user's state (bookmarks location, link group state)
//=========================================================
function updateUserState(stateStr)
{
    var updateUserStateRequest = createRequestObject(null);
    if (updateUserStateRequest) {       // todomvk - do we need a random number on all AJAX queries?
        updateUserStateRequest.open('GET', '/workplace/access/system/userstate?rand=' + new Date().getTime() + stateStr, true);
        updateUserStateRequest.send(null);
    }
}

//=========================================================
// AJAX support for provisioning (the "Install Software" page)
//=========================================================
function sendProvisioningPageRequest(url)
{
    var wpLiteEnabled = (document.getElementById('wpLiteEnabled').value == 'true');
    if (wpLiteEnabled) {
        openWebURL('/workplace/access/provision?rand=' + new Date().getTime());
        return;
    }

    manualInstall = (url != null && url != '');

    provisioningPageRequest = createRequestObject(handleProvisioningPageResponse);

    if (provisioningPageRequest) {
        if (!url) {
            url = '/workplace/access/provision?rand=' + new Date().getTime();
        }
        provisioningPageRequest.open('GET', url, true);
        provisioningPageRequest.send(null);
    }
}

function handleProvisioningPageResponse()
{
    if (provisioningPageRequest.readyState == 4)
    {
        if (provisioningPageRequest.status == 200)
        {
            if (isResponseATimeout())
            {
                handleTimeout(provisioningPageRequest);
            }
            else
            {
                showResponseText(provisioningPageRequest, "modaldialog");

                if ( isBrowserIE && !isActiveXEnabled )
                {
                    setLinkClicked(); //Fix for bug 75338
                }

                if (!manualInstall)
                {
                    showModal("modaldialog");
                    setTimeout("showSizeAndVersion()", 500);
                }
            }
        }
    }
}

// show the size and version of the install file
function showSizeAndVersion()
{
    document.getElementById("fileSize").innerHTML = document.getElementById("size").value;
    document.getElementById("fileVersion").innerHTML = document.getElementById("version").value;
}

//=========================================================
// Sinopec TL7 integration
//=========================================================
function mangleVersion(versionString)
{
    var segments = versionString.split(".");
    if (segments.length == 3) {
        return versionString;
    }

    var nver = "";
    for ( i = 0; i < segments.length; i++) {
        if (i != 0 && i != 2) {
            nver += ".";
        }
        nver += segments[i];
    }
    return nver;
}

function isUpgradeRequired(currentVersion, desiredVersion)
{
    currentVersion = mangleVersion(currentVersion);
    desiredVersion = mangleVersion(desiredVersion);

    var desArray = desiredVersion.split(".");
    var curArray = currentVersion.split(".");

    var minVerParts = 0;
    if( desArray.length == curArray.length || desArray.length < curArray.length )
    {
        minVerParts = desArray.length;
    }
    else if( desArray.length > curArray.length )
    {
        minVerParts = curArray.length;
    }

    lesser = false;
    for( i = 0; i < minVerParts; i++ )
    {
        if( parseInt(curArray[i]) < parseInt(desArray[i]) )
        {
            lesser = true;
            break;
        }
        else if( parseInt(curArray[i]) > parseInt(desArray[i]) )
        {
            break;
        }
    }

    if( !lesser && desArray.length > minVerParts )
    {
        lesser = true;
    }

    return lesser;
}

function doneInstall(name, result)
{
    if (result != 0 && result != 999)
    {
        alert("Ondemand Tunnel BootStrap Installation failed, result <" + result + ">");
    } else {
        alert("Ondemand Tunnel BootStrap Installation complete, Please logout and restart your browser.");
        window.close();
    }
}

function installODTBootstrap()
{
    var xpi = new Object();
    xpi["Sonicwall Ondemand Tunnel"] = document.getElementById('xpiPath').value;
    InstallTrigger.install(xpi, doneInstall);
}

function isXPIInstallReqd()
{
    var isMozilla09 = (navigator.userAgent.toLowerCase().indexOf('rv:0.9') != -1);
    if (!isMozilla09)
        return false;

    if (InstallTrigger.getVersion("ODT") == null ||
        isUpgradeRequired(InstallTrigger.getVersion("ODT"), document.getElementById("rversion").value)) {
        return true;
    }

    return false;
}

function legacyComponentInstall()
{
    document.getElementById('install').disabled = true;

    if (isXPIInstallReqd()) {
        installODTBootstrap();
        return;
    }

    try {
        var iframe = document.getElementById('ngjsFrame');
        iframe.src = document.getElementById('ngjsPath').value;
        iframe.style.visibility = 'hidden';
        return;
    }
    catch(e) {
        cpiSet('installedMsg', 'msgInstallFailed');
    }
}
//=========================================================

// install Connect Tunnel, called when the "Install" button is clicked
function componentInstall()
{
    // Install CT via signed scripts for Sinopec
    if (document.getElementById('ngjsFrame') != null &&
        typeof document.getElementById('ngjsFrame') != "undefined")
    {
        legacyComponentInstall();
        return;
    }

    var ngEnabled = (document.getElementById('ngEnabled').value == 'true');
    var ngActivated = (ngEnabled && typeof document.ngclient != "undefined");

    try {
        if (document.EPInstaller == null || typeof document.EPInstaller == "undefined") {
            cpiSet('installedMsg', 'msgNotSupported');
            return;
        }
        cpiPreset();
        var os = document.getElementById('installType').value;
        if (os == "linux" || os == "mac") {
            if (ngActivated) {
                cpiAlreadyInstalled();
            } else {
                crspInstall(os);
            }
            return;
        }
        var isInstalled = document.EPInstaller.IsComponentMsiInstalled();
        if (isInstalled == "false") {
            document.getElementById('install').disabled = true;
            cpiSet('installingAgent', 'msgInstalling');
            // need to set a quick timer here so the browser can update the page with the 'installing' message
            setTimeout(doInstall, 150, ngActivated);
        }
        else {
            cpiAlreadyInstalled();
        }
    }
    catch(e) {
        cpiSet('installedMsg', 'msgInstallFailed');
    }
}

function doInstall(ngActivated)
{
    try {
        var result = 0;
        if (ngActivated) {
            document.ngclient.InstallShortcuts();
        } else {
            result = document.EPInstaller.InstallComponentMsi(0, document.getElementById("msiPath").value);
        }
        document.getElementById('installingAgent').innerHTML = '';
        if (result != 0) {
            cpiSet('installedMsg', 'msgInstallFailed');
        }
        else {
            cpiSet('installingAgent', 'msgInstallComplete');
        }
        document.getElementById('install').style.display = 'none';
    }
    catch (e) {
        eid('installingAgent').innerHTML = '';
        cpiSet('installedMsg', 'msgInstallFailed');
    }
}

// grab content from one element and stuff it in another, making sure the target is visible
function cpiSet(targ, src)
{
    // ensure the div is visible
    document.getElementById(targ).style.display = 'block';
    document.getElementById(targ).innerHTML = document.getElementById(src).value;
}

function cpiAlreadyInstalled()
{
    cpiSet('installedMsg', 'msgAlreadyInstalled');
}

function xgAlreadyInstalled(version)
{
    var msg = document.getElementById('xgAlreadyInstalled').value;
    msg = msg.replace(/x.x.x.x/g, version);
    document.getElementById('installedMsg').style.display = 'block';
    document.getElementById('installedMsg').innerHTML = msg;
}

function cpiPreset()
{
    eid('installedMsg').innerHTML = '';
    eid('installingAgent').innerHTML = '';
}

function crspStartInstall()
{
    try {
        crspDoInstall();
    }
    catch (e) {
        eid('installingAgent').innerHTML = '';
        cpiSet('installedMsg', 'msgInstallFailed');
        cpiShowManual();
    }
}

function cpiShowManual()
{
    eid('fallbackManual').style.display = 'inline';
}

function crspDoInstall()
{
    var jar = document.getElementById("msiPath").value;
    var version = document.getElementById("rversion").value;
    var userdir = document.getElementById("userdir").value;
    var dir = userdir + '.aventail/ct';

    if (document.getElementById('tmpdir') != null) {
        dir = document.getElementById('tmpdir').value;
    }
    var verfile = document.getElementById('verfile').value;
    var product = document.getElementById('product').value;

    if (eid('install').value == eid('reinstall_caption').value) {
        verfile = 'nil';        // Bypass version check, force new install.
    }
    var res = document.EPInstaller.InstallAsync(product, jar, verfile, version, dir, '', '', true);
    checkInstallStatus(res);
}

function checkInstallStatus(res)
{
    if (!res) {
        res = document.EPInstaller.GetInstallStatus();
    }
    if (res == -19000) {
        setTimeout(checkInstallStatus, 250);
        return;
    }

    var os = document.getElementById('installType').value;
    if (os == 'linux') {
        postInstSetupProxies(res);
    }
    else {
        crspInstallFinished(res);
    }
}

function postInstSetupProxies(res)
{
    if (res == 0) {
        if (document.ngclient.Activate() != 0)
            return;
    }
    crspInstallFinished(res);
}

function crspInstallFinished(res)
{
    eid('installingAgent').innerHTML = '';
    eid('install').disabled = false;

    if (res == 110) {
        document.ngclient.RefreshStatistics();
        var version = document.ngclient.ClientVersion;
        xgAlreadyInstalled(version);
        eid('install').value = eid('reinstall_caption').value;
        return;
    }

    if (res != 0) {
        cpiSet('installedMsg', 'msgInstallFailed');
        cpiShowManual();
        return;
    }

    cpiSet('installingAgent', 'msgInstallComplete');
    eid('install').style.display = 'none';
}

function detectJava()
{
    try {
        var ps = navigator.plugins;
        for (var i = 0; i < ps.length; ++i) {
            var n = ps[i].name;
            if (n.toLowerCase().indexOf("java") != -1) {
                return true;
            }
        }
        return false;
    }
    catch (e) { // If we can't detect, assume Java's there (lame)
        return true;
    }
}

function cpCheckJava()
{
    if (!detectJava()) {
        cpManualInstall();
        return false;
    }
    return true;
}

function cpManualInstall()
{
    sendProvisioningPageRequest('/workplace/access/mprovision');
}

function crspInstall(os)
{
    if (!cpCheckJava()) {
        return;
    }

    cpiSet('installingAgent', 'msgInstalling');
    eid('install').disabled = true;
    // If we don't use this timeout, Safari doesn't redraw 'installingAgent'.
    setTimeout(crspStartInstall, 100);
}

//=========================================================
// AJAX support for the System Status (Details) page
//=========================================================
// instantiates the installer for the details page
function sendDetailsPageInstallerRequest()
{
    detailsPageInstallerRequest = createRequestObject(handleDetailsInstallerResponse);

    if (detailsPageInstallerRequest)
    {
        detailsPageInstallerRequest.open('GET', '/workplace/access/system/statusinstaller?detailspage=1&rand=' + new Date().getTime(), true);
        detailsPageInstallerRequest.send(null);
    }
}

function handleDetailsInstallerResponse()
{
    if (detailsPageInstallerRequest.readyState == 4)
    {
        if (detailsPageInstallerRequest.status == 200)
        {
            showResponseText(detailsPageInstallerRequest, "INSTALLERTAG");

            if ( isBrowserIE && !isActiveXEnabled )
            {
                setLinkClicked(); //Fix for bug 75338
            }

            showInstallerVersion();
        }
    }
}

// Display the details dialog
function sendDetailsPageRequest()
{
    detailsPageRequest = createRequestObject(handleDetailsResponse);

    if (detailsPageRequest) {
        detailsPageRequest.open('GET', '/workplace/access/system/status?rand=' + new Date().getTime(), true);
        detailsPageRequest.send(null);
    }
}

function handleDetailsResponse()
{
    if (detailsPageRequest.readyState == 4)
    {
        if (detailsPageRequest.status == 200)
        {
            if (isResponseATimeout())
            {
                handleTimeout(detailsPageRequest);
            }
            else {
                showResponseText(detailsPageRequest, "modaldialog");
                showModal("modaldialog");
                // If we have a place to inject the installer and the user installed it, load it
                // the response handler will call the JS Functions when it's done loading
                var betInstalled = document.getElementById('betInstalled').value;
                var ngInstalled = document.getElementById('ngInstalled').value;
                var odInstalled = document.getElementById('odInstalled').value;
                var installerdiv = document.getElementById("INSTALLERTAG");
                var installerloading = false;
                if (installerdiv) {
                    // if there was an install error, see if it was an agent installation error.  If so (any one of the
                    // agent installed values is != -1), the installer did get installed and we should show it
                    if (userInstallOption == "yes" || (userInstallOption == 'installerror' &&
                        ((betInstalled != -1) || (ngInstalled != -1) || (odInstalled != -1)))) {
                        sendDetailsPageInstallerRequest();
                        installerloading = true;
                    }
                }
                callDetailsPageJSFunctions(installerloading);
            }
        }
    }
}

//=========================================================
// AJAX support for restoring session
//=========================================================
function restoreSession(status)
{
    restoreSessionRequest = createRequestObject(function()
    {
        if (restoreSessionRequest.readyState == 4) {
            if (restoreSessionRequest.status == 200) {
                if (isResponseATimeout()) {
                    handleTimeout(restoreSessionRequest);
                }
                else {
                    hideModal('modaldialog');
                }
            }
        }
    });

    if (restoreSessionRequest) {
        restoreSessionRequest.open('POST', '/__extraweb__maxUserSession', true);
        restoreSessionRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        restoreSessionRequest.send("workplaceLink=true&" + (status ? "okButton=OK" : "cancelButton=Cancel"));
    }
}

function matchesValue(elementId, expectedValue)
{
    if (document.getElementById(elementId) != null &&
                typeof document.getElementById(elementId) != "undefined" &&
                    document.getElementById(elementId).value == expectedValue) {
        return true;
    }
    return false;
}

//=========================================================
// utility methods
//=========================================================
// Append an element to the current document
function appendElement(tag, id, visible)
{
    if (!document.getElementById(id)) {
        var obj = document.createElement(tag);
        obj.setAttribute('id', id);
        if (!visible) {
            obj.style.display = 'none';
        }
        document.body.appendChild(obj);
    }
}

// get a document element by id
function eid(id)
{
    return document.getElementById(id);
}

// Set the display attribute of an element
function setElementDisplay(id, disp)
{
    var element = eid(id);
    if (element) {
        element.style.display = disp;
    }
}

// Hide a DOM element
function hideElement(id)
{
    setElementDisplay(id, 'none');
}

// show a DOM element
function showElement(id)
{
    setElementDisplay(id, 'inline');
}

// Hide or show a DOM element
function setElementVisible(id, isvis)
{
    setElementDisplay(id, isvis? 'block' : 'none');
}
