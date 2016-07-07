package com.mybiz.web.sample.controller;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class SampleController {
    private static Logger logger = LoggerFactory.getLogger(SampleController.class);

    @RequestMapping(value = "/login", method = { RequestMethod.GET })
    public String loginPage(ModelMap model, HttpServletRequest request, HttpServletResponse response) {
        logger.info("login start");

        return "login/login";
    }

    @RequestMapping(value = "/login", method = { RequestMethod.POST })
    public String login(ModelMap model, HttpServletRequest request, HttpServletResponse response) {
        logger.info("login start");

        return "main/main";
    }

    private String toString(Calendar calendar, String pattern, TimeZone zone) {
        SimpleDateFormat format = new SimpleDateFormat(pattern);
        format.setTimeZone(zone);
        return format.format(calendar.getTime());
    }
}
