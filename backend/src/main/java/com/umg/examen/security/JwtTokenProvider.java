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
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:120000}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms:86400000}")
    private long refreshExpirationMs;

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

    /**
     * Emite un access token de corta duración. Cada token lleva un identificador
     * único (jti) que permite revocarlo individualmente al cerrar sesión.
     */
    public String generateTokenFromUsername(String username, List<String> roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(username)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Genera un refresh token opaco (cadena aleatoria de 256 bits). Al no ser un
     * JWT, solo tiene valor contrastado contra la tabla refresh_tokens, por lo que
     * puede revocarse del lado del servidor de forma inmediata.
     */
    public String generateRefreshToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public Instant getRefreshTokenExpiration() {
        return Instant.now().plusMillis(refreshExpirationMs);
    }

    public long getJwtExpirationMs() {
        return jwtExpirationMs;
    }

    public String getUsernameFromJwt(String token) {
        return parseClaims(token).getSubject();
    }

    public String getJtiFromJwt(String token) {
        return parseClaims(token).getId();
    }

    /**
     * Lee los claims aunque el token ya esté expirado. Se usa en el cierre de
     * sesión: si el usuario estuvo inactivo, su access token pudo vencer antes de
     * que se dispare el logout y aun así hay que revocar su jti.
     */
    public Claims parseClaimsIgnoringExpiration(String token) {
        try {
            return parseClaims(token);
        } catch (ExpiredJwtException ex) {
            return ex.getClaims();
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Firma JWT inválida: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.debug("Token JWT expirado: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Token JWT no soportado: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("La cadena de claims JWT está vacía: {}", e.getMessage());
        }
        return false;
    }
}
