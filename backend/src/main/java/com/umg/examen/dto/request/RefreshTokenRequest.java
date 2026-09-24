package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Solicitud para refrescar el token JWT")
public class RefreshTokenRequest {

    @NotBlank(message = "El refresh token no puede estar vacío")
    @Schema(description = "Refresh Token JWT válido", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String refreshToken;

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
