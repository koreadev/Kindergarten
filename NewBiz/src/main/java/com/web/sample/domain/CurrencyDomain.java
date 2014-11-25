package com.web.sample.domain;

public class CurrencyDomain {
	private String country;
	private float buyCash;
	private float sellCash;
	private float remitSend;
	private float remitReceive;
	private float buyCheck;
	private float saleRate;
	private float changDollarRate;

	private Float[] exchangeRate;
	
	/**
	 * @return the country
	 */
	public String getCountry() {
		return country.replaceAll(" ", "");
	}

	/**
	 * @param country
	 *            the country to set
	 */
	public void setCountry(String country) {
		this.country = country;
	}

	/**
	 * @return the buyCash
	 */
	public float getBuyCash() {
		if (buyCash == 0) {
			buyCash = getExchangeRate()[0];
		}
		return buyCash;
	}

	/**
	 * @param buyCash
	 *            the buyCash to set
	 */
	public void setBuyCash(float buyCash) {
		this.buyCash = buyCash;
	}

	/**
	 * @return the sellCash
	 */
	public float getSellCash() {
		if (sellCash == 0) {
			sellCash = getExchangeRate()[1];
		}
		return sellCash;
	}

	/**
	 * @param sellCash
	 *            the sellCash to set
	 */
	public void setSellCash(float sellCash) {
		this.sellCash = sellCash;
	}

	/**
	 * @return the remitSend
	 */
	public float getRemitSend() {
		if (remitSend == 0) {
			remitSend = getExchangeRate()[2];
		}
		return remitSend;
	}

	/**
	 * @param remitSend
	 *            the remitSend to set
	 */
	public void setRemitSend(float remitSend) {
		this.remitSend = remitSend;
	}

	/**
	 * @return the remitReceive
	 */
	public float getRemitReceive() {
		if (remitReceive == 0) {
			remitReceive = getExchangeRate()[3];
		}
		return remitReceive;
	}

	/**
	 * @param remitReceive
	 *            the remitReceive to set
	 */
	public void setRemitReceive(float remitReceive) {
		this.remitReceive = remitReceive;
	}

	/**
	 * @return the buyCheck
	 */
	public float getBuyCheck() {
		if (buyCheck == 0) {
			buyCheck = getExchangeRate()[4];
		}
		return buyCheck;
	}

	/**
	 * @param buyCheck
	 *            the buyCheck to set
	 */
	public void setBuyCheck(float buyCheck) {
		this.buyCheck = buyCheck;
	}

	/**
	 * @return the saleRate
	 */
	public float getSaleRate() {
		if (saleRate == 0) {
			saleRate = getExchangeRate()[5];
		}
		return saleRate;
	}

	/**
	 * @param saleRate
	 *            the saleRate to set
	 */
	public void setSaleRate(float saleRate) {
		this.saleRate = saleRate;
	}

	/**
	 * @return the changDollarRate
	 */
	public float getChangDollarRate() {
		if (changDollarRate == 0) {
			changDollarRate = getExchangeRate()[6];
		}
		return changDollarRate;
	}

	/**
	 * @param changDollarRate
	 *            the changDollarRate to set
	 */
	public void setChangDollarRate(float changDollarRate) {
		this.changDollarRate = changDollarRate;
	}

	/**
	 * @return the exchangeRate
	 */
	public Float[] getExchangeRate() {
		if(exchangeRate == null) {
			exchangeRate = new Float[7];
		}
		return exchangeRate;
	}

	/**
	 * @param exchangeRate the exchangeRate to set
	 */
	public void setExchangeRate(Float[] exchangeRate) {
		this.exchangeRate = exchangeRate;
	}
}
