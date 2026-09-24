package com.umg.examen.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Configuration
public class CorsConfig {

    private final List<String> allowedOrigins;

    public CorsConfig(@Value("${app.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000}") String allowedOrigins) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .map(this::normalizeOrigin)
                .distinct()
                .toList();

        if (this.allowedOrigins.isEmpty()) {
            throw new IllegalArgumentException("ALLOWED_ORIGINS debe contener al menos un origen válido");
        }
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private String normalizeOrigin(String value) {
        URI uri = URI.create(value);
        String scheme = uri.getScheme() == null ? null : uri.getScheme().toLowerCase(Locale.ROOT);
        String host = uri.getHost() == null ? null : uri.getHost().toLowerCase(Locale.ROOT);
        String path = uri.getPath();

        if (!("http".equals(scheme) || "https".equals(scheme))
                || host == null
                || uri.getUserInfo() != null
                || uri.getQuery() != null
                || uri.getFragment() != null
                || !(path == null || path.isEmpty() || "/".equals(path))) {
            throw new IllegalArgumentException("Origen no válido en ALLOWED_ORIGINS: " + value);
        }

        int port = uri.getPort();
        boolean defaultPort = ("http".equals(scheme) && port == 80) || ("https".equals(scheme) && port == 443);
        return scheme + "://" + host + (port == -1 || defaultPort ? "" : ":" + port);
    }
}
