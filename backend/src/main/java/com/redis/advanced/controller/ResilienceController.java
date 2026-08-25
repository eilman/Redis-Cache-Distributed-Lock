package com.redis.advanced.controller;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.ResilientCacheService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/demo/resilience")
public class ResilienceController {

    private final ResilientCacheService resilientCacheService;

    public ResilienceController(ResilientCacheService resilientCacheService) {
        this.resilientCacheService = resilientCacheService;
    }

    @GetMapping("/fail-open/{productId}")
    public DemoResult failOpen(@PathVariable Long productId) {
        return resilientCacheService.getWithFailOpen(productId);
    }

    @GetMapping("/fail-close/{productId}")
    public DemoResult failClose(@PathVariable Long productId) {
        return resilientCacheService.getWithFailClose(productId);
    }

    @GetMapping("/circuit-breaker/status")
    public DemoResult circuitBreakerStatus() {
        return resilientCacheService.getCircuitBreakerStatus();
    }

    @PostMapping("/simulate-failure")
    public DemoResult simulateFailure(@RequestBody Map<String, Object> request) {
        int failureCount = Integer.parseInt(request.getOrDefault("failureCount", 5).toString());
        return resilientCacheService.simulateRedisFailure(failureCount);
    }

    @PostMapping("/reset")
    public DemoResult reset() {
        return resilientCacheService.resetCircuitBreaker();
    }
}
