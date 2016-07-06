<!DOCTYPE html>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c"      uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn"     uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt"    uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn"     uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"  %>
<%@ taglib prefix="form"   uri="http://www.springframework.org/tags/form" %>

<html>
<head>
	<title>All-In-One Connection</title>
	<%@ include file="/WEB-INF/view/common/include/meta.jsp"%>
	<%@ include file="/WEB-INF/view/common/include/css.jsp"%>
	<%@ include file="/WEB-INF/view/common/include/js.jsp"%>
	<script src="${pageContext.request.contextPath}/resources/login/js/tLogin.js" type="text/javascript"></script>
</head>
<body>
	<form id="loginForm" class="login" style="background-color: #F0F0FF; border-radius:0.5em; " method="post" action="/login">
		<div class="login-screen">
			<div class="app-title">
				<h1><spring:message code="login.Login" /></h1>
			</div>

			<br/>

			<div class="login-form">
				<div class="control-group">
					<select name="useType" required>
						<option value="1">Registed PC</option>
						<option value="2">Non Registed PC</option>
					</select>
				</div>

				<div class="control-group">
					<input type="text" class="login-field" value="" placeholder="username" id="login-name" autofocus required>
					<label class="login-field-icon fui-user" for="login-name"></label>
				</div>

				<div class="control-group">
					<input type="password" class="login-field" value="" placeholder="password" id="login-pass" required>
					<label class="login-field-icon fui-lock" for="login-pass"></label>
				</div>

				<button type="submit" class="btn btn-primary btn-large btn-block">login</button>
				<a href="" title=""></a>
			</div>
		</div>
	</form>
</body>
</html>
