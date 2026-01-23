package com.deepika.CloudShare.service;

import com.deepika.CloudShare.dto.LoginRequest;
import com.deepika.CloudShare.model.User;
import com.deepika.CloudShare.repository.UserRepository;
import com.deepika.CloudShare.security.JwtUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    // Manual constructor for Dependency Injection
    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public String registerUser(User registrationData) {
        if (userRepository.existsByEmail(registrationData.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Using the new manual constructor we added to User.java
        User user = new User(
                registrationData.getEmail(),
                passwordEncoder.encode(registrationData.getPassword()),
                registrationData.getFullName()
        );

        userRepository.save(user);
        return "User registered successfully!";
    }
    public String loginUser(LoginRequest loginRequest) {
        // 1. Find user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));

        // 2. Check password (Raw password vs Hashed password in DB)
        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            // 3. Generate and return the JWT Token
            return jwtUtils.generateToken(user.getEmail());
        } else {
            throw new RuntimeException("Error: Invalid password!");
        }
    }
}