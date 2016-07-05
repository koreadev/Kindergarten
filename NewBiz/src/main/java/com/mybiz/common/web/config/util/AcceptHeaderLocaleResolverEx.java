/**
 * <pre>
 * COPYRIGHT (C) 1999-2015 PoiznKorea CO., LTD. ALL RIGHTS RESERVED
 * Project         : NewCIDOGrin
 * File Name	   : com.poizn.cido.ctr.util / AcceptHeaderLocaleResolverEx.java
 * Create Date     : 2016. 1. 6.
 * Initial Creator : PoiznKorea
 * Change History
 * -------------------------------------------------------------------------------------
 * Date    : 2016. 1. 6.
 * Author  : hojong.seo
 * Version : 1.0   First release.
 * -------------------------------------------------------------------------------------
 * Description
 *
 * -------------------------------------------------------------------------------------
 * </pre>
 */
package com.mybiz.common.web.config.util;

import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

/**
 * <p></p>
 * @author hojong.seo
 *
 */
public class AcceptHeaderLocaleResolverEx extends AcceptHeaderLocaleResolver {
    private static Logger logger = LoggerFactory.getLogger(AcceptHeaderLocaleResolverEx.class);

    @Override
    public Locale resolveLocale(HttpServletRequest request) {
        HttpSession session = request.getSession();
        Locale locale = (Locale)session.getAttribute("useLocale");

        if (locale == null) {
            locale = Locale.ENGLISH;
        }

        if (logger.isDebugEnabled()) {
            logger.debug("Use Locale is " + request.getLocale().toString() + " Database Setting Locale is " + locale.toString());
        }
        return locale;
    }
}
