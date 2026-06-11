package com.opensourceiq.repository;

import com.opensourceiq.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByGithubId(String githubId);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}
