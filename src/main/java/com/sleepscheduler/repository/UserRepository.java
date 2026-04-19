package com.sleepscheduler.repository;

import com.sleepscheduler.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}