<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>

<h2 class="sub-header">${title}</h2>
<br />
<div class="table-responsive">
	<table class="table table-hover">
		<thead>
			<tr>
				<th>Country</th>
				<th>현금매입</th>
				<th>현금매도</th>
				<th>송금(보낼때)</th>
				<th>송금(받을때)</th>
				<th>수표팔때</th>
				<th>매매기준율</th>
				<th>미화환산율</th>
			</tr>
		</thead>
		<tbody>
			<c:forEach items="${rateList}" var="exchange">
				<tr>
					<td>${exchange.country}</td>
					<td>${exchange.buyCash}</td>
					<td>${exchange.sellCash}</td>
					<td>${exchange.remitSend}</td>
					<td>${exchange.remitReceive}</td>
					<td>${exchange.buyCheck}</td>
					<td>${exchange.saleRate}</td>
					<td>${exchange.changDollarRate}</td>
				</tr>
			</c:forEach>
		</tbody>
	</table>
</div>
