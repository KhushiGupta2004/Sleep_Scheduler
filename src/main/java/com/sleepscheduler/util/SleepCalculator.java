package com.sleepscheduler.util;

import java.time.Duration;
import java.time.LocalTime;

public class SleepCalculator {

    public static double calculateDuration(LocalTime sleep, LocalTime wake) {
        return Duration.between(sleep, wake).toHours();
    }
}