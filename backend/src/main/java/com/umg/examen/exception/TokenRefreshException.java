package com.umg.examen.exception;

public class TokenRefreshException extends RuntimeException {
    public TokenRefreshException(String token, String message) {
        super(String.format("Fallo para el token [%s]: %s", token, message));
    }
}