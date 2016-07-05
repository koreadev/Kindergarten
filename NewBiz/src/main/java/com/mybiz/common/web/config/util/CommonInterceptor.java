package com.mybiz.common.web.config.util;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

public class CommonInterceptor implements HandlerInterceptor{
	@Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
	    boolean rtValue = true;

	    request = new CrossScriptCleanHandler(request);
	    String reqPath = request.getServletPath();
	    HttpSession session = request.getSession();


		//널이 아니면 정상적으로 컨트롤러 호출
        return rtValue;
    }

	@Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
	    String reqPath = request.getServletPath();
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception exception) throws Exception {
    }
}