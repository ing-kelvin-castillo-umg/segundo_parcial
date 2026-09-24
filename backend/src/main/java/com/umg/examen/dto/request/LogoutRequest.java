package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Solicitud para cerrar sesion e invalidar tokens")
public class LogoutRequest {

    @Schema(description = "Refresh token activo en el navegador")
    private String refreshToken;

    public LogoutRequest() {}

    public LogoutRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
