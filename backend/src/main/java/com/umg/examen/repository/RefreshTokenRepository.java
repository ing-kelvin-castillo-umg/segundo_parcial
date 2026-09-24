package com.umg.examen.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.user = :user")
    void deleteByUser(@Param("user") User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.expiryDate < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("UPDATE RefreshToken r SET r.revoked = true, r.revokedAt = CURRENT_TIMESTAMP WHERE r.user = :user")
    void revokeAllUserTokens(@Param("user") User user);
}
