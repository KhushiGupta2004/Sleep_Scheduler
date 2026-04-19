package com.sleepscheduler.repository;

import com.sleepscheduler.entity.SleepRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SleepRecordRepository extends JpaRepository<SleepRecord, Long> {
    List<SleepRecord> findByUserId(Long userId);
}