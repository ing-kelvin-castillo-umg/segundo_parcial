package com.umg.examen.repository;

import com.umg.examen.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByRefreshTokenHashAndRevokedAtIsNull(String refreshTokenHash);
}