package com.sleepscheduler.service.impl;

import com.sleepscheduler.dto.UserDTO;
import com.sleepscheduler.entity.User;
import com.sleepscheduler.repository.UserRepository;
import com.sleepscheduler.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public UserDTO register(UserDTO dto) {

        String email = dto.email.trim().toLowerCase();

        // 🔴 FIX: Proper duplicate check
        if (repo.existsByEmailIgnoreCase(email)) {
            throw new RuntimeException("EMAIL_EXISTS");
        }

        User user = new User();
        user.setName(dto.name);
        user.setEmail(email);
        user.setPassword(dto.password);
        user.setSleepGoal(dto.sleepGoal);

        repo.save(user);
        dto.id = user.getId();

        return dto;
    }

    @Override
    public UserDTO login(UserDTO dto) {

        User user = repo.findByEmailIgnoreCase(dto.email.trim().toLowerCase());

        if (user == null || !user.getPassword().equals(dto.password)) {
            throw new RuntimeException("INVALID_CREDENTIALS");
        }

        UserDTO resp = new UserDTO();
        resp.id = user.getId();
        resp.email = user.getEmail();
        resp.name = user.getName();
        resp.sleepGoal = user.getSleepGoal();

        return resp;
    }

    @Override
    public boolean resetPassword(UserDTO dto) {
        User user = repo.findByEmailIgnoreCase(dto.email.trim().toLowerCase());
        if (user == null) {
            throw new RuntimeException("USER_NOT_FOUND");
        }
        user.setPassword(dto.password);
        repo.save(user);

        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom("kg9547124@gmail.com");
            email.setTo(user.getEmail());
            email.setSubject("Password Changed for-DreamSync");
            email.setText("Hello " + user.getName() + ",\n\nYour DreamSync password has been successfully updated.\n\nBest regards,\nDreamSync Team");
            mailSender.send(email);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Email sending failed: " + e.getMessage());
        }

        return true;
    }
}