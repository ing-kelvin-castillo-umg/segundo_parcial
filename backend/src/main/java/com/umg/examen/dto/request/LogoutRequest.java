package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Solicitud de cierre de sesión")
public class LogoutRequest {

    @Schema(description = "Refresh token de la sesión que se desea invalidar")
    private String refreshToken;

    @Schema(description = "Motivo del cierre de sesión", example = "inactivity")
    private String reason;

    public LogoutRequest() {}

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
