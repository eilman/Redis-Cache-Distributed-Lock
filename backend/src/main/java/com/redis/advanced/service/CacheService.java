package com.redis.advanced.service;

import com.redis.advanced.model.DemoResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class CacheService {

    private static final Logger log = LoggerFactory.getLogger(CacheService.class);
    private final StringRedisTemplate redisTemplate;

    public CacheService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public DemoResult getKeys(String pattern) {
        long start = System.currentTimeMillis();
        Set<String> keys = redisTemplate.keys(pattern == null ? "*" : pattern);
        long duration = System.currentTimeMillis() - start;

        DemoResult result = DemoResult.ok(keys);
        result.getMetadata().setExecutionTimeMs(duration);
        result.getMetadata().setSource("REDIS");
        result.addLog(1, "SCAN_KEYS", "Found " + (keys != null ? keys.size() : 0) + " keys", duration);
        return result;
    }

    public DemoResult getValue(String key) {
        long start = System.currentTimeMillis();
        String value = redisTemplate.opsForValue().get(key);
        long duration = System.currentTimeMillis() - start;

        DemoResult result = DemoResult.ok(value);
        result.getMetadata().setExecutionTimeMs(duration);
        result.getMetadata().setSource(value != null ? "CACHE" : "MISS");
        result.addLog(1, "GET", value != null ? "HIT" : "MISS", duration);
        return result;
    }

    public DemoResult setValue(String key, String value, Long ttlSeconds) {
        long start = System.currentTimeMillis();
        if (ttlSeconds != null && ttlSeconds > 0) {
            redisTemplate.opsForValue().set(key, value, ttlSeconds, TimeUnit.SECONDS);
        } else {
            redisTemplate.opsForValue().set(key, value);
        }
        long duration = System.currentTimeMillis() - start;

        DemoResult result = DemoResult.ok(Map.of("key", key, "ttl", ttlSeconds != null ? ttlSeconds : -1));
        result.getMetadata().setExecutionTimeMs(duration);
        result.getMetadata().setSource("REDIS");
        result.addLog(1, "SET", "OK", duration);
        return result;
    }

    public DemoResult deleteKey(String key) {
        long start = System.currentTimeMillis();
        Boolean deleted = redisTemplate.delete(key);
        long duration = System.currentTimeMillis() - start;

        DemoResult result = DemoResult.ok(Map.of("deleted", Boolean.TRUE.equals(deleted)));
        result.getMetadata().setExecutionTimeMs(duration);
        result.addLog(1, "DEL", Boolean.TRUE.equals(deleted) ? "DELETED" : "NOT_FOUND", duration);
        return result;
    }

    public DemoResult getInfo() {
        long start = System.currentTimeMillis();
        Properties info = redisTemplate.getConnectionFactory().getConnection().serverCommands().info();
        long duration = System.currentTimeMillis() - start;

        Map<String, String> infoMap = new LinkedHashMap<>();
        if (info != null) {
            info.forEach((k, v) -> infoMap.put(k.toString(), v.toString()));
        }

        DemoResult result = DemoResult.ok(infoMap);
        result.getMetadata().setExecutionTimeMs(duration);
        result.getMetadata().setSource("REDIS");
        return result;
    }
}
