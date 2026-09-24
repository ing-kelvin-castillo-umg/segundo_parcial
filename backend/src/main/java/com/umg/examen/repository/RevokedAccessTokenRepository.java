package com.umg.examen.repository;

import com.umg.examen.entity.RevokedAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface RevokedAccessTokenRepository extends JpaRepository<RevokedAccessToken, Long> {
    boolean existsByTokenHash(String tokenHash);
    boolean existsByTokenHashAndExpiresAtAfter(String tokenHash, LocalDateTime now);
}
