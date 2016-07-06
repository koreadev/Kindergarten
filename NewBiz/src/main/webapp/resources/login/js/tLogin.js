function formSubmit() {
	console.log("submit");
	var loginFormObj = document.getElementById("loginForm");
	if (loginFormObj != null) {
		loginFormObj.submit();
	}
}