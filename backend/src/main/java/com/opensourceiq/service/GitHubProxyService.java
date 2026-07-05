package com.opensourceiq.service;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GitHubProxyService {

    private static final Duration CACHE_TTL = Duration.ofMinutes(5);
    private static final String GITHUB_API_BASE_URL = "https://api.github.com";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    private final Map<String, CachedResponse> cache = new ConcurrentHashMap<>();

    public ResponseEntity<String> proxy(String path, String query) {
        if (!isAllowedPath(path)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Unsupported GitHub API path.\"}");
        }

        String cacheKey = path + "?" + Optional.ofNullable(query).orElse("");
        CachedResponse cachedResponse = cache.get(cacheKey);
        if (cachedResponse != null && cachedResponse.expiresAt().isAfter(Instant.now())) {
            return toResponse(cachedResponse.statusCode(), cachedResponse.body(), cachedResponse.rateLimitReset());
        }

        try {
            URI uri = buildGitHubUri(path, query);
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(10))
                    .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                    .header("X-GitHub-Api-Version", "2022-11-28")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String rateLimitReset = response.headers().firstValue("x-ratelimit-reset").orElse("");

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                cache.put(cacheKey, new CachedResponse(
                        response.statusCode(),
                        response.body(),
                        rateLimitReset,
                        Instant.now().plus(CACHE_TTL)
                ));
            }

            return toResponse(response.statusCode(), response.body(), rateLimitReset);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Failed to fetch data from GitHub.\"}");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"GitHub request was interrupted.\"}");
        }
    }

    private boolean isAllowedPath(String path) {
        return path != null && (path.matches("^/users/[A-Za-z0-9-]+(/repos)?$")
                || path.matches("^/repos/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/(issues|pulls)$"));
    }

    private URI buildGitHubUri(String path, String query) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(GITHUB_API_BASE_URL + path);
        if (query != null && !query.isBlank()) {
            builder.query(query);
        }
        return builder.build(true).toUri();
    }

    private ResponseEntity<String> toResponse(int statusCode, String body, String rateLimitReset) {
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(statusCode)
                .contentType(MediaType.APPLICATION_JSON)
                .cacheControl(CacheControl.noStore());

        if (rateLimitReset != null && !rateLimitReset.isBlank()) {
            builder.header("X-RateLimit-Reset", rateLimitReset);
        }

        return builder.body(body);
    }

    private record CachedResponse(int statusCode, String body, String rateLimitReset, Instant expiresAt) {
    }
}
