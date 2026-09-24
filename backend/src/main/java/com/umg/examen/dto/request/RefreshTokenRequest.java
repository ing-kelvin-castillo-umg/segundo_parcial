package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Solicitud para renovar el token de acceso")
public class RefreshTokenRequest {

    @NotBlank(message = "El refreshToken no puede estar vacío")
    @Schema(description = "Token de refresco válido", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    public RefreshTokenRequest() {}

    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
