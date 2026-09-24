package com.umg.examen.exception;

public class InvalidRefreshTokenException extends RuntimeException {

    public InvalidRefreshTokenException() {
        super("Refresh Token inválido, expirado o revocado");
    }
}
