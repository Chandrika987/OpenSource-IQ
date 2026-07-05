package com.opensourceiq.security;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Component
public class StartupSecurityValidator {

    private static final String DEVELOPMENT_JWT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    private final Environment environment;

    @Value("${jwt.secret}")
    private String jwtSecret;

    public StartupSecurityValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validateSecrets() {
        if (jwtSecret == null || jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes.");
        }

        boolean prodProfile = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (prodProfile && DEVELOPMENT_JWT_SECRET.equals(jwtSecret)) {
            throw new IllegalStateException("Production must not use the development JWT secret.");
        }
    }
}
