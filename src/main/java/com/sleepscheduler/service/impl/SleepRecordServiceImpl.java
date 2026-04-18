package com.sleepscheduler.service.impl;

import com.sleepscheduler.dto.SleepRecordDTO;
import com.sleepscheduler.entity.*;
import com.sleepscheduler.repository.*;
import com.sleepscheduler.service.SleepRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SleepRecordServiceImpl implements SleepRecordService {

    @Autowired
    private SleepRecordRepository repo;

    @Autowired
    private UserRepository userRepo;

    public String addRecord(SleepRecordDTO dto) {
        User user = userRepo.findById(dto.userId).orElseThrow();

        SleepRecord r = new SleepRecord();
        r.setDate(dto.date);
        r.setActualSleep(dto.actualSleep);
        r.setPlannedSleep(user.getSleepGoal());
        r.setUser(user);

        repo.save(r);
        return "Record Added";
    }
}