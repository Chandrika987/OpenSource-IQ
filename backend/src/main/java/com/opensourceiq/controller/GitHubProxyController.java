package com.opensourceiq.controller;

import com.opensourceiq.service.GitHubProxyService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/github")
public class GitHubProxyController {

    private final GitHubProxyService gitHubProxyService;

    public GitHubProxyController(GitHubProxyService gitHubProxyService) {
        this.gitHubProxyService = gitHubProxyService;
    }

    @RequestMapping("/**")
    public ResponseEntity<String> proxy(HttpServletRequest request) {
        String path = request.getRequestURI().substring("/api/github".length());
        return gitHubProxyService.proxy(path, request.getQueryString());
    }
}
