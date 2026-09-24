package com.umg.examen.security;

public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException() {
        super("Refresh token inválido, expirado o revocado. Inicia sesión nuevamente.");
    }
}
