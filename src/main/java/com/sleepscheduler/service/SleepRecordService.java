package com.sleepscheduler.service;

import com.sleepscheduler.dto.SleepRecordDTO;

public interface SleepRecordService {
    String addRecord(SleepRecordDTO dto);
}