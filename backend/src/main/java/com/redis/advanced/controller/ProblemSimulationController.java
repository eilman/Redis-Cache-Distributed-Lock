package com.redis.advanced.controller;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.ProblemSimulationService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/demo/problem")
public class ProblemSimulationController {

    private final ProblemSimulationService problemService;

    public ProblemSimulationController(ProblemSimulationService problemService) {
        this.problemService = problemService;
    }

    @PostMapping("/stampede")
    public DemoResult stampede(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.getOrDefault("productId", 1).toString());
        int concurrent = Integer.parseInt(request.getOrDefault("concurrentRequests", 10).toString());
        return problemService.simulateStampede(productId, concurrent);
    }

    @PostMapping("/stampede/mitigated")
    public DemoResult stampedeMitigated(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.getOrDefault("productId", 1).toString());
        int concurrent = Integer.parseInt(request.getOrDefault("concurrentRequests", 10).toString());
        return problemService.simulateStampedeMitigated(productId, concurrent);
    }

    @PostMapping("/penetration")
    public DemoResult penetration(@RequestBody Map<String, Object> request) {
        String key = (String) request.getOrDefault("key", "nonexistent:product:99999");
        return problemService.simulatePenetration(key);
    }

    @PostMapping("/penetration/mitigated")
    public DemoResult penetrationMitigated(@RequestBody Map<String, Object> request) {
        String key = (String) request.getOrDefault("key", "nonexistent:product:99999");
        return problemService.simulatePenetrationMitigated(key);
    }

    @PostMapping("/penetration/multi")
    public DemoResult penetrationMulti(@RequestBody Map<String, Object> request) {
        String key = (String) request.getOrDefault("key", "nonexistent:product:99999");
        int requestCount = Integer.parseInt(request.getOrDefault("requestCount", 5).toString());
        boolean useNullCaching = Boolean.parseBoolean(request.getOrDefault("useNullCaching", false).toString());
        return problemService.simulatePenetrationMulti(key, requestCount, useNullCaching);
    }

    @PostMapping("/stale-data")
    public DemoResult staleData(@RequestBody Map<String, Object> request) {
        String productName = (String) request.getOrDefault("productName", "MacBook Pro");
        double originalPrice = Double.parseDouble(request.getOrDefault("originalPrice", 74999.99).toString());
        double newPrice = Double.parseDouble(request.getOrDefault("newPrice", 64999.00).toString());
        int ttlSeconds = Integer.parseInt(request.getOrDefault("ttlSeconds", 300).toString());
        return problemService.simulateStaleData(productName, originalPrice, newPrice, ttlSeconds);
    }

    @PostMapping("/stale-data/fix")
    public DemoResult staleDataFix(@RequestBody Map<String, Object> request) {
        String productName = (String) request.getOrDefault("productName", "MacBook Pro");
        return problemService.simulateStaleDataFix(productName);
    }
}
