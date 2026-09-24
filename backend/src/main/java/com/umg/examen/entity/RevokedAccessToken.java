package com.umg.examen.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "revoked_access_tokens")
public class RevokedAccessToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Identificador único (claim "jti") del access token revocado. */
    @Column(nullable = false, unique = true, length = 36)
    private String jti;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Expiración original del access token; después de esta fecha el registro ya no es necesario. */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at", nullable = false, updatable = false)
    private LocalDateTime revokedAt = LocalDateTime.now();

    @Column(length = 50)
    private String reason;

    public RevokedAccessToken() {}

    public RevokedAccessToken(String jti, User user, LocalDateTime expiresAt, String reason) {
        this.jti = jti;
        this.user = user;
        this.expiresAt = expiresAt;
        this.reason = reason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJti() {
        return jti;
    }

    public void setJti(String jti) {
        this.jti = jti;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
