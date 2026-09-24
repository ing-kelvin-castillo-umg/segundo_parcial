package com.umg.examen.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalGatewayFilter extends OncePerRequestFilter {

    @Value("${app.bff.secret}")
    private String bffSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Allow Swagger UI and API Docs to be accessed directly during development
        if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.startsWith("/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Verify the Secret Token from Next.js BFF
        String providedSecret = request.getHeader("X-BFF-Secret");

        if (providedSecret == null || !providedSecret.equals(bffSecret)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized access. Requests must originate from the BFF.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
