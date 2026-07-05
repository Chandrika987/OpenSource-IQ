package com.opensourceiq.controller;

import com.opensourceiq.entity.User;
import com.opensourceiq.repository.UserRepository;
import com.opensourceiq.security.AuthCookieService;
import com.opensourceiq.security.AuthTicketService;
import com.opensourceiq.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthTicketService authTicketService;

    @Autowired
    private AuthCookieService authCookieService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/session")
    public ResponseEntity<?> exchangeTicket(@RequestBody SessionExchangeRequest request, HttpServletResponse response) {
        return authTicketService.consumeTicket(request.ticket())
                .filter(jwtUtils::validateJwtToken)
                .map(token -> {
                    authCookieService.addAuthCookie(response, token);
                    Long userId = jwtUtils.getUserIdFromJwtToken(token);
                    return userRepository.findById(userId)
                            .map(this::toResponse)
                            .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid authentication ticket")));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid or expired authentication ticket")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(this::toResponse)
                .orElseGet(() -> ResponseEntity.ok(Map.of(
                        "username", username,
                        "avatarUrl", "",
                        "name", username
                )));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        authCookieService.clearAuthCookie(response);
        return ResponseEntity.ok(Map.of("status", "signed_out"));
    }

    private ResponseEntity<Map<String, Object>> toResponse(User user) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", user.getId());
        body.put("username", user.getUsername());
        body.put("name", user.getName() != null ? user.getName() : user.getUsername());
        body.put("email", user.getEmail() != null ? user.getEmail() : "");
        body.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
        body.put("role", user.getRole() != null ? user.getRole().name() : "USER");
        return ResponseEntity.ok(body);
    }

    public record SessionExchangeRequest(String ticket) {
    }
}
