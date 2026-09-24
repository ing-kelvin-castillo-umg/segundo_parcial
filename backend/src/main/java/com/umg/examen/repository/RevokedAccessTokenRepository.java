package com.umg.examen.repository;

import com.umg.examen.entity.RevokedAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RevokedAccessTokenRepository extends JpaRepository<RevokedAccessToken, String> {
}
