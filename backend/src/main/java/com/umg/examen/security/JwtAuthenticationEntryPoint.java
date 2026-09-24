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

    /** Atributo de request que JwtAuthenticationFilter llena cuando el token no es válido. */
    public static final String TOKEN_STATUS_ATTRIBUTE = "jwt.token.status";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        Object tokenStatus = request.getAttribute(TOKEN_STATUS_ATTRIBUTE);
        String code;
        String message;
        if (tokenStatus == JwtTokenProvider.TokenStatus.EXPIRED) {
            code = "TOKEN_EXPIRED";
            message = "El access token ha expirado. Usa /api/auth/refresh para obtener uno nuevo";
        } else if (tokenStatus == JwtTokenProvider.TokenStatus.REVOKED) {
            code = "TOKEN_REVOKED";
            message = "El access token fue revocado porque la sesión se cerró. Inicia sesión nuevamente";
        } else if (tokenStatus == JwtTokenProvider.TokenStatus.INVALID) {
            code = "TOKEN_INVALID";
            message = "El access token es inválido";
        } else {
            code = "UNAUTHORIZED";
            message = "Acceso denegado: Se requiere autenticación válida o token JWT no proporcionado";
        }

        final Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("code", code);
        body.put("message", message);
        body.put("path", request.getServletPath());

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
