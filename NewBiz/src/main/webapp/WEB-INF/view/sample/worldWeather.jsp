<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>

	<h2 class="sub-header">${title}</h2>
	<div class="table-responsive">
       <table class="table table-hover">
         <thead>
           <tr>
             <th>CITY</th>
             <th>Temperature</th>
             <th>Today Max Temperature</th>
             <th>Today Min Temperature</th>
             <th>Wind Degree</th>
           </tr>
         </thead>
         <tbody>
			<c:forEach items="${weatherList}" var="weather">
			<tr>
			 <td>${weather.city}</td>
			 <td>${weather.celsius}'C</td>
			 <td>${weather.maxCelsius}'C</td>
			 <td>${weather.minCelsius}'C</td>
			 <td>${weather.windDegree}</td>
		    </tr>
			</c:forEach>
		</tbody>
        </table>