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
public class HttpClientSampleController {
    private static Logger logger = LoggerFactory.getLogger(HttpClientSampleController.class);

    @RequestMapping(value="/citrixLogin")
    public String postSubmit(HttpServletRequest request) {
        try {
            CloseableHttpClient httpclient = HttpClients.createDefault();
            HttpPost httpPost = new HttpPost("http://sbc.sfa.co.kr/Citrix/XenApp/auth/login.aspx");
            //전달하고자 하는 PARAMETER를 List객체에 담는다
            List <NameValuePair> nvps = new ArrayList <NameValuePair>();
            nvps.add(new BasicNameValuePair("SESSION_TOKEN", request.getParameter("SESSION_TOKEN")));
            nvps.add(new BasicNameValuePair("user", request.getParameter("user")));
            nvps.add(new BasicNameValuePair("password", request.getParameter("password")));
            nvps.add(new BasicNameValuePair("LoginType", request.getParameter("LoginType")));
            //UTF-8은 한글 
            httpPost.setEntity(new UrlEncodedFormEntity(nvps,"UTF-8"));
            CloseableHttpResponse response = httpclient.execute(httpPost);
            try {
                System.out.println(response.getStatusLine());
                //API서버로부터 받은 JSON 문자열 데이터
                System.out.println(EntityUtils.toString(response.getEntity()));
                HttpEntity entity = response.getEntity();
                EntityUtils.consume(entity);
            } finally {
                response.close();
            }   
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "redirect:" + "http://sbc.sfa.co.kr/Citrix/XenApp/site/default.aspx";
    }
    
  //Get Submit
    @RequestMapping(value="/getSubmit")
    public void getSubmit(HttpServletRequest request) {
        System.out.println("FIRST");
        first();
        System.out.println("SECOND");
        second();
        System.out.println("THIRD");
        third();
        System.out.println("4번째");
        forth();
    }
    
    private void first() {
        try {
            CloseableHttpClient httpclient = HttpClients.createDefault();
            //GET 방식으로 parameter를 전달
            HttpGet httpGet = new HttpGet("http://sbc.sfa.co.kr/Citrix/XenApp");
            CloseableHttpResponse response = httpclient.execute(httpGet);
            try {
                System.out.println(EntityUtils.toString(response.getEntity()));
                HttpEntity entity = response.getEntity();
                EntityUtils.consume(entity);
            } finally {
                response.close();
            }   
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private void second() {
        try {
            CloseableHttpClient httpclient = HttpClients.createDefault();
            //GET 방식으로 parameter를 전달
            HttpGet httpGet = new HttpGet("http://sbc.sfa.co.kr/Citrix/XenApp/compactLoading.htm");
            CloseableHttpResponse response = httpclient.execute(httpGet);
            try {
                System.out.println(EntityUtils.toString(response.getEntity()));
                HttpEntity entity = response.getEntity();
                EntityUtils.consume(entity);
            } finally {
                response.close();
            }   
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private void third() {
        try {
            CloseableHttpClient httpclient = HttpClients.createDefault();
            //GET 방식으로 parameter를 전달
            HttpGet httpGet = new HttpGet("http://sbc.sfa.co.kr/Citrix/XenApp/auth/silentDetection.aspx");
            CloseableHttpResponse response = httpclient.execute(httpGet);
            try {
                System.out.println(EntityUtils.toString(response.getEntity()));
                HttpEntity entity = response.getEntity();
                EntityUtils.consume(entity);
            } finally {
                response.close();
            }   
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private void forth() {
        try {
            CloseableHttpClient httpclient = HttpClients.createDefault();
            //GET 방식으로 parameter를 전달
            HttpGet httpGet = new HttpGet("http://sbc.sfa.co.kr/Citrix/XenApp/auth/login.aspx");
            CloseableHttpResponse response = httpclient.execute(httpGet);
            try {
                System.out.println(EntityUtils.toString(response.getEntity()));
                HttpEntity entity = response.getEntity();
                EntityUtils.consume(entity);
            } finally {
                response.close();
            }   
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
