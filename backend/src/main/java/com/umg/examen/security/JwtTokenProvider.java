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
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    private static final String TOKEN_USE_CLAIM = "token_use";
    private static final String ACCESS_TOKEN_USE = "access";
    private static final String REFRESH_TOKEN_USE = "refresh";
    private final Map<String, Long> revokedTokens = new ConcurrentHashMap<>();

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
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

    public String generateTokenFromUsername(String username, List<String> roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .claim(TOKEN_USE_CLAIM, ACCESS_TOKEN_USE)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpirationMs);

        return Jwts.builder()
                .subject(username)
                .claim(TOKEN_USE_CLAIM, REFRESH_TOKEN_USE)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromJwt(String token) {
        return parseClaims(token).getSubject();
    }

    public String getUsernameFromRefreshToken(String refreshToken) {
        return parseClaims(refreshToken).getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            if (isTokenRevoked(authToken)) {
                return false;
            }

            Claims claims = parseClaims(authToken);
            return ACCESS_TOKEN_USE.equals(claims.get(TOKEN_USE_CLAIM, String.class));
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Firma JWT invalida: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Token JWT expirado: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Token JWT no soportado: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("La cadena de claims JWT esta vacia: {}", e.getMessage());
        }
        return false;
    }

    public boolean validateRefreshToken(String refreshToken) {
        try {
            if (isTokenRevoked(refreshToken)) {
                return false;
            }

            Claims claims = parseClaims(refreshToken);
            return REFRESH_TOKEN_USE.equals(claims.get(TOKEN_USE_CLAIM, String.class));
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Firma JWT de refresh invalida: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Refresh token expirado: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Refresh token no soportado: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("La cadena de claims del refresh token esta vacia: {}", e.getMessage());
        }
        return false;
    }

    public void revokeToken(String token) {
        try {
            Claims claims = parseClaims(token);
            revokedTokens.put(token, claims.getExpiration().getTime());
            cleanExpiredRevocations();
        } catch (JwtException | IllegalArgumentException ignored) {
            revokedTokens.put(token, System.currentTimeMillis());
        }
    }

    private boolean isTokenRevoked(String token) {
        cleanExpiredRevocations();
        return revokedTokens.containsKey(token);
    }

    private void cleanExpiredRevocations() {
        long now = System.currentTimeMillis();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue() <= now);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
