package com.sleepscheduler.controller;

import com.sleepscheduler.dto.SleepScheduleDTO;
import com.sleepscheduler.service.SleepScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/schedule")
public class SleepScheduleController {

    @Autowired
    private SleepScheduleService service;

    @PostMapping("/create")
    public String create(@RequestBody SleepScheduleDTO dto) {
        return service.createSchedule(dto);
    }
}