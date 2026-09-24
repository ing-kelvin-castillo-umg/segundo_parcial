package com.umg.examen.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.umg.examen.dto.response.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Responde 403 cuando el usuario está autenticado pero carece de permisos.
 * Separar este caso del 401 es indispensable para la política de refresh token:
 * el cliente solo debe intentar renovar credenciales ante un 401, nunca ante una
 * falta de privilegios.
 */
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        objectMapper.writeValue(
                response.getOutputStream(),
                ApiResponse.error("Acceso denegado: No tienes permisos suficientes para realizar esta acción.")
        );
    }
}
