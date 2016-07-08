var userAgent = navigator.userAgent.toLowerCase();
var isIE = ((userAgent.indexOf('msie') != -1) || (userAgent.indexOf('trident') != -1));

var activeXEnabled = false;
var javaEnabled = false;
var semInjected = false;
var semStarted = false;

var redirectUrl = null;

// SEM status based on policy evaluation
var SEM = {
    INSTALL_PROMPT: 200,
    UPDATE_PROMPT: 201,
    INSTALL_AUTO: 202,
    UPDATE_AUTO: 203,
    INTERROGATE: 204,
    ERROR: 205
};

// EPC status for interrogation
var EPC = {
    INTRO_ERROR_FAILURE: -22,
    INST_ERROR_FAILURE: -11,
    SUCCESS: 0,
    ERROR_AUTO_LOG_UPLOAD: 1,
    ERROR_MANUAL_LOG_UPLOAD: 2
};

// Entry point function called from EW.
function semInterrogation()
{
    activeXEnabled = isActiveXEnabled();
    javaEnabled = isJavaEnabled();

    log("ActiveX Enabled=" + activeXEnabled);
    log("Java Enabled=" + javaEnabled);

    if (!(activeXEnabled || javaEnabled))
    {
        log("Both ActiveX and Java are disabled");
        document.location = g_acxjavaerror_url;
        return;
    }

    if (activeXEnabled)
    {
        if (!semInjected)
        {
            semInjected = true;
            document.getElementById("EPInterrogatorID").innerHTML = "<object id=\"EPInterrogator\" name=\"EPInterrogator\" width=\"0\" height=\"0\" classid=\"CLSID:2A1BE1E7-C550-4D67-A553-7F2D3A39233D\" viewastext> <param name=\"AuthCredential\" value=\"" + g_team_id + "\"/> </object>";
            setTimeout(semInterrogation, 1000);
            return;
        }
    }
    else if (javaEnabled)
    {
        if (!semInjected)
        {
            semInjected = true;
            document.getElementById("EPInterrogatorID").innerHTML = "<applet id=\"EPInterrogator\" name=\"EPInterrogator\" width=\"1\" height=\"1\" code=\"com.aventail.xepc.XEPCApplet\" codebase=\"" + g_postauth_alias + "\" archive=\"WebClient.jar\" mayscript=true> <param name=\"cache_archive\" value=\"WebClient.jar\"/> <param name=\"cache_version\" value=\"" + g_epi_version + "\"/> <param name=\"scriptable\" value=\"true\"/> <param name=\"codebase_lookup\" value=\"false\"/> <param name=\"permissions\" value=\"all-permissions\"/> <param name=\"DEBUG\" value=\"false\"/> <param name=\"MODE\" value=\"INTERROGATE\"/> <param name=\"EndpointAddress\" value=\"" + location.hostname + "\"/> <param name=\"AuthCredential\" value=\"" + g_team_id + "\"/> </applet>";
            setTimeout(semInterrogation, 1000);
            return;
        }

        var semClient = document.getElementById('EPInterrogator');
        if (semClient == undefined || semClient == null) {
            log("XEPC applet not initialized, waiting for user to accept Java prompts...");
            return;
        }
    }

    // Check for Update Policy ...
    var semStatus = Evaluate_SEM_Policy(g_epi_version, semThresholdVersion, semUpdateAlways, semNotifyUser);
    switch (semStatus)
    {
        case SEM.INSTALL_PROMPT:
        {
            installSemPrompt(false);
            break;
        }
        case SEM.UPDATE_PROMPT:
        {
            installSemPrompt(true);
            break;
        }
        case SEM.INSTALL_AUTO:
        case SEM.UPDATE_AUTO:
        {
            installSemNotify();
            break;
        }
        case SEM.INTERROGATE:
        {
            if (!semStarted) {
                semStarted = true;
                redirectUrl = triggerInterrogation();
            } else {
                log("EPC is in progress or already completed");
            }
            break;
        }
        default:
        {
            // Unknown error - Evaluate_SEM_Policy returned unexpected value;
            redirectUrl = g_epclogoff_url;
            break;
        }
    }

    if (redirectUrl != null) {
        document.location = redirectUrl;
    }
}

// Callback from XEPC applet Init Method.
function InterrogatorLoaded() {
    log("XEPC applet initialized, resuming interrogation...");
    setTimeout(semInterrogation, 1000);
}

function isActiveXEnabled()
{
    if (!isIE)
    {
        return false;
    }

    try {
        new ActiveXObject("Microsoft.XMLHTTP");
        return true;
    } catch (e) {
        return false;
    }
}

function isJavaEnabled()
{
    if (!navigator.javaEnabled())
    {
        return false;
    }

    if (navigator.plugins && navigator.plugins.length) {
        for (var i = 0; i < navigator.plugins.length; i++) {
            if (navigator.plugins[i].name && (navigator.plugins[i].name.toLowerCase().indexOf("java") != -1)) {
                return true;
            }
        }
    }

    // We can't detect Java plugin for IE, assume that it's installed
    return isIE;
}

function Evaluate_SEM_Policy(serverVer, thresholdVer, updateAlways, notifyUser)
{
    var status = SEM.ERROR;
    var clientVer = null;

    try {
        clientVer = document.EPInterrogator.GetVersion();
    } catch (e) {
    }

    log("Client Version=" + clientVer);
    log("Server Version=" + serverVer);
    log("Threshold Version=" + thresholdVer);
    log("Update Always=" + updateAlways);
    log("Notify User=" + notifyUser);

    if (clientVer == null || clientVer == "")
    {
        status = SEM.INSTALL_PROMPT;
    }
    else
    {
        var requiredVer = (updateAlways ? serverVer : thresholdVer);
        if (isOlderVersion(clientVer, requiredVer))
        {
            log("Client version is older than required version, proceeding with update...");
            if (notifyUser) {
                status = SEM.UPDATE_PROMPT;
            } else {
                status = SEM.UPDATE_AUTO;
            }
        }
        else // clientVer >= requiredVer
        {
            log("Client version is newer than required version, proceeding with interrogation...");
            status = SEM.INTERROGATE;
        }
    }

    log("SEM Status=" + status);
    return status;
}

function installSemPrompt(update)
{
    document.getElementById("semMessage").innerHTML = (update ? g_update_msg : g_install_msg);
    document.getElementById("semProgress").style.display = "none";
    document.getElementById("semButttons").style.display = "block";

    if (update) {
        document.getElementById("semInstallBtn").value = g_upd_btn_msg;
        document.getElementById("semInstallBtn").title = g_upd_btn_msg;
    }
}

function installSemNotify()
{
    document.getElementById("semMessage").innerHTML = g_run_msg + (activeXEnabled ? g_run_msgIE : "");
    document.getElementById("semProgress").style.display = "block";
    document.getElementById("semButttons").style.display = "none";

    if (!semStarted) {
        semStarted = true;
        pushSemInstaller();
    } else {
        log("Update is in progress or already completed");
    }
}

function logoutSem()
{
    document.location = g_epclogoff_url;
}

function triggerInterrogation()
{
    var returnUrl = null;

    document.getElementById("semMessage").innerHTML = g_eval_msg;
    document.getElementById("semProgress").style.display = "block";
    document.getElementById("semButttons").style.display = "none";

    try {
        if (document.EPInterrogator != null)
        {
            // This section of code drives the interrogation process in communication with the Logon API Server.
            var returnCode = document.EPInterrogator.DoVistaInterrogation(g_team_id, g_config, g_response);
            if (returnCode == EPC.SUCCESS)
            {
                log("EPC completed successfully, redirecting to WorkPlace...");
                returnUrl = g_installer_success_url;
            }
            else if (returnCode == EPC.INTRO_ERROR_FAILURE || returnCode == EPC.ERROR_AUTO_LOG_UPLOAD || returnCode == EPC.ERROR_MANUAL_LOG_UPLOAD)
            {
                var logfile = document.EPInterrogator.GetLogFileLocation();
                returnUrl = g_autouploadlog_url + '&logfile=' + logfile + (returnCode == EPC.INTRO_ERROR_FAILURE ? '&errorCode=1' : '');
            }
            else
            {
                returnUrl = g_epclogoff_url;
            }
        }
        else
        {
            returnUrl = g_manualuploadlog_url;
        }
    } catch (e) {
        return g_manualuploadlog_url;
    }

    return returnUrl;
}

function setEPCCookie(name, value, expire)
{
    var today = new Date();
    var expires = new Date();

    if (expire)
    {
        expires.setTime(today.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
        document.cookie = name + "=" + value + "; Expires=" + expires.toGMTString() + "; Path=/; Secure";
    }
    else
    {
        document.cookie = name + "=" + value + "; Path=/; Secure";
    }
}

function pushSemInstaller()
{
    // SET COOKIE INFO: These info are used by the native installers.
    setEPCCookie("urlConfig", g_config, false);
    setEPCCookie("responseUrl", g_response, false);
    setEPCCookie("successUrl", g_installer_success_url, false);
    setEPCCookie("failureUrl", g_manualuploadlog_url, false);
    setEPCCookie("autoUploadUrl", g_autouploadlog_url, false);
    setEPCCookie("epclogoffUrl", g_epclogoff_url, false);

    if (activeXEnabled) // IE ActiveX case
    {
        document.location = '/postauthI/SecureEndpointManager.exe';
    }
    else // Trigger installation of EPI MSI via the applet.
    {
        if (document.EPInterrogator != null)
        {
            try {
                var returnCode = document.EPInterrogator.InstallSEMComponent(document.cookie);
                if (returnCode == EPC.SUCCESS)
                {
                    log("EPC completed successfully, redirecting to WorkPlace...");
                    setEPCCookie('EPInstallerVersion', g_epi_version, true);
                    document.location = g_installer_success_url;
                }
                else
                {
                    var logfile = document.EPInterrogator.GetLogFileLocation();
                    if (returnCode == EPC.ERROR_MANUAL_LOG_UPLOAD)
                    {
                        document.location = g_manualuploadlog_url + '&logfile=' + logfile;
                    }
                    else
                    {
                        document.location = g_autouploadlog_url + '&logfile=' + logfile;
                    }
                }
            } catch (e) {
                document.location = g_acxjavaerror_url;
            }
        }
        else
        {
            document.location = g_acxjavaerror_url;
        }
    }
}

// Converts 3 or 4 digit versions to 3 digit version for comparison
function mangleVersion(ver) {
    if (ver == null) {
        return null;
    }

    ver = ver.trim();
    ver = ver.split(" ")[0];

    var segments = ver.split(/[,.]/);
    if (segments.length == 3) {
        return ver;
    }

    var nver = "";
    for (var i = 0; i < segments.length; ++i) {
        if (i != 0 && i != 2) {
            nver = nver.concat(".");
        }
        nver = nver.concat(segments[i]);
    }
    return nver;
}

function isOlderVersion(ver, reference) {
    try {
        if (ver == null || ver == "") {
            return true;
        }

        // Mangle versions to 3 digit version
        ver = mangleVersion(ver);
        reference = mangleVersion(reference);

        log("isOlderVersion() clientVer<" + ver + "> referenceVer<" + reference + ">");

        // Compare versions
        var v1parts = ver.split(/[,.]/);
        var v2parts = reference.split(/[,.]/);

        for (var i = 0; i < v1parts.length; i++) {
            if (v2parts.length == i) {
                return false;
            }
            if (v1parts[i] == v2parts[i]) {
                continue;
            } else if (v1parts[i] > v2parts[i]) {
                return false;
            } else {
                return true;
            }
        }

        if (v1parts.length != v2parts.length) {
            for (var i = v1parts.length; i < v2parts.length; i++) {
                if (v2parts[i] != 0) {
                    return true;
                }
            }
        }
    } catch (e) {
    }

    return false;
}

function log(message) {
    if (window.console) {
        console.log(message);
    }
}
