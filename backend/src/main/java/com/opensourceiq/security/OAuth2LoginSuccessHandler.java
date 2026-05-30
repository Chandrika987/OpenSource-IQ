package com.opensourceiq.security;

import com.opensourceiq.entity.Role;
import com.opensourceiq.entity.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.opensourceiq.repository.UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String login = oauth2User.getAttribute("login");
        String name = oauth2User.getAttribute("name");
        String email = oauth2User.getAttribute("email");
        String avatarUrl = oauth2User.getAttribute("avatar_url");
        String githubId = String.valueOf(oauth2User.getAttribute("id"));
        
        userRepository.findByGithubId(githubId).orElseGet(() -> {
            User newUser = new User();
            newUser.setGithubId(githubId);
            newUser.setUsername(login);
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setAvatarUrl(avatarUrl);
            newUser.setRole(Role.USER);
            return userRepository.save(newUser);
        });

        String token = jwtUtils.generateTokenFromUsername(login);

        // Redirect to frontend with token
        String redirectUrl = "http://localhost:5173/oauth2/redirect?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
