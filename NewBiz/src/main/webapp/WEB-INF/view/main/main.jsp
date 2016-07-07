<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>

<html>
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<!-- Tell the browser to be responsive to screen width -->
	<meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">

	<title>All-In-One Connection</title>
	<%@ include file="/WEB-INF/view/common/include/css.jsp"%>
	<%@ include file="/WEB-INF/view/common/include/js.jsp"%>

	<style>
	  .cloakedAgent {
	    left: 0px;
	    top: 0px;
	    z-index: -1;
	    height: 1px;
	  }
	</style>

	<script type="text/javascript">
		var activeXObj = null;
	    var pollIntervalMS = 500;
	    var pollCount = 0;

		$(document).ready(function() {
			$("div[data-role=contents-box]").css("height", "500px");
		});

		function checkActiveX() {
			console.log("ActiveX check.");
			activeXObj = document.getElementById("ngclient");
			if (activeXObj != null) {
				activeXObj.Activate();
				checkCxProgress();
			}
		}

		function checkCxProgress() {
	        activeXObj.RefreshStatistics();
	        var ngstatus = activeXObj.ConnectionStatus;

	        console.log("cx client connect resutl = ", ngstatus);

	        pollCount++;
	        if (ngstatus == 99) {                    // connection in progress...
	            //alert('cx in progress...');
	                // if we're still not connected after 65 seconds, back off the polling to once every 2 seconds
	                // (this can happen if the user has a proxy and the proxy's auth dialog is waiting for input...)
	            if ((pollIntervalMS == 500) && (pollCount >= 130)) {
	                pollIntervalMS = 2000;  // reduce the polling frequency
	            }
	            //setTimeout(checkCxProgress, pollIntervalMS);   // try again
	        }
	        else if (ngstatus > 0) {
	            alert('cx succeeded');
	            //sendAgentStatus('ngActivated', 'true');
	            //saveAndShowAgentStatus(document.getElementById('ngMsg').value);
	        }
	        else {
	            alert('cx failed');
	            //saveAndShowAgentError();
	        }
	    }
	</script>
</head>
<body onload="checkActiveX()">
	<div class="row">
		<div class="col-xs-1 col-md-3"></div>
		<div class="col-xs-10 col-md-6 bg-white" style="border-radius:1em" data-role="contents-box">
		login success.
		</div>
		<div class="col-xs-1 col-md-3"></div>
	</div>

	<!-- <span class="cloakedAgent"> -->
		<OBJECT ID="ngclient" NAME="ngclient" WIDTH="0" HEIGHT="0" CLASSID="CLSID:14DFA1B9-4E52-4964-A34B-49D09288DB6D">
			<PARAM NAME="EndpointAddress" VALUE="210.101.65.206" />
			<PARAM NAME="AuthCredential" VALUE="Yrg36yYDhsmP0n3Sl3rHjA==" />
			<PARAM NAME="RealmName" VALUE="147" />
			<PARAM NAME="ConfigurationString" VALUE="W0luc3RhbGxTZXR0aW5nc10KVUlMZXZlbD1CQVNJQwpVSUxldmVsVXBkYXRlPUJBU0lDClByb2R1Y3RDb2RlPXtDMzM4QUNBQy03MTYyLTQyRTMtOEI4Qy04NUU1NzQ2RjRBMkV9ClBhY2thZ2VDb2RlPXs4NzIzMzc5RS03OTc2LTQ5RDctOTlEOC0yOUY0MEI5QTkwNEZ9Ckluc3RhbGxGaWxlPW5nY2xpZW50NjQubXNpCkZpbGVTaXplPTIyNTg5NDQKUHJvZHVjdFZlcnNpb249MTEuNDAuMzYzCkxhbmd1YWdlPWtvClBsYXRmb3JtPXg2NApbQ29ubmVjdG9pZCAxXQpDb25uZWN0aW9uTmFtZT0iRGVsbCBWUE4gQ29ubmVjdGlvbiIKVnBuU2VydmVyPSIyMTAuMTAxLjY1LjIwNiIKRGVza3RvcEljb249MQpSdW5BdFN0YXJ0dXA9MApDb21tdW5pdHlOYW1lPSIiClVzZXJSZWFsbT0iMi5TRkEg7J247KadIFBDIHBvcnQg7KCB7JqpIgpVc2VyQXV0aD0iYWN0aXZlRGlyZWN0b3J5QXV0aCIKQXV0aFZlcnNpb249MgpBdXRoVGl0bGU9IklEU19BVVRIRU5USUNBVElPTl9ESUFMT0dfVElUTEUifDE2Mzg0CkF1dGhNZXNzYWdlMT0iSURTX0FVVEhFTlRJQ0FUSU9OX0RJQUxPR19NRVNTQUdFInwxNjM4NApBdXRoRmllbGQxPSJJRFNfQVVUSEVOVElDQVRJT05fUFJPTVBUX1VTRVJOQU1FInw4MTkyMQpBdXRoRmllbGQyPSJJRFNfQVVUSEVOVElDQVRJT05fUFJPTVBUX1BBU1NXT1JEInwxNDc0NTgKQXV0aEJ1dHRvbnM9MzUK" />
			<PARAM NAME="BETEnabled" VALUE="0" />
		</OBJECT>
	<!-- </span> -->
</body>
</html>
