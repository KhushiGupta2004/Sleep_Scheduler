package com.sleepscheduler.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
public class SleepSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalTime sleepTime;
    private LocalTime wakeTime;
    private double duration;

    @ManyToOne
    private User user;

    // Getters & Setters
    public Long getId() { return id; }
    public LocalTime getSleepTime() { return sleepTime; }
    public void setSleepTime(LocalTime sleepTime) { this.sleepTime = sleepTime; }
    public LocalTime getWakeTime() { return wakeTime; }
    public void setWakeTime(LocalTime wakeTime) { this.wakeTime = wakeTime; }
    public double getDuration() { return duration; }
    public void setDuration(double duration) { this.duration = duration; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}