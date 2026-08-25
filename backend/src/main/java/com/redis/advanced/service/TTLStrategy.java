package com.redis.advanced.service;

import java.util.concurrent.ThreadLocalRandom;

public class TTLStrategy {

    public enum Type { FIXED, DYNAMIC, JITTERED }

    public static long fixed(long ttlSeconds) {
        return ttlSeconds;
    }

    public static long dynamic(String category) {
        return switch (category != null ? category.toLowerCase() : "") {
            case "electronics" -> 30;
            case "books" -> 300;
            case "clothing" -> 120;
            default -> 60;
        };
    }

    public static long jittered(long baseTTLSeconds, long jitterRangeSeconds) {
        long jitter = ThreadLocalRandom.current().nextLong(0, jitterRangeSeconds + 1);
        return baseTTLSeconds + jitter;
    }

    public static long dynamicJittered(String category, long jitterRangeSeconds) {
        long base = dynamic(category);
        return jittered(base, jitterRangeSeconds);
    }
}
