package com.sleepscheduler.controller;

import com.sleepscheduler.dto.SleepRecordDTO;
import com.sleepscheduler.service.SleepRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/record")
public class SleepRecordController {

    @Autowired
    private SleepRecordService service;

    @PostMapping("/add")
    public String add(@RequestBody SleepRecordDTO dto) {
        return service.addRecord(dto);
    }
}