package com.umg.examen.service;

import com.umg.examen.entity.User;

public interface RefreshTokenService {

    /**
     * Emite un refresh token opaco para el usuario y persiste únicamente su hash.
     *
     * @return el valor en claro del token (solo se entrega una vez al cliente)
     */
    String createRefreshToken(User user);

    /**
     * Valida el refresh token contra la base de datos y lo consume (rotación: queda revocado).
     * Si el token ya había sido revocado se asume robo/reutilización y se revocan todos los tokens del usuario.
     *
     * @return el usuario dueño del token, para emitirle un nuevo par de tokens
     * @throws com.umg.examen.exception.InvalidRefreshTokenException si el token no es válido
     */
    User verifyAndConsume(String rawToken);

    long getRefreshExpirationMs();
}
