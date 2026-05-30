package com.opensourceiq.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/dashboard")
public class DashboardController {

    @GetMapping
    public Map<String, Object> getDashboardData() {
        return Map.of(
            "stats", Map.of(
                "totalCommits", Map.of("value", "1,248", "trend", "+12.5%"),
                "pullRequests", Map.of("value", "156", "trend", "+8.2%"),
                "repositories", Map.of("value", "42", "trend", "+3"),
                "consistencyScore", Map.of("value", "94/100", "trend", "+2.1%")
            ),
            "activityData", List.of(
                Map.of("name", "Mon", "commits", 12, "prs", 2),
                Map.of("name", "Tue", "commits", 19, "prs", 3),
                Map.of("name", "Wed", "commits", 15, "prs", 1),
                Map.of("name", "Thu", "commits", 22, "prs", 4),
                Map.of("name", "Fri", "commits", 30, "prs", 5),
                Map.of("name", "Sat", "commits", 10, "prs", 0),
                Map.of("name", "Sun", "commits", 5, "prs", 0)
            )
        );
    }
}
