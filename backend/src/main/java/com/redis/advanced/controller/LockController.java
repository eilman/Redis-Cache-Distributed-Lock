package com.redis.advanced.controller;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.DistributedLockService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/lock")
public class LockController {

    private final DistributedLockService lockService;

    public LockController(DistributedLockService lockService) {
        this.lockService = lockService;
    }

    @PostMapping("/acquire")
    public DemoResult acquire(@RequestBody Map<String, Object> request) {
        String lockName = (String) request.getOrDefault("lockName", "demo-lock");
        long leaseTimeMs = Long.parseLong(request.getOrDefault("leaseTimeMs", 10000).toString());
        long waitTimeMs = Long.parseLong(request.getOrDefault("waitTimeMs", 5000).toString());
        return lockService.acquireLock(lockName, leaseTimeMs, waitTimeMs);
    }

    @PostMapping("/release")
    public DemoResult release(@RequestBody Map<String, Object> request) {
        String lockName = (String) request.getOrDefault("lockName", "demo-lock");
        return lockService.releaseLock(lockName);
    }

    @GetMapping("/{lockName}/status")
    public DemoResult status(@PathVariable String lockName) {
        return lockService.getLockStatus(lockName);
    }

    @PostMapping("/demo/scheduled-job")
    public DemoResult scheduledJob(@RequestBody Map<String, Object> request) {
        String jobName = (String) request.getOrDefault("jobName", "report-generator");
        int instanceCount = Integer.parseInt(request.getOrDefault("instanceCount", 3).toString());
        return lockService.simulateScheduledJob(jobName, instanceCount);
    }

    @PostMapping("/demo/mechanics/try-set-nx")
    public DemoResult mechanicsTrySetNx(@RequestBody Map<String, Object> request) {
        String key = (String) request.getOrDefault("key", "lock:payment:order-123");
        String uuid = (String) request.getOrDefault("uuid", java.util.UUID.randomUUID().toString().substring(0, 8));
        long pxMs = Long.parseLong(request.getOrDefault("pxMs", 10000).toString());
        return lockService.mechanicsTrySetNx(key, uuid, pxMs);
    }

    @PostMapping("/demo/mechanics/check")
    public DemoResult mechanicsCheck(@RequestBody Map<String, Object> request) {
        String key = (String) request.getOrDefault("key", "lock:payment:order-123");
        return lockService.mechanicsCheck(key);
    }

    @PostMapping("/demo/mechanics/release")
    public DemoResult mechanicsRelease(@RequestBody Map<String, Object> request) {
        String key = (String) request.getOrDefault("key", "lock:payment:order-123");
        String uuid = (String) request.getOrDefault("uuid", "");
        return lockService.mechanicsRelease(key, uuid);
    }

    @PostMapping("/demo/mechanics/race")
    public DemoResult mechanicsRace(@RequestBody Map<String, Object> request) {
        String key = (String) request.getOrDefault("key", "lock:race:order-123");
        long pxMs = Long.parseLong(request.getOrDefault("pxMs", 10000).toString());
        return lockService.mechanicsRace(key, pxMs);
    }
}
