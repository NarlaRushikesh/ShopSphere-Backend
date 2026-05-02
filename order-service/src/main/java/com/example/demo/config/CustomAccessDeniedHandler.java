package com.example.demo.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        
        String jsonError = "{\n" +
                "  \"timestamp\": \"" + LocalDateTime.now() + "\",\n" +
                "  \"status\": 403,\n" +
                "  \"error\": \"Forbidden\",\n" +
                "  \"message\": \"You don't have permission to perform this action. Admin rights are required.\",\n" +
                "  \"path\": \"" + request.getRequestURI() + "\"\n" +
                "}";

        PrintWriter writer = response.getWriter();
        writer.write(jsonError);
        writer.flush();
    }
}
