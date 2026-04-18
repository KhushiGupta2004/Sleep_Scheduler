package com.sleepscheduler.service.impl;

import com.sleepscheduler.dto.UserDTO;
import com.sleepscheduler.entity.User;
import com.sleepscheduler.repository.UserRepository;
import com.sleepscheduler.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository repo;

    public UserDTO register(UserDTO dto) {
        User u = new User();
        u.setName(dto.name);
        u.setEmail(dto.email);
        u.setPassword(dto.password);
        u.setSleepGoal(dto.sleepGoal);

        repo.save(u);
        return dto;
    }
}