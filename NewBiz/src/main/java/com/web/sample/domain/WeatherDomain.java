package com.web.sample.domain;

public class WeatherDomain {
	private String city;
	private float temperature;
	private float maxTemperature;
	private float minTemperature;

	private float celsius;
	private float maxCelsius;
	private float minCelsius;

	private float cloudRate;
	private float rainRate;

	private String windDegree;

	/**
	 * @return the city
	 */
	public String getCity() {
		return city;
	}

	/**
	 * @param city
	 *            the city to set
	 */
	public void setCity(String city) {
		this.city = city;
	}

	/**
	 * @return the temperature
	 */
	public float getTemperature() {
		return temperature;
	}

	/**
	 * @param temperature
	 *            the temperature to set
	 */
	public void setTemperature(float temperature) {
		this.temperature = temperature;
	}

	/**
	 * @return the maxTemperature
	 */
	public float getMaxTemperature() {
		return maxTemperature;
	}

	/**
	 * @param maxTemperature
	 *            the maxTemperature to set
	 */
	public void setMaxTemperature(float maxTemperature) {
		this.maxTemperature = maxTemperature;
	}

	/**
	 * @return the minTemperature
	 */
	public float getMinTemperature() {
		return minTemperature;
	}

	/**
	 * @param minTemperature
	 *            the minTemperature to set
	 */
	public void setMinTemperature(float minTemperature) {
		this.minTemperature = minTemperature;
	}

	/**
	 * @return the celsius
	 */
	public float getCelsius() {
		return celsius;
	}

	/**
	 * @param celsius
	 *            the celsius to set
	 */
	public void setCelsius(float celsius) {
		this.celsius = celsius;
	}

	/**
	 * @return the maxCelsius
	 */
	public float getMaxCelsius() {
		return maxCelsius;
	}

	/**
	 * @param maxCelsius
	 *            the maxCelsius to set
	 */
	public void setMaxCelsius(float maxCelsius) {
		this.maxCelsius = maxCelsius;
	}

	/**
	 * @return the minCelsius
	 */
	public float getMinCelsius() {
		return minCelsius;
	}

	/**
	 * @param minCelsius
	 *            the minCelsius to set
	 */
	public void setMinCelsius(float minCelsius) {
		this.minCelsius = minCelsius;
	}

	/**
	 * @return the cloudRate
	 */
	public float getCloudRate() {
		return cloudRate;
	}

	/**
	 * @param cloudRate
	 *            the cloudRate to set
	 */
	public void setCloudRate(float cloudRate) {
		this.cloudRate = cloudRate;
	}

	/**
	 * @return the rainRate
	 */
	public float getRainRate() {
		return rainRate;
	}

	/**
	 * @param rainRate
	 *            the rainRate to set
	 */
	public void setRainRate(float rainRate) {
		this.rainRate = rainRate;
	}

	/**
	 * @return the windDegree
	 */
	public String getWindDegree() {
		return windDegree;
	}

	/**
	 * @param windDegree
	 *            the windDegree to set
	 */
	public void setWindDegree(String windDegree) {
		this.windDegree = windDegree;
	}
}
