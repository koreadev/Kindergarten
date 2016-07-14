package com.mybiz.web.sample.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
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

}
