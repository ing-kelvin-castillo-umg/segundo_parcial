package com.umg.examen.exception;

/** El refresh token es inválido, está vencido o fue revocado. Se responde con 401. */
public class InvalidRefreshTokenException extends RuntimeException {

    public InvalidRefreshTokenException() {
        super("Refresh token inválido, vencido o revocado. Inicia sesión nuevamente.");
    }
}
