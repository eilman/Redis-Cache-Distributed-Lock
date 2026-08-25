package com.redis.advanced.controller;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.RedlockService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/demo/redlock")
public class RedlockController {

    private final RedlockService redlockService;

    public RedlockController(RedlockService redlockService) {
        this.redlockService = redlockService;
    }

    @PostMapping("/acquire")
    public DemoResult acquire(@RequestBody Map<String, Object> request) {
        String resource = (String) request.getOrDefault("resource", "demo-resource");
        long leaseTimeMs = Long.parseLong(request.getOrDefault("leaseTimeMs", 10000).toString());
        long waitTimeMs = Long.parseLong(request.getOrDefault("waitTimeMs", 5000).toString());
        return redlockService.acquireRedlock(resource, leaseTimeMs, waitTimeMs);
    }

    @PostMapping("/release")
    public DemoResult release(@RequestBody Map<String, Object> request) {
        String resource = (String) request.getOrDefault("resource", "demo-resource");
        return redlockService.releaseRedlock(resource);
    }

    @PostMapping("/scheduled-job")
    public DemoResult scheduledJob(@RequestBody Map<String, Object> request) {
        String jobName = (String) request.getOrDefault("jobName", "report-generator");
        int instanceCount = Integer.parseInt(request.getOrDefault("instanceCount", 3).toString());
        return redlockService.simulateRedlockScheduledJob(jobName, instanceCount);
    }
}
