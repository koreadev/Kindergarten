package com.mybiz.common.web.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;
import org.springframework.web.servlet.view.InternalResourceViewResolver;
import org.springframework.web.servlet.view.JstlView;

import com.mybiz.common.web.config.util.AcceptHeaderLocaleResolverEx;
import com.mybiz.common.web.config.util.CommonInterceptor;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = {"com.mybiz"})
public class WebMvcConfig extends WebMvcConfigurerAdapter {

	/**
	 * resources 설정
	 */
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/resources/**").addResourceLocations("/resources/");
	}

	/**
	 * <mvc:default-servlet-handler>
	 */
	@Override
	public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
		configurer.enable();
	}

	/**
	 * Negotiataion Manager
	 */
	@Override
	public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
		configurer.favorPathExtension(false).favorParameter(true).defaultContentType(MediaType.APPLICATION_JSON)
				.mediaType("xml", MediaType.APPLICATION_ATOM_XML).mediaType("json", MediaType.APPLICATION_JSON);
	}

	/**
	 *
	 */
	@Override
	public void addViewControllers(ViewControllerRegistry registry) {
		registry.addViewController("/accessDenied.htm").setViewName("error/accessDenied");
	}

	/**
	 * Interceptor Handler Added
	 */
	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		InterceptorRegistration reg = registry.addInterceptor(new CommonInterceptor());
		reg.addPathPatterns("/**");
		reg.excludePathPatterns("/login");
	}

	/**
	 * ViewResolver 설정
	 *
	 * @return
	 */
	@Bean
	public InternalResourceViewResolver internalResourceViewResolver() {
		InternalResourceViewResolver resolver = new InternalResourceViewResolver();
		resolver.setViewClass(JstlView.class);
		resolver.setPrefix("/WEB-INF/view/");
		resolver.setSuffix(".jsp");
		resolver.setOrder(1);

		return resolver;
	}

	/**
	 * MultipartResolver 설정
	 *
	 * @return
	 */
	/*
	 * @Bean public MultipartResolver multipartResolver() {
	 * CommonsMultipartResolver resolver = new CommonsMultipartResolver();
	 * resolver.setMaxInMemorySize(100000000);
	 * resolver.setMaxUploadSize(200000000);
	 *
	 * return resolver; }
	 */
	@Bean(name = "multipartResolver")
	public StandardServletMultipartResolver resolver() {
		return new StandardServletMultipartResolver();
	}

	/**
	 * <p>
	 * in18N대응을 위한 client locale확인 Class
	 * </p>
	 *
	 * @return
	 */
	@Bean(name = "localeResolver")
	public AcceptHeaderLocaleResolver getLocaleResolver() {
		return new AcceptHeaderLocaleResolverEx();
	}

	/**
	 * Message properties 설정
	 *
	 * @return
	 */
	@Bean(name = "messageSource")
	public MessageSource messageSource() {
		ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
		messageSource.setBasenames("classpath:messages/messages-properties");
		messageSource.setDefaultEncoding("UTF-8");
		messageSource.setCacheSeconds(0);

		return messageSource;
	}
}