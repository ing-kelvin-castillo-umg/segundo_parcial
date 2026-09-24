package com.umg.examen.exception;

/**
 * Se lanza cuando un refresh token no existe, está expirado o fue revocado.
 * GlobalExceptionHandler la traduce a HTTP 401.
 */
public class InvalidRefreshTokenException extends RuntimeException {

    public InvalidRefreshTokenException(String message) {
        super(message);
    }
}
