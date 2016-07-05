package com.mybiz.common.web.config.util;

import java.text.Normalizer;
import java.text.Normalizer.Form;
import java.util.regex.Pattern;

public class SafeXSSUtil {
	private static Pattern scriptPattern = Pattern.compile("script", Pattern.CASE_INSENSITIVE);
    
    /**
     * Sanitize user inputs.
     *
     * @param raw the input string to be sanitized
     * @return the sanitized string
     */
    public static String sanitize(String raw) {
        return (raw == null || raw.length() == 0) ? raw : HTMLEntityEncode(canonicalize(raw));
    }

    /**
     * Encode HTML entities.
     *
     * @param input the input string to be encoded
     * @return the encoded string
     */
    public static String HTMLEntityEncode(String input) {
        String next = scriptPattern.matcher(input).replaceAll("&#x73;cript");

        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < next.length(); ++i) {
            char ch = next.charAt(i);

            if (ch == '<') {
                sb.append("&lt;");
            } else if (ch == '>') {
                sb.append("&gt;");
            } else if(ch == '(') {
                sb.append("&#40;");
            } else if(ch == ')') {
                sb.append("&#41;");
            } else if(ch == '"') {
                sb.append("&quot;");
            } else if(ch == '&') {
                sb.append("&amp;");
            } else if(ch == '\'') {
                sb.append("&apos;");
            } else if(ch == '=') {
                sb.append("&#61;");
            } else if(ch == '?') {
                sb.append("&#63;");
            } else if(ch == '@') {
                sb.append("&#64;");
            } else if(ch == '#') {
                sb.append("&#35;");
            } else {
                sb.append(ch);
            }
        }

        return sb.toString();
    }

    /**
     * Simplify input to its simplest form to make encoding tricks more difficult.
     *
     * @param input the input string to be canonicalized
     * @return the normalized string
     */
    public static String canonicalize(String input) {
        return Normalizer.normalize(input, Form.NFD);
    }
}
