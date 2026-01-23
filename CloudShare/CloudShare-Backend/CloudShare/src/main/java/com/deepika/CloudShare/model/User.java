package com.deepika.CloudShare.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String fullName;

    // Default Constructor (Required by JPA)
    public User() {}

    // Manual Constructor (Replaces .builder())
    public User(String email, String password, String fullName) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
    }

    // Manual Getters (Fixes "cannot find symbol")
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getFullName() { return fullName; }

    // Manual Setters
    public void setPassword(String password) { this.password = password; }
}