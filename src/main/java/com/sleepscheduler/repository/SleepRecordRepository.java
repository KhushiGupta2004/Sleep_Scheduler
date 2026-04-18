package com.sleepscheduler.repository;

import com.sleepscheduler.entity.SleepRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SleepRecordRepository extends JpaRepository<SleepRecord, Long> {}