package com.sleepscheduler.service;

import com.sleepscheduler.dto.UserDTO;

public interface UserService {
    UserDTO register(UserDTO dto);
}