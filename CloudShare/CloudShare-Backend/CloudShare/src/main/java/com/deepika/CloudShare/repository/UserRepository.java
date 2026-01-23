package com.deepika.CloudShare.repository;

import com.deepika.CloudShare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // This allows us to find a user by email during the login process
    Optional<User> findByEmail(String email);

    // Check if an email is already taken during registration
    Boolean existsByEmail(String email);
}