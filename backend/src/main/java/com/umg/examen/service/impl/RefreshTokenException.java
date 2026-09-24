package com.umg.examen.service.impl;

/** El refresh token presentado no existe, está revocado o venció. */
public class RefreshTokenException extends RuntimeException {

    public RefreshTokenException(String message) {
        super(message);
    }
}
