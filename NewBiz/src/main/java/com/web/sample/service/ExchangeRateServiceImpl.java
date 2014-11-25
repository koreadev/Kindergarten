package com.web.sample.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import com.web.constants.NewConstants;
import com.web.sample.domain.CurrencyDomain;


@Service
public class ExchangeRateServiceImpl {
	
	public List<CurrencyDomain> getExchangeRate() throws IOException {
		Document doc = Jsoup.connect(NewConstants.EXCHANGE_URL).get();
		 
		Elements countrys = doc.select(NewConstants.COUNTRY_ELEMENT);
		Elements currencys = doc.select(NewConstants.RATE_ELEMENT);
		
		List<CurrencyDomain> currencyList = new ArrayList<CurrencyDomain>();
		Element currency;
		int countryIdx = 0;
		int currencySize = currencys.size();
		
		CurrencyDomain domain;
		int aryIdx = 0;
		for(Element e : countrys){
			domain = new CurrencyDomain();
			domain.setCountry(e.text());
			aryIdx = 0;
		    for(int i = countryIdx ; i < (countryIdx + 7) ; i++ ) {
		    	if ( i >= currencySize ) {
		    		break;
		    	}
		    	currency = currencys.get(i);
		    	domain.getExchangeRate()[aryIdx++] = Float.parseFloat(currency.text());
		    }
		    countryIdx += 7;
		    currencyList.add(domain);
		}
		return currencyList;
	}
}
