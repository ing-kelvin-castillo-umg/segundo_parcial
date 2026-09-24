package com.umg.examen.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class LogoutRequest {

    @NotBlank(message = "El refresh token es obligatorio")
    private String refreshToken;

    @Pattern(regexp = "manual|inactivity|expired", message = "El motivo de cierre no es válido")
    private String reason = "manual";

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
