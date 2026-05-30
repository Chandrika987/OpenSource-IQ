package com.opensourceiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer totalCommits;

    private Double consistencyScore;

    @Column(columnDefinition = "TEXT")
    private String topLanguagesJson;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
