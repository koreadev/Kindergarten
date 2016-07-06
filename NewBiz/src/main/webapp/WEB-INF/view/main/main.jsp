<!DOCTYPE html>

<html>
<head>
	<title>All-In-One Connection</title>
	<%@ include file="/WEB-INF/view/common/include/meta.jsp"%>
	<%@ include file="/WEB-INF/view/common/include/css.jsp"%>
	<%@ include file="/WEB-INF/view/common/include/js.jsp"%>

	<script type="text/javascript">
		$(document).ready(function() {

			$("div[data-role=contents-box]").css("height", "500px");
		});
	</script>
</head>
<body>
	<div class="row">
		<div class="col-xs-1 col-md-3"></div>
		<div class="col-xs-10 col-md-6 bg-white" style="border-radius:1em" data-role="contents-box">
		login success.
		</div>
		<div class="col-xs-1 col-md-3"></div>
	</div>
</body>
</html>
