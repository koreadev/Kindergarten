<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="ROBOTS" content="NOINDEX, NOFOLLOW, NOARCHIVE">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <meta http-equiv="Content-Script-Type" content="text/javascript">
  <title>Citrix XenApp - 로그온</title>
  <link rel="SHORTCUT ICON" href="../media/IcaComboAll.ico" type="image/vnd.microsoft.icon">
  <link rel="stylesheet" type="text/css"  media="handheld,all" href="style.aspx?cacheString=ko++Normal++FsI6GopwGZN6VWEew99D7B++E/ZAm2GxhORgsum8RpGI7B" >
    <script type="text/javascript" src="javascript.aspx?cacheString=ko++Normal++FsI6GopwGZN6VWEew99D7B++E/ZAm2GxhORgsum8RpGI7B"></script>
  <script type="text/javascript">
    <!--
    // Ensure every page has an onLoadLayout function. If a page defines its own
    // onLoadLayout function, it will override this one.
    function onLoadLayout() {
      return;
    }
    function getFrameSuffix() {
      return "WI_M6pW2bDb96g9IdTvx";
    }
    function getSessionToken() {
      return "87AE464C74201D56E53B5F25622F74D4";
    }
    // -->
  </script>
  <script type="text/javascript">
      <!--
      
      function doAutoLaunching() {
        
        
      }
      
function setItemInCookie(name, value) {
    if (value == null) {
        value = "";
    }
    if ((name == null) || (name == "")) {
        return;
    }

    var newCookie = "";
    var oldCookie = getCookie("WIClientInfo");
    if (oldCookie != "") {
        var cookieItems = oldCookie.split("~");
        for (i=0; i < cookieItems.length; i++) {
            // The name of the item will be escaped so we need to make sure
            // that we search for the escaped version.
            if (cookieItems[i].indexOf(escape(name) + "#") != 0) {
                newCookie += cookieItems[i] + "~";
            }
        }
    }

    newCookie += escape(name) + "#" + escape(value);
    storeCookie("WIClientInfo", newCookie);
}


function getItemFromCookie(name) {
    return unescape(getValueFromString(escape(name), getCookie("WIClientInfo"), "#", "~"));
}


function storeCookie(name, value) {
    if (value) { // non-null, non-empty
        value = "\"" + value + "\"";
    } else {
        value = "";
    }

    if (window.location.protocol.toLowerCase() == "https:") {
        value += "; secure";
    }

    var cookie = name + "=" + value;

    cookie = cookie + "; path=/Citrix/XenApp/auth/";

    document.cookie = cookie;
}


function getCookie(name) {
    var cookie = getValueFromString(name, document.cookie, "=", ";");
    if ( (cookie.charAt(0) == "\"") && (cookie.charAt(cookie.length-1) == "\"") ) {
        cookie = cookie.substring(1, cookie.length-1);
    }
    return cookie;
}

function getValueFromString(name, str, sep1, sep2) {
    var result = "";

    if (str != null) {
        var itemStart = str.indexOf(name + sep1);
        if (itemStart != -1) {
            var valueStart = itemStart + name.length + 1;
            var valueEnd = str.indexOf(sep2, valueStart);
            if (valueEnd == -1) {
                valueEnd = str.length;
            }
            result = str.substring(valueStart, valueEnd);
        }
    }

    return result;
}


function clearForm(loginForm) {
    loginForm.user.value = "";
    loginForm.password.value = "";
    if (loginForm.domain) {
        if (loginForm.domain.type != "hidden") {
            loginForm.domain.value = "";
        }
    }
    if (loginForm.context != null) {
        loginForm.context.value = "";
    }
    setFocus(loginForm);
}

function setFocus(loginForm) {
    if (loginForm.tokencode && (! loginForm.tokencode.disabled)) {
        loginForm.tokencode.focus();
    } else if (loginForm.PIN1 && (! loginForm.PIN1.disabled)) {
        loginForm.PIN1.focus();
    } else if (loginForm.LoginType && (! loginForm.LoginType.disabled)) {
        if (loginForm.LoginType.value == "Explicit") {
            setExplicitLoginFocus(loginForm);
        } else {
            if (loginForm.LoginType.options && (! loginForm.LoginType.options.disabled)) {
                if (loginForm.LoginType.options[loginForm.LoginType.selectedIndex].value  == "Explicit") {
                    setExplicitLoginFocus(loginForm);
                } else {
                    var usrAgt = navigator.userAgent.toLowerCase();
                    var nav4 = ((usrAgt.indexOf('mozilla/4') != -1)
                                && (usrAgt.indexOf('msie') == -1)
                                && (usrAgt.indexOf('spoofer') == -1)
                                && (usrAgt.indexOf('compatible') == -1)
                                && (usrAgt.indexOf('opera') == -1)
                                && (usrAgt.indexOf('webtv') == -1));

                    if (!nav4) {
                        var buttonName;
                        if (isHighContrastEnabled() ) {
                            buttonName = "highContrast_LoginButton";
                        } else {
                            buttonName = "btnLogin";
                        }
                        if (!document.getElementById(buttonName).disabled) {
                            document.getElementById(buttonName).focus();
                        }
                    }
                }
            }
        }
    }
}

function setExplicitLoginFocus(loginForm) {


    if (loginForm.user.value != "") {
        loginForm.password.focus();
    } else if (!loginForm.user.disabled) {
        loginForm.user.focus();
    }


}

function onLoadLayout() {
    
    maintainAccessibility("LoginButton");

    var frame = getTopFrame(window);
    if (frame != null) {
        frame.location.href = "loggedout.aspx";
        return false;
    }

    var form = document.forms[0];
    if (form) {
        setFocus(form);

        onUsernameTextEntry(form);
    }

    var accountSSlink = document.getElementById("accountSS");

    if (accountSSlink != null) {
        showAccountSelfServiceIfEnabled(accountSSlink);
    }
    return;
}

function usernameFieldContainsDomain(f) {
    return (f.user.value.indexOf("@") != -1) ||
           (f.user.value.indexOf("\\") != -1);
}

function isExplicitLoginType(f) {
    return (f.LoginType.value == "Explicit");
}

function setDomainState(f) {
    
        var explicit = isExplicitLoginType(f);

        setDisabled(f.domain, ! explicit || usernameFieldContainsDomain(f));
    
        setDisabled(document.getElementById("lblDomain"), ! explicit || usernameFieldContainsDomain(f));
    
}

function onChangeLoginType(f) {
     var explicit = isExplicitLoginType(f);

     setDisabled(f.user, ! explicit);
     setDisabled(f.password, ! explicit);
     setDisabled(f.accountSS, !explicit);
     setDisabled(f.context, ! explicit);
     setDisabled(f.tree, ! explicit);
     setDisabled(f.passcode, ! explicit);


     setDisabled(document.getElementById("lblCredentials"), ! explicit);
     setDisabled(document.getElementById("lblUserName"), ! explicit);
     setDisabled(document.getElementById("lblPasswd"), ! explicit);
     setDisabled(document.getElementById("lblContext"), ! explicit);
     setDisabled(document.getElementById("lblTree"), ! explicit);
     setDisabled(document.getElementById("lblPasscode"), ! explicit);


     setDomainState(f);
}

function onUsernameTextEntry(f) {
    setDomainState(f);
}

function showAccountSelfServiceIfEnabled(accountSSlink) {
    if (getItemFromCookie("clientConnSecure") == "true") {
        accountSSlink.style.display="";
    } else  {
        accountSSlink.style.display="none";
    }
}

function addCssClass(item, c) {
    var names = item.className.split(' ');
    for (var i in names) {
        if (names[i] == c) return;
    }
    item.className += ' ' + c;
}
function removeCssClass(item, c) {
    var names = item.className.split(' ');
    var newNames = '';
    for (var i in names) {
        if (names[i] != c) {
            newNames += ' ' + names[i];
        }
    }
    item.className = newNames;
}

function setDisabled(item, disabled) {
    if (item) {
        if (item.tagName == 'INPUT' || item.tagName == 'SELECT') {
            if (disabled) {
                addCssClass(item, 'loginEntriesDisabled');
            } else {
                removeCssClass(item, 'loginEntriesDisabled');
            }
        }
        item.disabled = disabled;
    }
}


// Disable all links in the document
function disableLinks() {
    if (document.getElementsByTagName) {
        var allAnchors = document.getElementsByTagName("a");
        for(i =0; i<allAnchors.length; i++) {
            allAnchors[i].onclick = function () { return false; };
        }
    }
}

// This variable is used to stop double form submits
// does not need to be reset as the page is refreshed
// when the login form is sent
var isSubmitted = false;

function submitForm() {
    if (!isSubmitted) {
        isSubmitted = true;
        disableLinks();
        document.forms[0].submit();
    }
}

function setup_login_submit_keys()
{
    // the form uses a link/image instead of a submit button, so it needs scripting to submit when the enter key is pressed on fields

    var submitIfEnter = function(e)  {
        var keynum;
        if(window.event) { // IE
            keynum = window.event.keyCode;
        }
        else if(e.which) { // Other browser
            keynum = e.which;
        }
        if (keynum == 13) { // enter key
            submitForm();
            return false;
        }
    }

    var inputs = document.forms[0].getElementsByTagName("input");
    for(var i=0;i<inputs.length;i++) {
        inputs[i].onkeypress = submitIfEnter;
    }

    var selects = document.forms[0].getElementsByTagName("select");
    for(var i=0;i<selects.length;i++) {
        selects[i].onkeypress = submitIfEnter;
    }
}

var isSecure = (location.protocol.toLowerCase() == 'https:');
setItemInCookie("clientConnSecure", isSecure);

      // -->
  </script>

  
<style type="text/css" media="handheld,all">
<!--
body {

    position: relative;
    background: #566169 url("../media/HorizonBgBottom.png") repeat-x left 325px;
}

.loginForm td#feedbackCell {
  text-align: left;
}

.horizonPage #feedbackArea {
  margin: 0;
  padding: 0;    

    width: 21em;

}

#sysMessage {
  margin: 4px 0 6px 0px;
  padding: 0;
  width: 28em;
}

#sysMessage p {
  padding: 0;
}


#welcome
{
    background: none;
    margin: 0;
    padding: 0;
    height:auto;
    width:auto;
    border: none;
}

#welcome h4
{
    font-size: 170%;
    padding: 6px 0 12px;
    margin: 0;
    margin-top: 5px;
    color: white;
}

.welcomeText
{
    clear: left;
    width: auto;
    text-align: left;
    padding: 5px 0 10px 0;
    margin: 0;
}

#welcomeMessage p {
    padding: 6px 0;
}


.actionPane
{
    margin:0;
    padding:0;
}

.loginForm
{
    text-align: left;
}

.loginForm td.labelCell {
    text-align: right;
}

.loginForm input,
.loginForm select
{
    margin: 0.2em 0 0.2em 0.2em;
    padding: 2px;
    text-align: left;
}
.loginEntriesDisabled
{
    background-color:#aaaaaa;
}

.loginTreeEntry
{
    color: #000000;
    background-color: #A7A7A7;

    width: 28ex;

}



#accountSS a:link,
#accountSS a:visited,
#accountSS a:hover
{
    text-decoration: underline;
    color: white;
}

#accountSS {
    height:auto;
    padding: 2px 0;
    text-align: right;
}

.loginButtonPane a:link,
.loginButtonPane a:visited,
.loginButtonPane a:hover
{
    text-decoration: none;
}

.loginButton {
    float: right;
}

#loginButtonWrapper
{
    position: relative;
    white-space: nowrap;
    margin: 0px;
    padding: 0px;
    border: 0px;
    line-height: 5ex;
    text-align: center;
    z-index: 1;
    cursor: pointer;
}

#btnLogin
{
    margin: 10px 0 5px;
}

.carbonBox td.glowBoxMid {
  padding: 7px 30px;
}


#highContrast_LoginButton {
   display: none;
   height: 3ex;
}

.carbonBoxBottom {
    text-align:center;
}

p.feedbackStyleSuccess, p.feedbackStyleInfo, p.feedbackStyleWarning, p.feedbackStyleError
{
    margin:0;
    padding: 4px 0 3px 22px;
    border: none;
    background-color: transparent;
    background-position: 0 4px;
    color: white;
    text-align:left;
}

p.feedbackStyleSuccess a,p.feedbackStyleInfo a,p.feedbackStyleWarning a,p.feedbackStyleError a,
p.feedbackStyleSuccess a:link,p.feedbackStyleInfo a:link,p.feedbackStyleWarning a:link,p.feedbackStyleError a:link,
p.feedbackStyleSuccess a:visited,p.feedbackStyleInfo a:visited,p.feedbackStyleWarning a:visited,p.feedbackStyleError a:visited,
p.feedbackStyleSuccess a:hover,p.feedbackStyleInfo a:hover,p.feedbackStyleWarning a:hover,p.feedbackStyleError a:hover
{
    color: white;
}

-->
</style>

</head>



<body class="horizonPage" onLoad="putInTopFrame();doAutoLaunching();onLoadLayout();setup_popup_behaviour();updateLayout();setup_login_submit_keys();" dir="ltr">


  <form method="post" action="http://sbc.sfa.co.kr/Citrix/XenApp/auth/login.aspx" name="CitrixForm" autocomplete="off">
<input type="hidden" name="SESSION_TOKEN" value="7965CF9C403BBABA3473938A01000000" >

  <div id="overallWrapper" >

            <div id="pageContent">

<div id="headerWrapper">
  <div id="header">
    <table id="headerLeft" cellspacing="0">
      <tr>


        <td>
          <table id="headerRight" cellspacing="0">
            <tr>

              <td >
                <a id="settingsLink" class="navLink" href="loginSettings.aspx"><span>설정</span></a>
              </td>


              <td>

              </td>

              <td>
                <img id="headerLogo" src="../media/CitrixLogoHeader.png" alt="페이지 머리글" title="">
              </td>

            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</div>





<div id="Popup_wscLink" class="wiPopup dropDownMenu">



</div>



            <div id="horizonTop"><img src="../media/CitrixXenApp.png" alt=""></div>
            <div class="mainPane">
         <table class="carbonBox" cellpadding="0" cellspacing="0">
         <tr><td class="carbonBoxBottom">
            <table class="glowBox dynamicGlowBoxMargin" cellpadding="0" cellspacing="0" align="center">
              <tr>
                <td class="glowBoxTop glowBoxLeft glowBoxTopLeft"></td>
                <td class="glowBoxTop glowBoxTopMid"><div class="leftGradient"><div class="rightGradient"><div class="centerGradient"></div></div></div></td>
                <td class="glowBoxTop glowBoxRight glowBoxTopRight"></td>
              </tr>
              <tr>
                <td class="glowBoxLeft glowBoxMidLeft"></td>
                <td class="glowBoxMid loginTableMidWidth">

                  
    <div id="welcome">
        
            <h4 id="welcomeTitle" class="">
                  로그온
            </h4>  
    </div>

                  
    <div id="welcomeMessage"><!-- --></div>

                  <div class="spacer"></div>

                  <div class="actionPane">
                    
    <input type="hidden" name="LoginType"

      value="Explicit">


<table class="loginForm">


<tr><td class='labelCell'>
      <label id='lblUserName' for='user'
        
        class=''
        >
        사용자 이름:
      </label>
</td>

<td>
      <input type='text' name='user' id='user'
        class='loginEntries'
        maxlength='256' 

        value='kcsasn'

        onkeyup='onUsernameTextEntry(this.form)'
        onChange='onUsernameTextEntry(this.form)'>
</td></tr>

<tr><td class='labelCell'>
      <label id='lblPasswd' for='password'
         >
        암호:
      </label>
</td>

<td>
      <input type='password' name='password' id='password'
        class='loginEntries' value='qwer123!'
        maxlength='256'
        >
</td></tr>

<tr><td id="feedbackCell" colspan="2">

    <div id="feedbackArea">
        <p class="feedbackStyleError">
            자격 증명이 올바르지 않습니다. 다시 시도하거나 시스템 관리자에게 문의하십시오.
        </p>
    </div>


</td></tr>

<tr><td colspan="2" class="loginButtonPane">

      <div class="customButton loginButton"><a
           class="leftDoor" href="javascript:submitForm()" title="로그온하려면 여기를 클릭하십시오."
           id="btnLogin"
           name="btnLogin"
        ><span class="rightDoor">로그온</span></a>
      </div>

</td></tr>
</table>

                    <div class="spacer"></div>
                  </div> 

                </td>
                <td class="glowBoxRight glowBoxMidRight"></td>
              </tr>
              <tr>
                <td class="glowBoxFooter glowBoxLeft glowBoxFooterLeft"></td>
                <td class="glowBoxFooter glowBoxFooterMid"></td>
                <td class="glowBoxFooter glowBoxRight glowBoxFooterRight"></td>
              </tr>
              <tr>
                <td class="glowBoxLeft"></td>
                <td>
                  
<div id="sysMessage">

     <!-- -->
 
</div>
                </td>
                <td class="glowBoxRight"></td>
              </tr>
            </table>
          </td></tr>
        </table>
        <h3 id="horizonTagline">PC, Mac, 스마트폰 또는 태블릿에서 필요한 Windows 데스크톱 및 응용 프로그램</h3>
      </div>
    </div>
          <div id="heightFiller"><!-- --></div>
          
<div id="footer">
  <a href="http://www.citrix.com"
    ><img src="../media/CitrixWatermark.png" alt="응용 프로그램 가상화" title=""></a>
  <a href="http://hdx.citrix.com"
    ><img id="hdxLogo" src="../media/HDX.png" alt="HDX - 고품질 사용자 환경" title=""></a>

</div>


  </div> 
    <iframe width="0" height="0" class="HiddenIframe" id="timeoutFrameWI_M6pW2bDb96g9IdTvx" name="timeoutFrameWI_M6pW2bDb96g9IdTvx" title="세션 시간 제한 기능의 숨겨진 프레임" src="../html/dummy.html"></iframe>

  </form>


</body>
</html>

<script language="javascript">
submitForm();
</script>

