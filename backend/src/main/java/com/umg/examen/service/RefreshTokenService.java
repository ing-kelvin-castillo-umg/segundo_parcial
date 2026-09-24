package com.umg.examen.service;

import com.umg.examen.entity.User;

public interface RefreshTokenService {

    /** Inicia una nueva sesión (familia) y emite su primer refresh token. */
    IssuedRefreshToken issue(User user);

    /**
     * Valida el token presentado, lo invalida (rotación) y emite uno nuevo de la misma sesión.
     *
     * @throws com.umg.examen.exception.InvalidRefreshTokenException si es inválido, vencido o revocado
     */
    IssuedRefreshToken rotate(String rawToken);

    /** Revoca toda la sesión a la que pertenece el token. Es idempotente. */
    void revoke(String rawToken);
}
