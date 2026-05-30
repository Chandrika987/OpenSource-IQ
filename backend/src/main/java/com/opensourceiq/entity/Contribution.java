package com.opensourceiq.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "contributions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repository_id", nullable = false)
    private Repository repository;

    private Integer commitCount;

    private Integer prCount;

    private Integer issueCount;

    private LocalDateTime lastContributionDate;
}
