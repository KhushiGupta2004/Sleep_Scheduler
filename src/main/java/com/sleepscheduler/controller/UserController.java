package com.sleepscheduler.controller;

import com.sleepscheduler.dto.UserDTO;
import com.sleepscheduler.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping("/register")
    public UserDTO register(@RequestBody UserDTO dto) {
        return service.register(dto);
    }
}