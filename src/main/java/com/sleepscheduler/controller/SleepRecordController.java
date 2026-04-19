package com.sleepscheduler.controller;

import com.sleepscheduler.dto.SleepRecordDTO;
import com.sleepscheduler.entity.SleepRecord;
import com.sleepscheduler.repository.SleepRecordRepository;
import com.sleepscheduler.service.SleepRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/record")
public class SleepRecordController {

    @Autowired
    private SleepRecordService service;
    
    @Autowired
    private SleepRecordRepository repo;

    @PostMapping("/add")
    public String add(@RequestBody SleepRecordDTO dto) {
        return service.addRecord(dto);
    }
    
    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getUserRecords(@PathVariable Long userId) {
        List<SleepRecord> records = repo.findByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for(SleepRecord r : records) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", r.getDate().toString());
            map.put("actualSleep", r.getActualSleep());
            result.add(map);
        }
        return result;
    }
}