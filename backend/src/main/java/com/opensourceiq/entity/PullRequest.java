package com.opensourceiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "pull_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PullRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String githubPrId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repository_id", nullable = false)
    private Repository repository;

    private String title;

    @Enumerated(EnumType.STRING)
    private PRStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime mergedAt;
}

enum PRStatus {
    OPEN, MERGED, CLOSED
}
