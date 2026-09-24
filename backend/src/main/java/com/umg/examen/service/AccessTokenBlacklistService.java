package com.umg.examen.service;

import com.umg.examen.entity.User;

import java.time.LocalDateTime;

/** Lista negra persistente de access tokens (por jti) invalidados antes de expirar. */
public interface AccessTokenBlacklistService {

    /** Revoca el access token identificado por su jti hasta su expiración original. */
    void revoke(String jti, User user, LocalDateTime expiresAt, String reason);

    boolean isRevoked(String jti);

    /** Elimina los registros cuyo access token ya expiró de forma natural. */
    int purgeExpired();
}
