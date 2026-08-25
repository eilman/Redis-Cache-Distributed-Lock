package com.redis.advanced.controller;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.PatternDemoService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/demo/pattern")
public class PatternDemoController {

    private final PatternDemoService patternDemoService;

    public PatternDemoController(PatternDemoService patternDemoService) {
        this.patternDemoService = patternDemoService;
    }

    @GetMapping("/cache-aside/{productId}")
    public DemoResult cacheAside(@PathVariable Long productId) {
        return patternDemoService.cacheAside(productId);
    }

    @GetMapping("/read-through/{productId}")
    public DemoResult readThrough(@PathVariable Long productId) {
        return patternDemoService.readThrough(productId);
    }

    @PutMapping("/write-through/{productId}")
    public DemoResult writeThrough(@PathVariable Long productId, @RequestBody Map<String, Object> updates) {
        return patternDemoService.writeThrough(productId, updates);
    }
}
