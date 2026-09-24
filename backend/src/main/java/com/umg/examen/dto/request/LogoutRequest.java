package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Petición de cierre de sesión")
public class LogoutRequest {

    @Schema(description = "Refresh token de la sesión a invalidar")
    private String refreshToken;

    @Schema(description = "Motivo del cierre de sesión", example = "inactivity", allowableValues = {"manual", "inactivity"})
    private String reason;

    public LogoutRequest() {}

    public LogoutRequest(String refreshToken, String reason) {
        this.refreshToken = refreshToken;
        this.reason = reason;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
