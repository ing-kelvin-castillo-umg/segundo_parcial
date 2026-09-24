package com.umg.examen.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    /** Resultado de validar un access token. */
    public enum TokenStatus {
        VALID,
        EXPIRED,
        INVALID
    }

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-expiration-ms:20000}")
    private long accessExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return generateTokenFromUsername(userPrincipal.getUsername(), roles);
    }

    public String generateTokenFromUsername(String username, List<String> roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessExpirationMs);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(username)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public long getAccessExpirationMs() {
        return accessExpirationMs;
    }

    public String getUsernameFromJwt(String token) {
        return parseClaims(token).getSubject();
    }

    public String getJtiFromJwt(String token) {
        return parseClaims(token).getId();
    }

    public Date getExpirationFromJwt(String token) {
        return parseClaims(token).getExpiration();
    }

    public boolean validateToken(String authToken) {
        return getTokenStatus(authToken) == TokenStatus.VALID;
    }

    public TokenStatus getTokenStatus(String authToken) {
        try {
            parseClaims(authToken);
            return TokenStatus.VALID;
        } catch (ExpiredJwtException e) {
            log.info("Access token expirado para usuario={}", e.getClaims().getSubject());
            return TokenStatus.EXPIRED;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Firma JWT inválida: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Token JWT no soportado: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("La cadena de claims JWT está vacía: {}", e.getMessage());
        } catch (JwtException e) {
            log.error("Token JWT inválido: {}", e.getMessage());
        }
        return TokenStatus.INVALID;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
