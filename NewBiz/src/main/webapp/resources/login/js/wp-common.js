/*
  This file contains javascript for entire workplace and is included when workplace
  is accessed from windows or linux platforms

  @author Krishna_Tandra
*/

/* Sets the workplace window name.*/
window.name = "aventail_workplace_window";

var opened_windows = new Array();
var open_window_count = 0;

/* Sets a flag to specify whether or not to show the exit warning.*/
var showWarning = "true";

/* Sets a flag to specify whether or not to continue with the logoff sequence.*/
var doLogOff = "false";

/* a flag to indicate that the user opted out of agent installation, either once or permanently */
var userInstallOption = "yes";      // or "notnow" or "never"

/* a flag to indicate that there is an access agent (EWPCA, OD, or OD Tunnel) activated by WP */
var accessAgentActivating = false;
var progressDialogShowing = false;
var isModalDialogOpen = false;

/* Variables for displaying visible TABS */
var maxTabs = 5;
var startPage = 1;
var endPage = maxTabs;
var curPage = startPage;

/* Flag to indicate whether or not OD Dynamic Portmapper is injected */
var odDynInjected = false;
/*******************************************************************************/
// Debugging utilities
// Sample:
//    openDebugWindow("txt");
//    setDebugElementText("WPCOUNT", "incremented to " + count);
var debugWindow = null;
var debugElements = null;

var OS,browser,version,total,thestring;
var detect;

// opens a blank window with the given elements, separated by semicolons (with no
// whitespace), as separate div's that can be altered via javascript
function openDebugWindow(elements)
{
    if (debugWindow == null) {
        debugWindow = window.open('', 'DebugWindow', 'height=400, width=500');
        debugWindow.document.write('<html><head><title>Debug Window</title>');
        debugWindow.document.write('</head><body>');
        var elementArray = elements.split(';');
        for (var i = 0; i < elementArray.length; i++) {
            var e = elementArray[i];
            debugWindow.document.write('<div id="');
            debugWindow.document.write(e);
            debugWindow.document.write('">');
            debugWindow.document.write(e);
            debugWindow.document.write('</div>');
        }
        debugWindow.document.write('</body></html>');
        debugWindow.document.close();
    }
}

// Set the text of a debug element
function setDebugElementText(element, text)
{
    if (debugWindow != null) {
        try {
            debugWindow.document.getElementById(element).innerHTML = element + ": " + text;
        }
        catch (e) {
            alert(e.message);
        }
    }
}

// Append text to a debug element
function appendDebugElementText(element, text)
{
    if (debugWindow != null) {
        try {
            var oldtxt = debugWindow.document.getElementById(element).innerHTML;
            debugWindow.document.getElementById(element).innerHTML = oldtxt + "<br>" + text;
        }
        catch (e) {
            alert(e.message);
        }
    }
}
// End of Debugging utilities
/********************************************************************************/

// * Workplace main page onload method
function mainOnLoad(disableAutoLogoff)
{
    if ( !allowRefresh( "ONLOAD" ) )
    {
        incrementCount();
        if (!disableAutoLogoff) {
            handleIfNavigated();
        }
        checkForLogoutButton();
    }
    showVisibleTabs();
}

// * Workplace main page onunload method
function mainOnUnload(disableAutoLogoff)
{
    if ( !allowRefresh( "ONUNLOAD" ) )
    {
        closeWebifierWindows();
        setLogoff();
        if (!disableAutoLogoff) {
            handleLogoff();
        }
    }
}

/*
     This function checks whether or not we allow IE7 to refresh.
     Specifically, we have to allow workplace to refresh on IE7 when the
     browser is reset and there are agents on workplace.
     On those times, when workplace loads, agent activation is interrupted by
     a Yellow security bar. Upon clicking it, IE refreshes.
     When it is the first workplace load, we have to prevent workplace from
     logging the user out [see bug 69048].
     The logic used here is to first count the number of agents that are expected to be
     activated on workplace. CT is one and OD+Ewpca is another.
     When IE first loads, we check if there is a refresh cookie.
     If there is, we increment its value.

     A refresh is broken down in to an unload and then a load.
     On Unload, the refresh cookie value is incremented.

     Since we can only allow the very first refresh and none afterwards,
     if agent is enabled, the value is incremented as follows:

     ->First Load -> Refresh cookie not present -> Do nothing
     ->First Unload & 1 agent enabled but not running -> Increment cookie to 1
     ->First Load & 1 agent enabled but not running -> Increment cookie to 2

     ->Second unload -> if 1 agent enabled && if cookie value >= 2, log the user out.

     For 2 agents, the process is:

     ->First Load -> Refresh cookie not present -> Do nothing
     ->First Unload & 2 agents enabled but not running -> Increment cookie to 1
     ->First Load & 2 agents enabled but not running -> Increment cookie to 2
     ->Second Unload (for second agent) & 2 agents enabled but not running -> Increment cookie to 3
     ->Second Load & 2 agents enabled but not running -> Increment cookie to 4

     ->Third unload -> if 2 agents enabled && cookie value >= 4, log the user out.
 */
function allowRefresh( when )
{
    if ( isIE7AndAbove() && agentsAreEnabled() && !agentsAreLoadedAndRunning() )
    {
        var refreshValue = readCookie( "REFRESH_COOKIE" );
        if ( when == "ONLOAD" && refreshValue != null )
        {
            if ( noOfAgents() == 1 && refreshValue == "1" )
            {
                createCookie("REFRESH_COOKIE", "2", 0, "false");
                return true;
            }
            else if ( noOfAgents() == 2 )
            {
                if ( refreshValue == "1" )
                {
                    createCookie("REFRESH_COOKIE", "2", 0, "false");
                    return true;
                }
                else if ( refreshValue == "3" )
                {
                    createCookie("REFRESH_COOKIE", "4", 0, "false");
                    return true;
                }
            }
        }
        else if ( when == "ONUNLOAD" )
        {
            if ( noOfAgents() == 1 )
            {
                if ( refreshValue == null || refreshValue == "" )
                {
                    createCookie("REFRESH_COOKIE", "1", 0, "false");
                    return true;
                }
            }
            else if ( noOfAgents() == 2 )
            {
                if ( refreshValue == null || refreshValue == "" )
                {
                    createCookie("REFRESH_COOKIE", "1", 0, "false");
                    return true;
                }
                else if ( refreshValue != null && refreshValue == "2" )
                {
                    createCookie("REFRESH_COOKIE", "3", 0, "false");
                    return true;
                }
            }
        }
    }

    return false;
}

function noOfAgents()
{
    var count = 0;
    var betEnabled = (document.getElementById('activateBET').value == 'true');
    var odEnabled = (document.getElementById('ODEnabled').value == 'true');
    var ngEnabled = (document.getElementById('ngEnabled').value == 'true');

    if ( betEnabled || odEnabled ) count++;
    if ( ngEnabled ) count++;

    return count;
}

function isAAMInstalled()
{
    return userInstallOption == "yes";
}

function agentsAreEnabled()
{
    var betEnabled = (document.getElementById('activateBET').value == 'true');
    var odEnabled = (document.getElementById('ODEnabled').value == 'true');
    var ngEnabled = (document.getElementById('ngEnabled').value == 'true');

    return betEnabled || odEnabled || ngEnabled;
}

function agentsAreLoadedAndRunning()
{
    var statusOD = false;
    var statusNG = false;

    if ( typeof document.OnDemand != "undefined" )
    {
        try
        {
            document.OnDemand.GetStatus();
            statusOD = true;
        } catch (e)
        {
            statusOD = false;
        }
    }
    else if ( typeof document.ngclient != "undefined" )
    {
        try
        {
            getNGControl().RefreshStatistics();
            statusNG = true;
        }
        catch (e)
        {
            statusNG = false;
        }
    }

    return statusOD || statusNG;
}

// Scaling functions used when a Citrix webifier has a ScreenPercent setting in its ICA file.
function scaleDim(dim, perc)
{
    return Math.round( Math.sqrt( dim * dim * perc / 100 ), 0 );
}
function scaledWidth(perc)
{
    return scaleDim(screen.width, perc);
}
function scaledHeight(perc)
{
    return scaleDim(screen.height, perc);
}
// End scaling functions.

function openWebifierURL(url, width, height, uname, alwaysscroll, noplace)
{
    var myWidth = 1024;
    var myHeight = 768;
    var useScrolls = true;
    var additionals = '';

    if (myWidth > screen.availWidth) {
        myWidth = screen.availWidth;
    }

    if (myHeight > screen.availHeight) {
        myHeight = screen.availHeight;
    }

    var top = (screen.availHeight - myHeight) / 2;
    var left = (screen.availWidth - myWidth) / 2;

    if (top < 1) top = 1;
    if (left < 1) left = 1;

    var directAccess = "false";
    var ngActivated = readCookie("ngActivated");
    if (( typeof ngActivated != "undefined" ) && ngActivated != null) {
        directAccess = "true";
    }
    if (directAccess == "true")
        url = url + "&direct=1";

    var name = uname? uname : 'Webifier';
    var handle = window.open(url, name, 'width=' + myWidth +
        ', height=' + myHeight + (noplace? '' : ', top=' + top + ', left=' + left) +
        (useScrolls? ', scrollbars=1, resizable=1, menubar=1' : ', scrollbars=0') + additionals);
    registerPopup(handle);
}

function resizeWebifierWindow(width, height)
{
    if (width == 0 || height == 0)
        return;

    try {
        if (width > screen.availWidth) {
            width = screen.availWidth;
        }

        if (height > screen.availHeight) {
            height = screen.availHeight;
        }

        var top = (screen.availHeight - height) / 2;
        var left = (screen.availWidth - width) / 2;

        if (top < 1) top = 1;
        if (left < 1) left = 1;

        //reposition window
        window.moveTo(left, top);

        //resize window
        var offsetX = 0;
        var offsetY = 0;

        if( typeof( window.innerWidth ) == 'number' ) {
            var isWin = navigator.platform.indexOf("Win") != -1;
            if (width >= screen.availWidth && height >= screen.availHeight) {
                if(isWin) {
                    offsetX = 10;
                    offsetY = 60;
                }
            }
            else if (width >= screen.availWidth) {
                if(isWin) {
                    offsetX = 10;
                }
                offsetY = -17;
            }
            else if (height >= screen.availHeight) {
                offsetX = -17;
                if(isWin) {
                    offsetY = 60;
                }
            }
            window.resizeBy((width - window.innerWidth - offsetX), (height - window.innerHeight - offsetY));
        } else {
            window.resizeTo(width, height);
            if (width >= screen.availWidth && height >= screen.availHeight) {
                offsetX = 30;
                offsetY = 50;
            }
            else if (width >= screen.availWidth) {
                offsetX = 15;
            }
            else if (height >= screen.availHeight) {
                offsetY = 40;
            }
            if (width < screen.availWidth) {
                document.documentElement.style.overflowX = "hidden";
            }
            if (height < screen.availHeight) {
                document.documentElement.style.overflowY = "hidden";
            }
            var cw = 0, ch = 0;
            if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                //IE 6+ in 'standards compliant mode'
                cw = document.documentElement.clientWidth;
                ch = document.documentElement.clientHeight;
            } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                //IE 4 compatible
                cw = document.body.clientWidth;
                ch = document.body.clientHeight;
            }
            window.resizeTo(width + (width - cw) - offsetX, height + (height - ch) - offsetY);
        }
    } catch (e) { }
}

function centerRemoteDesktop()
{
    var avcontrol = document.getElementById("msrdp_control");
    if (typeof avcontrol == "undefined" || avcontrol == null)
        return;

    var fullHeight = getViewportHeight();
    var fullWidth = getViewportWidth();

    var height = avcontrol.offsetHeight;
    var width = avcontrol.offsetWidth;

    if (height <= 1 || width <= 1)
        return;

    var top = (fullHeight - height) / 2;
    var left = (fullWidth - width) / 2;
    if (top < 0) top = 0;
    if (left < 0) left = 0;

    avcontrol.style.top = top + "px";
    avcontrol.style.left = left + "px";
    document.body.style.background = "#000";
}

function openPublishedContent(url)
{
    var handle = window.open(url);
    registerPopup(handle);
}

function launchRemoteAssist()
{
    var handle = window.open('/workplace/access/download/VASAC');
    registerPopup(handle);
}

function registerPopup(handle)
{
    opened_windows[open_window_count++] = handle;
}

function clearPopups()
{
    opened_windows = new Array();
    open_window_count = 0;
}

function findWorkplaceHomeWindow()
{
    var w = window;
    while (w) {
        if (w.document.getElementById('citrix_fins')) {
            return w;
        }
        w = w.opener;
    }
    return undefined;
}

function injectHTML(id, html, makevisible)
{
    try {
        var el = document.getElementById(id);
        if (el) {
            el.innerHTML = html;
            if (makevisible)
                el.style.display = 'block';
        }
    }
    catch (e) {}
}

function parseWebifierWidth(url)
{
    try {
        var resp = url.indexOf('res-');
        if (resp == -1) return -1;
        var xp = url.indexOf('x', resp + 1);
        if (xp == -1) return -1;
        var wide = parseInt(url.substring(resp + 4, xp));
        return isNaN(wide)? 1024 : wide;
    }
    catch (e) {}
    return -1;
}

function parseWebifierHeight(url)
{
    try {
        var resp = url.indexOf('res-');
        if (resp == -1) return -1;
        var xp = url.indexOf('x', resp + 1);
        if (xp == -1) return -1;
        var ep = url.indexOf('/', xp);
        if (ep == -1) ep = url.length;
        var high = parseInt(url.substring(xp + 1, ep));
        return isNaN(high) ? 768 : high;
    }
    catch (e) {}
    return -1;
}

function openWebURL(url)
{
    var handle;

    if (isIE7AndAbove())
    {
        var link = document.getElementById("web_link");
        link.target = '_blank';
        link.href = url;
        link.click();
    }
    else
    {
        handle = window.open(url);
    }

    registerPopup(handle);
}

function openWindowForURL(url, name, netexpURL)
{
    var addressValue = url.toLowerCase();
    var farm = (url.indexOf("/*") != -1);

    if (netexpURL) {
        var pathindex = addressValue.indexOf("path=");
        if (pathindex != -1)
            addressValue = addressValue.substring(pathindex + 5);
    }

    var index = addressValue.indexOf("://");
    var protocol = index != -1 ? addressValue.substring(0, index) : "";
    var width = 0;
    var height = 0;
    var wurl = netexpURL? url : '';
    var handle;

    if (name == '' || name == null) {
        name = 'NetworkExplorer';
    }

    if (protocol == "ssh" || protocol == "telnet") {
        width = 1024;
        height = 768;
    }
    else if (protocol == "rdp" || protocol == "ica" || protocol == "citrix" || protocol == "vnc") {
        width = parseWebifierWidth(url);
        height = parseWebifierHeight(url);
        if (width == 0 && height == 0) {
            width = screen.availWidth;
            height = screen.availHeight;
        }
        if (width < 400)
            width = 1024;
        if (height < 400)
            height = 768;
    }

    if (width > 0 && height > 0) {
        var top = (screen.availHeight - height) / 2;
        var left = (screen.availWidth - width) / 2;
        if (top < 1) top = 1;
        if (left < 1) left = 1;
        var useScrolls = true;

        try { // Use hardcoded non-client sizes, since it's tricky to figure it out on different browsers.
            var ncWidth = 25,
                ncHeight = 30;

            var totWidth = width + ncWidth,
                totHeight = height + ncHeight;
            useScrolls = totWidth > screen.availWidth || totHeight > screen.availHeight;
            if (totWidth > screen.availWidth) {
                left = 1;
            }
            if (totHeight > screen.availHeight) {
                top = 1;
            }
        }
        catch (ignored) {}

        if (farm) {
            useScrolls = true;
        }
        try {
            handle = window.open(wurl, name, 'top=' + top + ', left=' + left + ', width=' + width +
                         ', height=' + height + (useScrolls? ', scrollbars=1, resizable=1' : ', scrollbars=0'));
        }
        catch (e) {}
    }
    else {
        handle = window.open(wurl, name);
    }
    opened_windows[open_window_count++] = handle;
    return handle;
}

// Sets the target for the window when a URL or SMB path is accessed from the direct access box.
// If it is accessed from the Main workplace window, then it sets the target to a new window.
// If accessed from a child and the main workplace page is also alive, then it leaves the target as the same window.
function setTarget(form)
{
    // determine whether this is a child window spawned out of
    // main workplace page or the main workplace window.
    try {
        if (typeof document.getElementById("networkExplorer") != "undefined") {
            if (document.getElementById("networkExplorer").value == 'true') {
                return; // this is the child window... so dont set target
            }
        }
    }
    catch (ignored) {}
    // this is the main workplace window... set the target
    form.target = 'NetworkExplorer';
    // Webifier Changes
    openWindowForURL(form.address.value);
    // If we're IE on Vista, we need to delay the form submission a bit to allow the opened
    // window to initialize fully.  This fixes bug 35007.  (Stupid f#&ing MS crap...)
    if (browser == "Internet Explorer") {
        if (navigator.appVersion.indexOf("Windows NT 6.0", 0) != -1) {
            // this is a generic sleep() algorithm - could be made into a fn...
            var start = (new Date()).getTime();
            var now = (new Date()).getTime();
            while ((now - start) < 1000) {  // pause for 1 second
                now = (new Date()).getTime();
            }
        }
    }
    resetLinkClicked(); // in case the 'GO' button wes clicked
    showWarning = "true";
}

function hideLogout()
{
    document.getElementById("logout").innerHTML = "";
}

// This function checks whether or not to display the logout button on the current window.
// If the main workplace window is alive, and the current window is the network explorer window
// (which is a child of main workplace window ), then logout button is not displayed.
function checkForLogoutButton()
{
    try {
        if (window.opener != undefined && !window.opener.closed) {
            if (typeof window.opener.document.getElementById("logoutRequired") != "undefined") {
                if (window.opener.document.getElementById("logoutRequired").value == 'false') {
                    hideLogout();
                }
            }
        }
    }
    catch (ignored) {}
}

// this function does what its name says (isn't that wonderful?  ;-)
function closeWebifierWindows()
{
    try {
        for (var i = 0; i < open_window_count; ++i) {
            try {
                opened_windows[i].webifierDisconnect();
            }
            catch (e) {}
            try {
                opened_windows[i].close();
            }
            catch (e) {}
        }
        try {
            cleanupNAMs();
        }
        catch (e) {}
        opened_windows = new Array();
        open_window_count = 0;
    }
    catch (e) {}
    return true;
}

// This function will be invoked from SEMApplet and informs the user that the session was terminated
function terminateUserSession()
{
    var message = document.getElementById("sessionTerminatedMessage").value;
    alert(message);
    document.getElementById("linkClicked").value = "true";
    window.location = "/workplace/access/exec/logoff";
}

// This function shows a warning message on the event <onbeforeunload>.
function showExitWarning()
{
    var ngPresent = "false";    // check if NG is running...
    var ngc = getNGControl();

    if (( typeof ngc != "undefined" ) && ngc != null) {
        ngPresent = "true";
    }

    // are we still loading? (IE7 initial load workaround for bug #33146)
    // Fix for bug 75338, dont show exitWarning when agents are loading
    if (progressDialogShowing) {
        //setLinkClicked();   // make 'handleLogoff() do nothing...
        //decrementCount();   // repair window count for upcoming refresh
        return;
    }

    // first check whether this warning is to be shown.
    if (showWarning != "false") {
        if (document.getElementById("whichAction").value != 'logoff') {
            // check whether a link was clicked on workplace page
            // if not then show the warning
            if (document.getElementById("linkClicked").value == "false") {
                if (getWindowCount() == 1) {
                    // check for refresh cookie
                    if ( isIE7AndAbove() && isAAMInstalled() && agentsAreEnabled() && !agentsAreLoadedAndRunning() ) {
                        var refreshValue = readCookie( "REFRESH_COOKIE" );
                        if ( noOfAgents() == 1 && ( refreshValue == null || refreshValue == "" )) {
                            return;
                        }
                        else if ( noOfAgents() == 2 ) {
                            if ( refreshValue == null || refreshValue == "" ) {
                                return;
                            }
                            else if ( refreshValue != null && refreshValue == "2" ) {
                                return;
                            }
                        }
                    }

                    var message = document.getElementById("exitWarningMessage").value;
                    return message;
                }
            }
            else { // reset the link clicked variable
                document.getElementById("linkClicked").value = "false";
            }
        }
    }
}

// Navigates to the previous page. ( Emulates browser back button behaviour ).
// If the window doesn't have a history, then it closes the window.  (used by NE)
function goBack()
{
    if (history.length != 0) {
        var loc = window.location;
        history.go(-1);
        setTimeout(function() { if (window.location == loc) window.close(); }, 400);
    }
    else {
        window.close();
    }
}

// Sets a variable if a link is clicked on the page.  This is used for IE to track
// the fact that we are NOT navigating away from workplace, and the we do
// NOT have to show the exit warning when a WP link is clicked.  (IE fires the
// window.onbeforeunload event for EVERY href access on a page, even when
// the link simply executes JavaScript and does not cause the location to change)
function setLinkClicked()
{
    if (browser == "Internet Explorer") {
        try {
            document.getElementById("linkClicked").value = "true";
        }
        catch (ignored) {}
    }
}

// Resets the link clicked status on workplace window.
function resetLinkClicked()
{
    try {
        document.getElementById("linkClicked").value = "false";
    }
    catch (ignored) {}
}

// Returns whether the last action was link click or not.
function getLinkClickedState()
{
    try {
        return document.getElementById("linkClicked").value;
    }
    catch (ignored) {}
    return "false";
}

// Sets the link clicked status on workplace window.
// Use this function to set 'linkClicked' variable for all browsers.
function setLinkClickedState()
{
    try {
        document.getElementById("linkClicked").value = "true";
    }
    catch (ignored) {}
}

// Sets the doLogOff flag = "true"
function setLogoff()
{
    doLogOff = "true";
}

// determine if the current window is the original main WP window
function isMainWindow()
{
    if (window.opener == undefined || window.opener.closed) {
        return true;
    }
    try {
        var fLRUndefined = (typeof window.opener.document.getElementById("logoutRequired") == "undefined");
        var loRequired = (window.opener.document.getElementById("logoutRequired").value != 'false');
        return  (fLRUndefined || loRequired);
    }
    catch (e) {
        return true;
    }
}

//  Function to initiate log off when the user clicks the window close button
//  Works only if <code>doLogOff</code> is "true" and the link clicked state is 'false'
function handleLogoff()
{
    if (doLogOff == "true") {
        // onUnload is fired on every link or button click in IE
        // So, check whether a link or button was clicked.
        if (getLinkClickedState() == "false") {
            // do this only if this is the main window
            if (isMainWindow()) {
                showWarning = "false";
                if (typeof document.EwLogOffForm != "undefined") {
                    decrementCount();
                    if (getWindowCount() == 0) {
                        try {
                            // if EWPCA is running, kill it now before the logout page is fetched
                            // this avoids a script error when the 'Close' button is clicked
                            if (document.OnDemand) {
                                document.OnDemand.Deactivate();
                            }
                        }
                        catch (e) {}
                        // kill the tunnel if it's running
                        try {
                            if (document.ngclient != null) {
                                document.ngclient.Deactivate();
                            }
                        }
                        catch (e) {}
                        // Stop DP Agent
                        try {
                            stopDPAgent();
                        }
                        catch (e) {}
                        // read the extraweb cookie, generate an MD5 signature and set the WPHASH cookie
                        var team = readCookie("EXTRAWEB_ID");

                        if (team != null && typeof team != "undefined") {
                            team = hex_md5(team);
                            createCookie("WPHASH", team, 0.5, "false");
                        }
                        addRemovalTeamCookie();
                        removeAllCookies();
                        // For the 4 different browsers we deal with, here are
                        // the values of navigator.appName and
                        // navigator.platform...(as of Jun 27, 2006)
                        //      IE:         Microsoft Internet Explorer, Win32
                        //      FF Win:     Netscape, Win32
                        //      FF Linux:   Netscape, Linux i686
                        //      Safari:	    Netscape, MacPPC/MacIntel
                        // For FF, we need to submit the logoff form here; check
                        // specifically for Apple in the vendor field so we avoid
                        // blowing up Safari (but submit correctly on IE/Firefox).
                        var browser_is_safari = false;
                        try {
                            browser_is_safari = (navigator.vendor.indexOf("Apple", 0) != -1);
                        } catch (e) {}
                        if (!browser_is_safari) {
                            try {
                                document.EwLogOffForm.submit();
                            }
                            catch (ignored) {}
                        }
                    }
                }
            }
        }
        else {
            resetLinkClicked();
        }
        doLogOff = "false";
    }
}

// Reads and returns a cookie value.
function readCookie(name)
{
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

// Creates/Sets a cookie with the given name and value.
// If persistent == "true", then the cookie is assigned an expiry date specified by days
function createCookie(name, value, days, persistent)
{
    if (persistent == "true") {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; Expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; Path=/; Secure";
    }
    else {
        document.cookie = name + "=" + value + "; Path=/; Secure";
    }
}

// This cookie is added when logging off (used/read by EW)
function addRemovalTeamCookie()
{
    var date = new Date();
    date.setTime(date.getTime() + (5 * 1000));
    var expires = "; Expires=" + date.toUTCString();
    document.cookie = "EXTRAWEB_REMOVED=true" + expires + "; Path=/; Secure";
}

// remove a cookie (by setting its expiration to yesterday)
function removeCookie(name, path)
{
    var value = "";
    var date = new Date();
    date.setTime(date.getTime() - (24 * 60 * 60 * 1000 ));
    var expires = "; Expires=" + date.toUTCString();

    document.cookie = name + "=" + value + expires + "; Path=" + path + "; Secure";
}

// Remove cookies as needed when user logs out
function removeAllCookies()
{
    removeCookie('JSESSIONID', '/workplace');
    removeCookie('SMSESSION', '/');
    removeCookie('CTSESSION', '/');
    removeCookie('WEBAGENT_AUTH', '/');
}

//  Clears the EPC state by removing the following cookies:
//  1. EPC_8_5_failed_activex
//  2. EPC_8_5_failed_java
function clearEPCState()
{
    var activeXCookie = "EPC_8_5_failed_activex";
    var javaCookie = "EPC_8_5_failed_java";

    removeCookie(activeXCookie, "/");
    removeCookie(javaCookie, "/");
}

//  Clears the install option state so user can log out, start over and install AAM
function clearInstallState()
{
    removeCookie("WPCOUNT", "/");
    removeCookie("ngActivated", "/");
}

//  Shows the "profile cleared" message and icon when the "Clear System Profile" button is clicked.
function showProfileClearedIcon()
{
    document.getElementById("profileCleared").style.visibility = "visible";
}

//  Shows the "install option cleared" message and icon when the "Clear Install Option" button is clicked.
function showInstallClearedIcon(id)
{
    document.getElementById("installCleared" + id).style.visibility = "visible";
}

// return the # of opened WP windows
function getWindowCount()
{
    var count = readCookie("WPCOUNT");
    count = parseInt(count);

    if (isNaN(count)) {
        count = 0;
    }
    return count;
}

// Increments the WPCOUNT cookie value by 1.
// This is called when a workplace window is opened/loaded.
function incrementCount()
{
    var count = readCookie("WPCOUNT");
    count = parseInt(count) + 1;

    if (isNaN(count)) {
        count = 1;
    }
    createCookie("WPCOUNT", count, 0.5, "false");
    // if this is the 1st WP window, make sure any TIMED_OUT cookie is gone
    if (count == 1) {
        removeCookie("EXTRAWEB_TIMED_OUT", "/");
    }
}

// Decrements the WPCOUNT cookie value by 1.
// This is called when a workplace window is closed/unloaded.
function decrementCount()
{
    var count = readCookie("WPCOUNT");
    count = parseInt(count) - 1;

    if (isNaN(count) || (count < 0)) {
        count = 0;
    }
    createCookie("WPCOUNT", count, 0.5, "false");
}

// Handles the scenario if the user navigates away from workplace (logs off) and then comes back.
// When the user is logged out, we generate an MD5 hash of the team ID and stash it in a cookie (WPHASH).
// If the hash value of the current team ID has not changed, the user has logged off, and we deny access.
function handleIfNavigated()
{
    var currentTeam = readCookie("EXTRAWEB_ID"); // get the current team ID

    // if the team ID has not changed, this user has been logged off
    if (currentTeam == null || compareTeamHash(currentTeam) == "true") {
        showWarning = "false";
        if (typeof document.EwLogOffForm != "undefined") {
            removeCookie('JSESSIONID', '/workplace');
            document.EwLogOffForm.submit();
        }
    }
}

// compare the given team ID's MD5 signature against WPHASH
function compareTeamHash(teamID)
{
    var oldValue = readCookie("WPHASH");

    // hash the new value and compare
    if (typeof teamID != "undefined") {
        newValue = hex_md5(teamID);
        if (oldValue == newValue) {
            return "true";
        }
    }
    return "false";
}

// Checks/Unchecks all the checkboxes depending on the "Select All" checkbox.
function groupCheck()
{
    var checkAllState = document.selectForm.all.checked;

    if (typeof document.selectForm.selections != "undefined") {
        var i = document.selectForm.selections.length - 1;

        if (i > 0) {
            do {
                document.selectForm.selections[i].checked = checkAllState;
            } while (--i);
        }
        if (typeof document.selectForm.selections[0] != "undefined") {
            document.selectForm.selections[0].checked = checkAllState;
            return;
        }
    }
    try {
        document.selectForm.selections.checked = checkAllState;
    }
    catch (ignored) {}
}

// Sets the state of the "Select All" checkbox.
function setState()
{
    if (typeof document.selectForm.selections != "undefined") {
        var i = document.selectForm.selections.length - 1;

        if (i > 0) {
            do {
                if (document.selectForm.selections[i].checked == false) {
                    document.selectForm.all.checked = false;
                    return;
                }
            } while (--i);
        }
        if (typeof document.selectForm.selections[0] != "undefined") {
            if (document.selectForm.selections[0].checked == false) {
                document.selectForm.all.checked = false;
                return;
            }
        }
        document.selectForm.all.checked = true;
        return;
    }
    try {
        document.selectForm.all.checked = document.selectForm.selections.checked;
    }
    catch (ignored) {}
}

// if the current value of the element is the same as its default, clear the current value
function clearDefault(el)
{
    if (el.defaultValue == el.value) {
        el.value = "";
    }
}

// set ODT status before submitting IA form
function setAgentStatus()
{
    var ngActivated = readCookie("ngActivated");
    if (( typeof ngActivated != "undefined" ) && ngActivated != null) {
        document.getElementById("direct").value = "1";
    }
    else {
        document.getElementById("direct").value = "0";
    }
}

// indicate that the logout link was clicked so we don't show a warning message
function setLogoffValue()
{
    document.getElementById("logoutRequired").value = "true";
    document.getElementById("whichAction").value = "logoff";
}

// Show the connection status and mode of OD
function showODStatus(statusRunning, statusError)
{
    var odStatus = 0;
    var odVer = "";
    var odInstalled = document.getElementById('odInstalled').value;

    if (odInstalled != 1) {   // OD is not installed
        showElementById("odnotinstalled");
    }
    else {
        showElementById("odinfo");
        try {
            odVer = document.OnDemand.GetVersion();
            odStatus = document.OnDemand.GetStatus();
        }
        catch(e) {}    // odStatus will still be 0 and show as an error below

        try {
            // set the version.
            document.getElementById('odVersion').innerHTML = (odVer == "" ? statusError : odVer);

            // show portmap agent status
            if (odStatus > 0) {
                document.getElementById("odmappedstatus").innerHTML = statusRunning;
            }
            else {
                document.getElementById("odmappedstatus").innerHTML = statusError;
            }
        }
        catch(e) {}
    }
}

// retrieve and display OD portmaps
function showODPortMapsDetails(noPortMapMessage)
{
    setElementVisible("odmappeddetailslink", false);
    setElementVisible("odportmapdetails", true);
    setElementVisible("hideodmappeddetailslink", true);

    try {
        var tmpSvcList = "";

        try {
            tmpSvcList = document.OnDemand.GetServiceList();
        }
        catch (e) {
            // this is for when BET is enabled, ActiveX is not,
            // and the OnDemand APPLET is loaded in the main workplace window...
            tmpSvcList = window.opener.document.OnDemand.GetServiceList();
        }
        if (tmpSvcList == null || typeof tmpSvcList == "undefined" || tmpSvcList == "") {
            stream = noPortMapMessage;
        }
        else {
            var svcList = tmpSvcList + "";
            svcListArr = svcList.split("]");
            var stream = "";

            var lines;

            for (i = 0; i < svcListArr.length; i++) {
                srvEleArr = svcListArr[i].split('^');
                if (i > 0) {
                    stream = stream + "<br>";
                }
                for (j = 0; j < srvEleArr.length; j++) {
                    stream = stream + srvEleArr[j] + " ";
                }
            }
        }
        document.getElementById('portmapped').innerHTML = stream;
    }
    catch(e) {
        // alert("exception in showODPortMapsDetails()" + e.message)
    }
}

// Hide OD mapped mode details
function hideODPortMapsDetails()
{
    setElementVisible("odportmapdetails", false);
    setElementVisible("hideodmappeddetailslink", false);
    setElementVisible("odmappeddetailslink", true);
}

// Show BET (EWPCA) status
function showBETStatus(statusRunning, statusStopped, statusError)
{
    var betStatus = -1;
    var betVer = "";
    var betInstalled = document.getElementById('betInstalled').value;

    if (betInstalled != 1) {   // BET is not installed
        showElementById('nobetinstalled');
    }
    else {
        showElementById("betinfo");
        try {
            betStatus = document.OnDemand.GetStatus();
            betVer = document.OnDemand.GetVersion();
        }
        catch(e) {}    // betStatus will still be -1 and show as an error below
        // try to update the version.  If we can't it's because we are either no
        // longer on the details page (betVersion is non-existent) or the OnDemand
        // object is no longer valid.  In either case, if we fail to update the version,
        // there is no sense in updating the status
        try {
            document.getElementById("betVersion").innerHTML = (betVer == "" ? statusError : betVer);
            if (betStatus > 0) {
                document.getElementById("betStatus").innerHTML = statusRunning;
            }
            else if (betStatus == 0) {
                document.getElementById("betStatus").innerHTML = statusStopped;
                setTimeout('showBETStatus("' + statusRunning + '", "' + statusStopped + '", "' + statusError + '")', 400);
            }
            else {
                document.getElementById("betStatus").innerHTML = statusError;
            }
        }
        catch(e) {}
    }
}

// get the 'ngclient' object (if present)
function getNGControl()
{
    return document.getElementById('ngclient');
}

// show OD Tunnel status
function showNGStatus( statusRunning, statusError )
{
    // Show CT version for Sinopec
    if (document.getElementById('ngjsFrame') != null &&
        typeof document.getElementById('ngjsFrame') != "undefined")
    {
        showLegacyNGStatus( statusRunning, statusError );
        return;
    }

    var ngc;
    var ngStatus = -1;
    var ngVer = "";
    var ngInstalled = document.getElementById('ngInstalled').value;

    if (ngInstalled != 1) {   // NG is not installed
        showElementById("nonginstalled");
    }
    else {
        showElementById("nginfo");
        try {
            ngc = getNGControl();
            ngc.RefreshStatistics();
            ngStatus = ngc.ConnectionStatus;
        }
        catch(e) {}    // ngStatus will still be -1 and show as an error below
        try {
            if (ngStatus > 0) {
                document.getElementById("ngstatus").innerHTML = statusRunning;
            }
            else {
                document.getElementById("ngstatus").innerHTML = statusError;
            }
            ngVer = ngc.ClientVersion;
            document.getElementById("ngversion").innerHTML = (ngVer == "" || ngVer == "INIT_FAILED" ? statusError : ngVer);
        }
        catch(e) {
            document.getElementById("ngstatus").innerHTML = statusError;
        }
    }
}

function showNGDetails()
{
    setElementVisible("ngdetails", true);
    setElementVisible("hidengdetailslink", true);
    setElementVisible("ngdetailslink", false);
    updateNGDetails();
}

// Show details for the ODT connection
function displayNGDetailInfo(statusRunning, statusError, redirMode_split, redirMode_all, redirMode_split_non_local, redirMode_all_non_local, tunnel_failed, lastIpAddr, defaultcname)
{
    try {
        var ngc = getNGControl();
        ngc.RefreshStatistics();

        var status = ngc.ConnectionStatus;
        if (status <= 0) {
            document.getElementById('ngipaddrlabel').innerHTML = lastIpAddr;
        }

        var ngver = ngc.ClientVersion;
        if (ngver != null && typeof ngver != "undefined" && ngver != "INIT_FAILED") {
            document.getElementById('ngversion').innerHTML = ngver;
        }

        var ipAddr = ngc.IpAddress;
        if (ipAddr == null || ipAddr == "" || ipAddr == "INIT_FAILED") {
            ipAddr = "0.0.0.0";
        }
        document.getElementById('ngipaddr').innerHTML = ipAddr;

        if (ngc.RedirectionMode == 1) {
            document.getElementById('ngredirmode').innerHTML = redirMode_split;
        }
        else if (ngc.RedirectionMode == 2) {
            document.getElementById('ngredirmode').innerHTML = redirMode_all;
        }
        else if (ngc.RedirectionMode == 3) {
            document.getElementById('ngredirmode').innerHTML = redirMode_split_non_local;
        }
        else if (ngc.RedirectionMode == 0) {
            document.getElementById('ngredirmode').innerHTML = redirMode_all_non_local;
        }
        else {
            document.getElementById('ngredirmode').innerHTML = tunnel_failed;
        }

        var cn = ngc.ConnectionName;
        if (!cn || cn == "INIT_FAILED") {
            cn = defaultcname;
        }
        document.getElementById('ngcxname').innerHTML = cn;
        document.getElementById('ngsessionlength').innerHTML = formatTime(ngc.SessionLength);
        document.getElementById('ngdata').innerHTML = ngc.BytesTransferred;

        if (status > 0) {
            document.getElementById("ngstatus").innerHTML = statusRunning;
        }
        else {
            var errorString = ngc.ConnectionErrorString;

            if (errorString != null && typeof errorString != "undefined" && errorString != '') {
                if (errorString == "INIT_FAILED")
                    document.getElementById("ngstatus").innerHTML = document.getElementById('initFailMsg').value;
                else
                    document.getElementById("ngstatus").innerHTML = errorString;
            }
            else {
                document.getElementById("ngstatus").innerHTML = statusError;
            }
        }
    }
    catch(e) {}
}

// Hide ng connection details
function hideNGDetails()
{
    setElementVisible("hidengdetailslink", false);
    setElementVisible("ngdetails", false);
    setElementVisible("ngdetailslink", true);
}

// format the given time in milliseconds into a HH:MM:SS string
function formatTime( timeInMillis )
{
    var hours = Math.floor(timeInMillis / ( 1000 * 60 * 60 ));
    var minutes = Math.floor(( timeInMillis - hours * 1000 * 60 * 60 ) / ( 1000 * 60 ));
    var seconds = Math.round(( timeInMillis - 1000 * 60 * ( hours * 60 + minutes ) ) / 1000);

    if (seconds == 60) {
        seconds = 0;
        minutes++;
    }
    if (minutes == 60) {
        minutes = 0;
        hours++;
    }
    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return hours + ":" + minutes + ":" + seconds;
}

//=========================================================
// Sinopec TL7 integration
//=========================================================
function showLegacyNGStatus( statusRunning, statusError )
{
    try {
        showElementById("nginfo");
        setElementVisible("ngdetailslink", false);

        var ngVersion = readCookie("ngVersion");
        if (( typeof ngVersion != "undefined" ) && ngVersion != null)
            document.getElementById("ngversion").innerHTML = ngVersion;
        else
            document.getElementById("ngversion").innerHTML = statusError;

        var ngStatus = readCookie("ngActivated");
        if (( typeof ngStatus != "undefined" ) && ngStatus != null)
            document.getElementById("ngstatus").innerHTML = statusRunning;
        else
            document.getElementById("ngstatus").innerHTML = statusError;
    }
    catch(e) {
    }
}

function showODTBootstrapVersion()
{
    try {
        showElementById("installinfo");
        document.getElementById("installerVersion").innerHTML = InstallTrigger.getVersion("ODT");
    }
    catch(e) {
    }
}
//=========================================================

// display the version of the installer (if one is installed)
function showInstallerVersion()
{
    // Show XPI version for Sinopec
    if (document.getElementById('ngjsFrame') != null &&
        typeof document.getElementById('ngjsFrame') != "undefined")
    {
        showODTBootstrapVersion();
        return;
    }

    try {
        var betInstalled = document.getElementById('betInstalled').value;
        var ngInstalled = document.getElementById('ngInstalled').value;
        var odInstalled = document.getElementById('odInstalled').value;

        // If the user skipped installation, or there was an installer error and it wasn't and agent install
        // that failed, we assume the installer didn't make it
        if (userInstallOption != "yes" || (userInstallOption == 'installerror' &&
            ((betInstalled == -1) && (ngInstalled == -1) && (odInstalled == -1)))) {
            showElementById("noinstaller");    // the installer is not installed
        }
        else {
            showElementById("installinfo");
            injectInstallerVersion();
        }
    }
    catch(e) {}
}

var versionRetry = 0;
function injectInstallerVersion()
{
    try {
        if (typeof document.EPInstaller != "undefined") {
            var installerVer = document.EPInstaller.GetVersion();
            setTimeout(function() { document.getElementById("installerVersion").innerHTML = installerVer; }, 100);
            versionRetry = 0;
        }
    }
    catch(e) {
        if (versionRetry++ <= 5) {
            setTimeout("injectInstallerVersion();", 1000);
        }
        else {
            document.getElementById("installerVersion").innerHTML = "--";
            versionRetry = 0;
        }
    }
}

// this method is called on a 30 second interval to test the status of ODT/OD/BET.
// if it comes back -2 (inactivity timeout), the session is timedout and the user is logged off.
// if it comes back -3 (session expired), the session is expired and the user has to log off.
function sessionTimedOutOrExpired()
{
    var timedout = false;
    var expired = false;

    try {
        var ngEnabled = (document.getElementById('ngEnabled').value == 'true');
        if (ngEnabled && typeof document.ngclient != "undefined") {
            var ngc = getNGControl();
            ngc.RefreshStatistics();
            if (ngc.ConnectionStatus == -2) {
                timedout = true;
            }
            else if (ngc.ConnectionStatus == -3) {
                expired = true;
            }
            setNGStatus();
        }
        else if (typeof document.OnDemand != "undefined") {
            if (document.OnDemand.GetStatus() == -2) {
                timedout = true;
            }
            setODStatus();
        }
        if (timedout) {
            removeCookie('JSESSIONID', '/workplace');
            showWarning = "false";
            document.logoffForm.submit();
        }
        else if (expired) {
            var message = document.getElementById("sessionExpiredMessage").value;
            alert(message);
        }
    }
    catch(error) {
        saveAndShowAgentError();
    }
}

function monitorCacheCleaner()
{
    try {
        if (typeof document.CacheCleanerAgent != "undefined") {
            var status = document.CacheCleanerAgent.GetStatus();
            if (status == 0) {
                var configFileUri = document.getElementById("cacheCleanerConfigFileUri").value;
                document.CacheCleanerAgent.StartAgent(configFileUri);
            }
        }
    }
    catch(error) {
    }
}

// obtain and display the connection status for NG
function setNGStatus()
{
    try {
        // this method should ONLY be called if document.ngclient is defined.  It will
        // be defined if ODT is enabled.
        var ngStatus = document.ngclient.ConnectionStatus;

        if (ngStatus <= 0) {
            saveAndShowAgentError();
        }
        else if (ngStatus == 1) {
            sendAgentStatus('ngActivated', 'true');
            saveAndShowAgentStatus(document.getElementById('ngMsg').value);
        }
    }
    catch(error) {
        saveAndShowAgentError();
    }
}

// obtain and display the connection status for OD
function setODStatus()
{
    try {
        // this method should ONLY be called if document.OnDemand is defined.  It will
        // be defined if BET or OnDemand is enabled.
        var odStatus = document.OnDemand.GetStatus();
        var odEnabled = (document.getElementById('ODEnabled').value == 'true');

        if (odStatus <= 0) {
            saveAndShowAgentError();
        }
        else if (odStatus == 1) {
            // Either BET is enabled, or OD Port-mapped (or both)
            if (odEnabled) {
                saveAndShowAgentStatus(document.getElementById('odMsg').value);
            }
            else {  // only BET is enabled
                hideElementById('sessionagenticon');
                hideProgress(); // 'web' is the default
            }
        }
    }
    catch(error) {
        saveAndShowAgentError();
    }
}

// the access agent is done loading, update the main page
function saveAndShowAgentStatus(statusMessage)
{
    // store the status in the page for later use
    document.getElementById('storedStatusMsg').value = statusMessage;
    // if the timeout beat us to it, get rid of the exclamation (bug #34614)
    hideElementById('sessionagenticon');
    // now show them.
    hideProgress();
}

// the access agent failed to load, update the main page
function saveAndShowAgentError()
{
    showElementById('sessionagenticon');
    hideProgress();
}

// open NE
function openNetworkExplorer(url)
{
    openWindowForURL(url, 'NetworkExplorer', true);
}

// writes the session time to the page
function showSessionTime()
{
    var d = new Date();

    if (d.getMinutes() < 10) {
        document.write(d.getHours() + ":0" + d.getMinutes());
    }
    else {
        document.write(d.getHours() + ":" + d.getMinutes());
    }
}

// return true if there was an agent activation problem
function hadAgentActivationErrors()
{
    var hadErrors = "false";

    // First, let's see if the user opted out of an install.  This counts as an 'error', since there
    // may be resources that aren't accessible without the agent
    if (userInstallOption != "yes") {
        hadErrors = "true";
    }
    else {
        try {
            var ngClient = getNGControl();
            var betEnabled = (document.getElementById('activateBET').value == 'true');

            if (ngClient != null && typeof ngClient != "undefined") {
                try {
                    ngClient.RefreshStatistics();
                    var ngStatus = ngClient.ConnectionStatus;

                    if (typeof ngStatus != undefined) {
                        if (ngStatus <= 0) {     // error status from NG
                            hadErrors = "true";
                        }
                        // else do nothing, if NG is running, we are sure that
                        // workplace didn't try to activate anything else.
                    }
                }
                catch(error) {
                    hadErrors = "true";
                }
            }
            else {    // if NG is not defined, then check for OD/EWPCA
                if (document.OnDemand != null && typeof document.OnDemand != "undefined") {
                    try {
                        var odStatus = document.OnDemand.GetStatus();

                        if (odStatus <= 0) {
                            hadErrors = "true";
                        }
                    }
                    catch(error) {
                        hadErrors = "true";
                    }
                }
                else {  // if BET is enabled, document.OnDemand should be non-null
                    if (betEnabled && browser == "Internet Explorer") {
                        hadErrors = "true";
                    }
                }
            }
        }
        catch(error) {      // supress any error coming here...
            // alert("exception in hadAgentActivationErrors: " + error.message);
        }
    }
    return hadErrors;
}

// return true if an item is visible
function isElementVisible(elementName)
{
    try {
        return (document.getElementById(elementName).style.visibility == "visible");
    }
    catch (ignored) {}
    return false;
}

// show or hide an element
function setElementVisible(elementName, vis)
{
    try {
        document.getElementById(elementName).style.visibility = vis ? "visible" : "hidden";
    }
    catch (ignored) {}
}

// set an element's display property
function setElementDisplay(elementName, disp)
{
    try {
        document.getElementById(elementName).style.display = disp;
    }
    catch (ignored) {}
}

// shorthand calls to show/hide methods above
function showElementById(elementName)
{
    setElementVisible(elementName, true);
}

function hideElementById(elementName)
{
    setElementVisible(elementName, false);
}

function showVisibleTabs()
{
    // If this is Default or MENU layout, do nothing
    var navigationType = document.getElementById('navigationType');
    if (typeof navigationType == "undefined" || navigationType == null || navigationType.value == 'MENU')
        return;

    // Initialize variables
    var numPages = document.getElementById('numPages').value;
    if (startPage < 1)
        startPage = 1;
    if (endPage > numPages)
        endPage = numPages;

    // Toggle 'prevPage' TAB based on startPage
    if (startPage == 1)
        hideElementById('prevPage');
    else
        showElementById('prevPage');

    // Hide all TABS
    for (var i = 1; i <= numPages; i++)
        hideElementById('page'+i);

    // Toggle 'nextPage' TAB based on endPage
    if (endPage == numPages)
        hideElementById('nextPage');
    else
        showElementById('nextPage');

    // Show visible TABS
    for (var i = startPage; i <= endPage; i++)
        showElementById('page'+i);
}

function previousPage()
{
    var numPages = document.getElementById('numPages').value;
    endPage = startPage - 1;
    startPage = startPage - maxTabs;
    if (startPage < 1) {
        startPage = 1;
    }
    showVisibleTabs();
    activatePage(endPage, numPages);
}

function nextPage()
{
    var numPages = document.getElementById('numPages').value;
    startPage = endPage + 1;
    endPage = endPage + maxTabs;
    if (endPage > numPages) {
        endPage = numPages;
    }
    showVisibleTabs();
    activatePage(startPage, numPages);
}

// user is changing pages
function activatePage(pagenumber, numpages)
{
    var navClassName = 'csstab';
    var selectedNavItem = document.getElementById("page" + pagenumber);
    if (selectedNavItem.className == 'cssmenu' || selectedNavItem.className == 'cssmenuon')
        navClassName = 'cssmenu';

    for (var i = 1; i <= numpages; i++) {
        if (i != pagenumber) {
            document.getElementById("page" + i).className = navClassName;
            setElementDisplay("page" + i + "content", "none");
        }
    }
    selectedNavItem.className = navClassName + 'on';
    setElementDisplay("page" + pagenumber + "content", "block");
    curPage = pagenumber;
}

function activateCompactPage(pagenumber, numpages)
{
    for (var i = 1; i <= numpages; i++) {
        if (i != pagenumber) {
            setElementDisplay("page" + i + "content", "none");
        }
    }
    setElementDisplay("page" + pagenumber + "content", "block");
    curPage = pagenumber;
}

// show or hide a link group
function setGroupVisibility(vis, pageNum, colNum, numCols, grpNum, grpAVId)
{
    var grouplinks = "page" + pageNum + "col" + colNum + "of" + numCols + "grp"+ grpNum+ "links";
    var hidebtnid = "page" + pageNum + "col" + colNum + "of" + numCols + "grp"+ grpNum+ "hidebtn";
    var showbtnid = "page" + pageNum + "col" + colNum + "of" + numCols + "grp"+ grpNum+ "showbtn";
    var grpStateStr = "&";

    if (vis) {
        showElementById(grouplinks);
        hideElementById(showbtnid);
        showElementById(hidebtnid);
        grpStateStr += "openGroup=" + grpAVId;
    }
    else {
        hideElementById(grouplinks);
        hideElementById(hidebtnid);
        showElementById(showbtnid);
        grpStateStr += "closeGroup=" + grpAVId;
    }
    updateUserState(grpStateStr);
}

// edit a link group
function editGroup(pageNum, colNum, numCols, grpNum)
{
    // for now, we only allow editing of personal bookmarks
    sendManageBookmarkPageRequest('', 'add');
}

function addShortcut()
{
    sendManageBookmarkPageRequest('', 'add');
}

function editShortcut(bkmrkid)
{
    sendManageBookmarkPageRequest(bkmrkid, 'edit');
}

function deleteShortcut(bkmrkid, bkmrkname, bkmrkimg)
{
    var dlgtext = document.getElementById("deletebookmarkdialog").innerHTML;
    dlgtext = dlgtext.replace("#BKMRKID#", bkmrkid);
    dlgtext = dlgtext.replace("#BKMRKNAME#", bkmrkname);
    dlgtext = dlgtext.replace("#BKMRKIMG#", bkmrkimg);

    document.getElementById("modaldialog").innerHTML = dlgtext;
    showModal("modaldialog");
}

function toggleSystemDetails(elementName, vis)
{
    var hidebtnid = elementName + "hidebtn";
    var showbtnid = elementName + "showbtn";

    if (vis) {
        hideElementById(showbtnid);
        showElementById(hidebtnid);
        showElementById(elementName);
    }
    else {
        hideElementById(hidebtnid);
        showElementById(showbtnid);
        hideElementById(elementName);
    }
}

//--------------------------------------------------------------------------------------
// drag/drop support (for dialogs)
//--------------------------------------------------------------------------------------
var dragapproved = false;
var ddz, ddx, ddy, ddstartleft, ddstarttop;

function move(e)
{
    evt = e || window.event;  // Mozilla needs e to be declared as an arg.  IE hands in null... <sigh>
    if (dragapproved) {
        ddz.style.left = parseInt(ddstartleft + evt.clientX - ddx) + 'px';
        ddz.style.top = parseInt(ddstarttop + evt.clientY - ddy) + 'px';
        return false;
    }
}

function startdrag(e)
{
    evt = e || window.event;  // Mozilla needs e to be declared as an arg.  IE hands in null... <sigh>
    ddz = document.getElementById('modaldialog');
    if (browser == "Internet Explorer") {
        dragapproved = (evt.srcElement.parentNode.className == "modaldialogclass");
        ddstartleft = ddz.style.pixelLeft;
        ddstarttop = ddz.style.pixelTop;
    }
    else if ((browser == "Netscape Navigator") || (browser == "Safari" )) {
        dragapproved = (evt.target.parentNode.className == "modaldialogclass");
    }
    if (dragapproved) {
        ddstartleft = parseInt(ddz.style.left);
        if (!ddstartleft) {
            ddstartleft = 0;
        }
        ddstarttop = parseInt(ddz.style.top);
        if (!ddstarttop) {
            ddstarttop = 0;
        }
        ddx = evt.clientX;
        ddy = evt.clientY;
        document.onmousemove = move;
    }
}

//--------------------------------------------------------------------------------------
// modal dialog support - used for Details, Install, and Edit Bookmark pages
// (graciously donated by Mike Bryant)
//--------------------------------------------------------------------------------------
// dlgid - the element id that will be made visible
// focusid - optional, the element id that will be given the input focus
function showModal(dlgid, focusid)
{
    isModalDialogOpen = true;
    setElementDisplay("modalbackground", "");
    // the next two lines resets the dialog position to its default position
    eid(dlgid).style.left = '0px';
    eid(dlgid).style.top = '0px';
    setElementDisplay(dlgid, "");
    centerModal();

    if (focusid) {
        var focus = document.getElementById(focusid);
        if (focus && !focus.disabled) {
            focus.focus();
        }
    }

    document.onmousedown = startdrag;
    document.onmouseup = new Function("dragapproved=false");
}

function hideModal(dlgid)
{
    isModalDialogOpen = false;
    setElementDisplay(dlgid, "none");
    setElementDisplay("modalbackground", "none");
    document.onmousedown = null;
}

function centerModal(width, height)
{
    if (!isModalDialogOpen) {
        return;
    }

    var scTop = parseInt(getScrollTop(), 10);
    var scLeft = parseInt(getScrollLeft(), 10);

    var gPopupMask = document.getElementById("modalbackground");
    gPopupMask.style.top = scTop + "px";
    gPopupMask.style.left = scLeft + "px";

    var fullHeight = getViewportHeight();
    var fullWidth = getViewportWidth();

    var gPopupContainer = document.getElementById("modaldialog");
    if (height == null) {
        height = gPopupContainer.offsetHeight;
    }
    if (width == null || isNaN(width)) {
        width = gPopupContainer.offsetWidth;
    }

    if (progressDialogShowing) {
        gPopupContainer.style.top = (scTop + 50) + "px";
        gPopupContainer.style.left = (scLeft + fullWidth/2) + "px";
    } else {
        var offsetHeight = (fullHeight - height) / 2;
        var offsetWidth = (fullWidth - width) / 2;

        if (offsetHeight >= 0) {
            gPopupContainer.style.top = (scTop + offsetHeight) + "px";
        }
        if (offsetWidth >= 0) {
            gPopupContainer.style.left = (scLeft + offsetWidth) + "px";
        }
    }
}
addEvent(window, "resize", centerModal);
addEvent(window, "scroll", centerModal);
window.onscroll = centerModal;

/////////////////////////////////////////////////////////////////////
// Webifier Single Sign-On Handling

var ssoURLreq;
var ssoProcessFn;

// construct an XMLHttpRequest for webifier SSO
function getXMLHttpRequest()
{
    var r = undefined;

    if (window.XMLHttpRequest) {
        try {
            r = new XMLHttpRequest();
        }
        catch (e) {}
    }
    else if (window.ActiveXObject) {
        try {
            r = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                r = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {}
        }
    }
    return r;
}

function ssoReadCreds(host, webID, client, processFn)
{
    ssoURLreq = getXMLHttpRequest();
    if (undefined == ssoURLreq) {
        processFn(undefined);
        return;
    }
    var url = getSSOURL(host, webID, client);
    ssoProcessFn = processFn;
    ssoURLreq.onreadystatechange = ssoProcessCreds;
    try {
        ssoURLreq.open("GET", url, true);
        ssoURLreq.send(null);
    }
    catch (e) {
        ssoProcessFn(undefined);
    }
}

function ssoProcessCreds()
{
    if (ssoURLreq.readyState == 4) {
        ssoProcessFn(ssoURLreq.responseText);
    }
}

function ssoGetKey(text, key)
{
    if (undefined == text || undefined == key)
        return undefined;
    var index1 = text.indexOf(key);
    if (index1 == -1) {
        return undefined;
    }
    index1 += key.length;
    var index2 = text.indexOf("\n", index1);
    if (index2 == -1) {
        index2 = text.length;
    }
    return text.substring(index1, index2);
}

function ssoGetUser(text)
{
    return ssoGetKey(text, "USERNAME=");
}

function ssoGetPassword(text)
{
    return ssoGetKey(text, "PASSWORD=");
}

function ssoGetDomain(text)
{
    return ssoGetKey(text, "DOMAIN=");
}

function getSSOURL(host, webID, client)
{
    return 'https://' + host + '/workplace/access/exec/webifiercredentials?webifierId=' + webID + '&clientType=' + client;
}

function updateBookmarkType()
{
    var bkmrkType = document.input.bookmarkType.options[ document.input.bookmarkType.selectedIndex ].value;
    var isRDP = bkmrkType == "RDP";
    var isVNC = bkmrkType == "VNC";
    var isSSH = bkmrkType == "SSH";
    var isTelnet = bkmrkType == "TELNET";
    setElementVisible( "rdpOptions", isRDP );
    setElementVisible( "vncOptions", (isVNC || isSSH || isTelnet) );
    setElementVisible( "sshOptions", isSSH );

    if (isRDP) {
        updateClientType();
    }
}

function updateClientType()
{
    var clientType = document.input.clientType.options[ document.input.clientType.selectedIndex ].value;
    var isJava = clientType == "JAVA";
    var isHTML5 = clientType == "HTML5";

    document.input.keyboard.disabled = !isHTML5;
    document.input.connectionBar.disabled = isHTML5;
    document.input.multiMonitors.disabled = isJava || isHTML5;
    document.input.enablePluginDlls.disabled = isJava || isHTML5;

    updatePluginDlls();
}

function updateScreenResolution()
{
    var custom = document.input.screenResolution.value == '-1:-1';
    var percent = document.input.screenResolution.value == '1:1';
    setElementVisible( "customScreenSize", custom );
    setElementVisible( "customScreenPercent", percent );
}

function setSsoTypeState( ssoType )
{
    if ( ssoType == "none" )
    {
        setElementVisible( "sso", document.input.enableSSO.checked );
    }
    else if ( ssoType == "forward" )
    {
        setElementVisible( "forwardSSO", true );
        setElementVisible( "staticSSO", false );
    }
    else if ( ssoType == "static" )
    {
        setElementVisible( "forwardSSO", false );
        setElementVisible( "staticSSO", true );
    }
}

function updatePluginDlls()
{
    setElementVisible( "dllList", document.input.enablePluginDlls.checked && !document.input.enablePluginDlls.disabled );
}

function updateWakeOnLan()
{
    setElementVisible( "wolMacAddress", document.input.wakeOnLan.checked );
}

//===========================================================
// This JS used to live in homeContentView.jsp - it needs documentation
//===========================================================
function aFunction() {
    var logoutRequired = document.getElementById("logoutRequired");
    if (typeof logoutRequired != "undefined" && logoutRequired != null) {
        sendMainPageRequest('&page=1');
    }
}

function injectCitrixCleanup(html)
{
    if (!document.CitrixCleanup) {
        injectHTML('citrix_fins', html);
    }
}

function injectRdpCleanup(html)
{
    if (!document.RdpCleanup) {
        injectHTML('rdp_fins', html);
    }
}

function injectVMwareCleanup(html)
{
    if (!document.VMwareCleanup) {
        injectHTML('vmware_fins', html);
    }
}

function injectQuestCleanup(html)
{
    if (!document.QuestCleanup) {
        injectHTML('quest_fins', html);
    }
}

function cleanupNAMs()
{
    try {
        if (document.CitrixCleanup) {
            document.CitrixCleanup.StopCitrix();
        }
    }
    catch (e) {}

    try {
        if (document.RdpCleanup) {
            document.RdpCleanup.StopRdp();
        }
    }
    catch (e) {}

    try {
        if (document.VMwareCleanup) {
            document.VMwareCleanup.StopVMware();
        }
    }
    catch (e) {}

    try {
        if (document.QuestCleanup) {
            document.QuestCleanup.StopQuest();
        }
    }
    catch (e) {}
}

function injectDynMapper(htm)
{
    var status = false;
    try {
        status = document.DynMap && document.DynMap.IsInitialized();
    }
    catch (e) {}
    if (!status) {
        injectHTML('dynmapper', htm);
        odDynInjected = true;
    }
}

function doDynamicPortmap(rule)
{
    if (odDynInjected) {
        odDynInjected = false;
        return 'retry';
    }
    if (!rule) {
        return undefined;
    }
    if (!document.DynMap || !document.DynMap.IsInitialized()) {
        return 'retry';
    }
    return document.DynMap.AddDynamicPortmap(rule);
}

function undoDynamicPortmap(localmap)
{
    if (document.DynMap && document.DynMap.IsInitialized()) {
        document.DynMap.RemoveDynamicPortmap(localmap);
    }
}

//===========================================================
// Global JS - this is executed upon main page load
//===========================================================
detect = navigator.userAgent.toLowerCase();
if (checkIt('konqueror')) {
    browser = "Konqueror";
    OS = "Linux";
}
else if (checkIt('safari')) browser = "Safari"
else if (checkIt('omniweb')) browser = "OmniWeb"
else if (checkIt('opera')) browser = "Opera"
else if (checkIt('webtv')) browser = "WebTV";
else if (checkIt('icab')) browser = "iCab"
else if (checkIt('msie') || checkIt('trident')) browser = "Internet Explorer"
else if (!checkIt('compatible')) {
    browser = "Netscape Navigator"
    version = detect.charAt(8);
}
else browser = "An unknown browser";

if (!version) {
    version = detect.charAt(place + thestring.length);
}

if (!OS) {
    if (checkIt('linux')) OS = "Linux";
    else if (checkIt('x11')) OS = "Unix";
    else if (checkIt('mac')) OS = "Mac"
    else if (checkIt('win')) OS = "Windows"
    else OS = "an unknown operating system";
}

function checkIt(string)
{
    place = detect.indexOf(string) + 1;
    thestring = string;
    return place;
}

function isIE7AndAbove()
{
    return (browser == "Internet Explorer");
}
