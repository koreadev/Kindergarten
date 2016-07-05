package com.mybiz.web.sample.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.mybiz.constants.NewConstants;
import com.mybiz.web.sample.service.ExchangeRateServiceImpl;
import com.mybiz.web.sample.service.WeatherServiceImple;

@Controller
public class SampleController {
	private static Logger logger = LoggerFactory.getLogger(SampleController.class);

	@Autowired
	private WeatherServiceImple weatherService;

	@Autowired
	private ExchangeRateServiceImpl exchangeRateService;

	@RequestMapping("/showMessage")
	public String showMessage(HttpServletRequest request, HttpServletResponse response) {
		if (logger.isDebugEnabled()) {
			logger.debug("call [showMessage]");
		}
		return "showMessage";
	}

	@RequestMapping("/worldWeather")
	public String worlWeather(ModelMap model, HttpServletRequest request, HttpServletResponse response) throws MalformedURLException, IOException, JSONException {
		model.addAttribute("title", "세계 날씨 정보");
		model.addAttribute("weatherList", weatherService.getWorldWeather());
		return "sample/worldWeather";
	}

	@RequestMapping("/exchangeRate")
	public String exchangeRate(ModelMap model, HttpServletRequest request, HttpServletResponse response) {
		model.addAttribute("title", "외화환율");
		try {
			model.addAttribute("rateList", exchangeRateService.getExchangeRate());
		} catch (IOException e) {
			e.printStackTrace();
		}
		return "sample/exchangeRate";
	}

	@RequestMapping("/worldTime")
	public @ResponseBody String worldTime(ModelMap model, HttpServletRequest request, HttpServletResponse response) {
		StringBuffer wt = new StringBuffer();

		TimeZone tz;
		Calendar calendar;
		wt.append("<h2 class=\"sub-header\">World Time</h2>");
		for(String timeZone : NewConstants.TIME_ZONES) {
			tz = TimeZone.getTimeZone(timeZone);
			calendar = Calendar.getInstance(tz);
			String pattern = "yyyy-MM-dd HH:mm:ss";
			wt.append(timeZone);
			wt.append(" : ");
			wt.append(toString(calendar, pattern, tz));
			wt.append("<br/>");
		}

		return wt.toString();
	}

	 private String toString(Calendar calendar, String pattern, TimeZone zone) {
	        SimpleDateFormat format = new SimpleDateFormat(pattern);
	        format.setTimeZone(zone);
	        return format.format(calendar.getTime());
	    }
}
