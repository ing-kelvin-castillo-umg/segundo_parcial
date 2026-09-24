package com.umg.examen.repository;

import com.umg.examen.entity.RevokedAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface RevokedAccessTokenRepository extends JpaRepository<RevokedAccessToken, Long> {

    boolean existsByJti(String jti);

    @Modifying
    @Query("DELETE FROM RevokedAccessToken rat WHERE rat.expiresAt < :now")
    int deleteAllExpired(@Param("now") LocalDateTime now);
}
