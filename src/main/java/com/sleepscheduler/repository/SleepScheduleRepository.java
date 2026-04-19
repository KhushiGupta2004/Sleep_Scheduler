package com.sleepscheduler.repository;

import com.sleepscheduler.entity.SleepSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SleepScheduleRepository extends JpaRepository<SleepSchedule, Long> {}