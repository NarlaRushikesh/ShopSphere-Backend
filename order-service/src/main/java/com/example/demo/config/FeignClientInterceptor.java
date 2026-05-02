package com.example.demo.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Forwards the incoming user's Bearer JWT token onto outgoing Feign calls
 * (e.g. order-service → catalog-service).
 * Without this, inter-service Feign calls arrive at the catalog with no
 * Authorization header. The catalog's JwtFilter skips auth silently, but
 * any @PreAuthorize endpoints would 403. More importantly it makes the
 * architecture consistent and future-proof.
 */
@Configuration
public class FeignClientInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                template.header("Authorization", authHeader);
            }
        }
    }
}
