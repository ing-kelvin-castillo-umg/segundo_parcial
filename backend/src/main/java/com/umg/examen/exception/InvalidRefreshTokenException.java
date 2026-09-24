package com.umg.examen.exception;

public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException() {
        super("El refresh token es inválido, expiró o fue revocado. Inicia sesión nuevamente.");
    }
}
