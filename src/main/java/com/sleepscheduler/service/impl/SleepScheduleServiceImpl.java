package com.sleepscheduler.service.impl;

import com.sleepscheduler.dto.SleepScheduleDTO;
import com.sleepscheduler.entity.*;
import com.sleepscheduler.repository.*;
import com.sleepscheduler.service.SleepScheduleService;
import com.sleepscheduler.util.SleepCalculator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SleepScheduleServiceImpl implements SleepScheduleService {

    @Autowired
    private SleepScheduleRepository repo;

    @Autowired
    private UserRepository userRepo;

    public String createSchedule(SleepScheduleDTO dto) {
        User user = userRepo.findById(dto.userId).orElseThrow();

        SleepSchedule s = new SleepSchedule();
        s.setSleepTime(dto.sleepTime);
        s.setWakeTime(dto.wakeTime);
        double duration = SleepCalculator.calculateDuration(dto.sleepTime, dto.wakeTime);
        s.setDuration(duration);
        s.setUser(user);

        repo.save(s);

        // Update user's global sleep goal based on their schedule
        user.setSleepGoal((int) Math.round(duration));
        userRepo.save(user);

        return "Schedule Saved";
    }
}