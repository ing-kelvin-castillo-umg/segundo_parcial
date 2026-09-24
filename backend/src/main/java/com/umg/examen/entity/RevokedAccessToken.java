package com.umg.examen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "revoked_access_tokens")
public class RevokedAccessToken {

    @Id
    @Column(name = "jti", nullable = false, length = 64)
    private String jti;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at", nullable = false)
    private LocalDateTime revokedAt = LocalDateTime.now();

    public RevokedAccessToken() {}

    public RevokedAccessToken(String jti, String username, LocalDateTime expiresAt) {
        this.jti = jti;
        this.username = username;
        this.expiresAt = expiresAt;
    }
}
