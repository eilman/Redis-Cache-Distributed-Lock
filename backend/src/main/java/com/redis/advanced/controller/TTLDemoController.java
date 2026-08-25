package com.redis.advanced.controller;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.PatternDemoService;
import com.redis.advanced.service.TTLStrategy;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/demo/ttl")
public class TTLDemoController {

    private final PatternDemoService patternDemoService;
    private final StringRedisTemplate redisTemplate;

    public TTLDemoController(PatternDemoService patternDemoService, StringRedisTemplate redisTemplate) {
        this.patternDemoService = patternDemoService;
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/fixed/{productId}")
    public DemoResult fixedTTL(@PathVariable Long productId, @RequestParam(defaultValue = "60") long ttl) {
        return patternDemoService.cacheAsideWithTTL(productId, TTLStrategy.Type.FIXED, ttl, 0);
    }

    @GetMapping("/dynamic/{productId}")
    public DemoResult dynamicTTL(@PathVariable Long productId) {
        return patternDemoService.cacheAsideWithTTL(productId, TTLStrategy.Type.DYNAMIC, 0, 0);
    }

    @GetMapping("/jittered/{productId}")
    public DemoResult jitteredTTL(@PathVariable Long productId,
                                   @RequestParam(defaultValue = "60") long baseTTL,
                                   @RequestParam(defaultValue = "15") long jitterRange) {
        return patternDemoService.cacheAsideWithTTL(productId, TTLStrategy.Type.JITTERED, baseTTL, jitterRange);
    }

    @PostMapping("/batch-demo")
    public DemoResult batchTTLDemo(@RequestBody Map<String, Object> request) {
        String strategy = (String) request.getOrDefault("strategy", "FIXED");
        long baseTTL = Long.parseLong(request.getOrDefault("baseTTL", 60).toString());
        long jitterRange = Long.parseLong(request.getOrDefault("jitterRange", 15).toString());
        int keyCount = Integer.parseInt(request.getOrDefault("keyCount", 10).toString());

        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();
        List<Map<String, Object>> keys = new ArrayList<>();

        TTLStrategy.Type type = TTLStrategy.Type.valueOf(strategy.toUpperCase());

        for (int i = 1; i <= keyCount; i++) {
            long ttl = switch (type) {
                case FIXED -> TTLStrategy.fixed(baseTTL);
                case DYNAMIC -> TTLStrategy.dynamic(i % 3 == 0 ? "electronics" : i % 3 == 1 ? "books" : "clothing");
                case JITTERED -> TTLStrategy.jittered(baseTTL, jitterRange);
            };

            String key = "ttl-demo:batch:" + i;
            redisTemplate.opsForValue().set(key, "value-" + i, ttl, TimeUnit.SECONDS);

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("key", key);
            entry.put("ttlSeconds", ttl);
            entry.put("category", i % 3 == 0 ? "electronics" : i % 3 == 1 ? "books" : "clothing");
            keys.add(entry);

            result.addLog(i, "SET_KEY", key + " TTL=" + ttl + "s", System.currentTimeMillis() - start);
        }

        result.setData(Map.of("strategy", strategy, "baseTTL", baseTTL, "jitterRange", jitterRange, "keys", keys));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }
}
