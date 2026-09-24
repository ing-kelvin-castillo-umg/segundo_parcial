package com.umg.examen.exception;

public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException() {
        super("Refresh token inválido, vencido o revocado.");
    }
}
