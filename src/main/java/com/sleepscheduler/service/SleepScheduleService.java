package com.sleepscheduler.service;

import com.sleepscheduler.dto.SleepScheduleDTO;

public interface SleepScheduleService {
    String createSchedule(SleepScheduleDTO dto);
}