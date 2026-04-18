package com.sleepscheduler.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class SleepRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private double actualSleep;
    private double plannedSleep;

    @ManyToOne
    private User user;

    // Getters & Setters
    public Long getId() { return id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public double getActualSleep() { return actualSleep; }
    public void setActualSleep(double actualSleep) { this.actualSleep = actualSleep; }
    public double getPlannedSleep() { return plannedSleep; }
    public void setPlannedSleep(double plannedSleep) { this.plannedSleep = plannedSleep; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}