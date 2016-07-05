package com.mybiz.common.web.config.util;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CrossScriptCleanHandler extends HttpServletRequestWrapper {
    private static final Logger logger = LoggerFactory.getLogger(CrossScriptCleanHandler.class);
    private Map<String, String[]> sanitized;
    private Map<String, String[]> original;

    /**
     * Constructor that will parse and sanitize all input parameters.
     *
     * @param request
     *            the HttpServletRequest to wrap
     */
    @SuppressWarnings("unchecked")
    public CrossScriptCleanHandler(HttpServletRequest request) {
        super(request);

        original = request.getParameterMap();
        sanitized = getParameterMap();
    }

    /**
     * {@inheritDoc} Return getParameter(String name) on the wrapped request
     * object.
     */
    @Override
    public String getParameter(String name) {
        String[] vals = getParameterMap().get(name);

        return (vals != null && vals.length > 0) ? vals[0] : null;
    }

    /**
     * {@inheritDoc} Sanitize and return getParameterMap() on the wrapped
     * request object.
     */
    @Override
    public Map<String, String[]> getParameterMap() {
        if (sanitized == null) {
            sanitized = sanitizeParamMap(original);
        }

        return sanitized;
    }

    /**
     * {@inheritDoc} Return getParameterValues(String name) on the wrapped
     * request object.
     */
    @Override
    public String[] getParameterValues(String name) {
        return getParameterMap().get(name);
    }

    /**
     * <pre>
     * Request Parameter에 대하여 XSS 위험이 되는 요소에 대한 Clear 작업을 수행
     * </pre>
     *
     * @param raw
     * @return
     */
    private Map<String, String[]> sanitizeParamMap(Map<String, String[]> raw) {
        Map<String, String[]> res = new HashMap<String, String[]>();

        if (raw != null) {
            String[] rawVals;
            String[] snzVals;

            for (String key : raw.keySet()) {
                rawVals = raw.get(key);
                snzVals = new String[rawVals.length];
                for (int i = 0; i < rawVals.length; i++) {
                    snzVals[i] = SafeXSSUtil.sanitize(rawVals[i]);
                }
                res.put(key, snzVals);
            }
        }

        return res;
    }
}
