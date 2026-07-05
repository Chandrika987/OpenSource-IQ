package com.opensourceiq.controller;

import com.opensourceiq.entity.Role;
import com.opensourceiq.entity.User;
import com.opensourceiq.repository.UserRepository;
import com.opensourceiq.security.AuthCookieService;
import com.opensourceiq.security.AuthTicketService;
import com.opensourceiq.security.JwtUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthTicketService authTicketService;

    @Autowired
    private AuthCookieService authCookieService;

    @Test
    void exchangesTicketForCookieBackedSession() throws Exception {
        User user = new User();
        user.setProvider("github");
        user.setProviderId("123");
        user.setGithubId("github:123");
        user.setUsername("octocat");
        user.setName("The Octocat");
        user.setEmail("octocat@example.com");
        user.setRole(Role.USER);
        userRepository.save(user);

        String ticket = authTicketService.createTicket(jwtUtils.generateToken(user));

        mockMvc.perform(post("/api/auth/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ticket\":\"" + ticket + "\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString(authCookieService.getCookieName())))
                .andExpect(jsonPath("$.username").value("octocat"));

        String token = jwtUtils.generateToken(user);
        mockMvc.perform(get("/api/auth/me").cookie(new Cookie(authCookieService.getCookieName(), token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("octocat"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void rejectsInvalidTicket() throws Exception {
        mockMvc.perform(post("/api/auth/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ticket\":\"missing\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(cookie().doesNotExist(authCookieService.getCookieName()));
    }
}
