package com.sleepscheduler.repository;

import com.sleepscheduler.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {}