package com.umg.examen.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", "Acceso denegado: Se requiere autenticación válida o token JWT no proporcionado");
        body.put("path", request.getServletPath());
        if (Boolean.TRUE.equals(request.getAttribute(JwtAuthenticationFilter.EXPIRED_ATTRIBUTE))) {
            body.put("code", "TOKEN_EXPIRED");
            body.put("message", "El token de acceso expiró; renueva la sesión con el refresh token");
        }

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
