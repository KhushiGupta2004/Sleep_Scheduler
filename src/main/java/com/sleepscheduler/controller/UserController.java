package com.sleepscheduler.controller;

import com.sleepscheduler.dto.UserDTO;
import com.sleepscheduler.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO dto) {
        try {
            return ResponseEntity.ok(service.register(dto));
        } catch (RuntimeException e) {

            if (e.getMessage().equals("EMAIL_EXISTS")) {
                return ResponseEntity.status(409).body("Email already exists!");
            }

            return ResponseEntity.badRequest().body("Registration failed");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO dto) {
        try {
            return ResponseEntity.ok(service.login(dto));
        } catch (RuntimeException e) {

            if (e.getMessage().equals("INVALID_CREDENTIALS")) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            return ResponseEntity.badRequest().body("Login failed");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody UserDTO dto) {
        try {
            service.resetPassword(dto);
            return ResponseEntity.ok("Password reset successfully");
        } catch (RuntimeException e) {
            if (e.getMessage().equals("USER_NOT_FOUND")) {
                return ResponseEntity.status(404).body("No account found with that email");
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}