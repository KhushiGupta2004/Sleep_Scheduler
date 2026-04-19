package com.sleepscheduler.controller;

import com.sleepscheduler.entity.*;
import com.sleepscheduler.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.time.LocalDate;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    private SleepRecordRepository recordRepo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping("/user/{id}")
    public Map<String, Object> getAnalytics(@PathVariable Long id, @RequestParam(defaultValue = "weekly") String period) {
        User user = userRepo.findById(id).orElseThrow();
        List<SleepRecord> allRecords = recordRepo.findByUserId(id);
        
        // Filter by period (daily = last 1 day, weekly = last 7 days, monthly = last 30 days, yearly = last 365)
        LocalDate cutoff = LocalDate.now();
        if ("daily".equals(period)) cutoff = cutoff.minusDays(1);
        else if ("weekly".equals(period)) cutoff = cutoff.minusDays(7);
        else if ("monthly".equals(period)) cutoff = cutoff.minusDays(30);
        else if ("yearly".equals(period)) cutoff = cutoff.minusDays(365);

        List<SleepRecord> filtered = new ArrayList<>();
        double sumActual = 0;
        for (SleepRecord r : allRecords) {
            if (!r.getDate().isBefore(cutoff)) {
                filtered.add(r);
                sumActual += r.getActualSleep();
            }
        }

        double avgSleep = filtered.isEmpty() ? 0 : sumActual / filtered.size();

        List<Map<String, Object>> history = new ArrayList<>();
        for (SleepRecord r : filtered) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", r.getDate().toString());
            entry.put("planned", r.getPlannedSleep());
            entry.put("actual", r.getActualSleep());
            history.add(entry);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("goal", user.getSleepGoal());
        response.put("averageSleep", avgSleep);
        response.put("totalLogs", filtered.size());
        response.put("history", history);

        return response;
    }
}
