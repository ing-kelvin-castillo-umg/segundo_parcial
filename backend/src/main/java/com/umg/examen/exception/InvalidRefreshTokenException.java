package com.umg.examen.exception;

/**
 * Refresh token inexistente, expirado, revocado o reutilizado. Se traduce a HTTP 401 en GlobalExceptionHandler.
 */
public class InvalidRefreshTokenException extends RuntimeException {

    public InvalidRefreshTokenException(String message) {
        super(message);
    }
}
