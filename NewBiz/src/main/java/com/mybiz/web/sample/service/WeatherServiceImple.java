package com.mybiz.web.sample.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONException;
import org.springframework.stereotype.Service;

import com.mybiz.constants.NewConstants;
import com.mybiz.web.sample.domain.WeatherDomain;

import net.aksingh.java.api.owm.CurrentWeatherData;
import net.aksingh.java.api.owm.OpenWeatherMap;
import net.aksingh.java.api.owm.Tools.Convertor;

@Service
public class WeatherServiceImple {


	public List<WeatherDomain> getWorldWeather() throws IOException, MalformedURLException, JSONException {
		List<WeatherDomain> weathers = new ArrayList<WeatherDomain>();
		OpenWeatherMap owm = new OpenWeatherMap("");
		CurrentWeatherData cwd;
		WeatherDomain domain;
		Convertor tool = new Convertor();
		for (String city : NewConstants.CITYS) {
			domain = new WeatherDomain();
			cwd = owm.currentWeatherByCityName(city);

			domain.setCity(cwd.getCityName());
			domain.setTemperature(cwd.getMainData_Object().getTemperature());
			domain.setMaxTemperature(cwd.getMainData_Object().getMaxTemperature());
			domain.setMinTemperature(cwd.getMainData_Object().getMinTemperature());
			domain.setCelsius(convertToCelsius(cwd.getMainData_Object().getTemperature()) / 100);
			domain.setMaxCelsius(convertToCelsius(cwd.getMainData_Object().getMaxTemperature()) / 100);
			domain.setMinCelsius(convertToCelsius(cwd.getMainData_Object().getMinTemperature()) / 100);
			domain.setWindDegree(tool.convertDegree2Direction(cwd.getWind_Object().getWindDegree()));

			weathers.add(domain);
		}

		return weathers;
	}

	private static float convertToCelsius(float fahrenheit) {
		return Math.round((float) ((fahrenheit - 32) / 1.8) * 100);
	}
}
