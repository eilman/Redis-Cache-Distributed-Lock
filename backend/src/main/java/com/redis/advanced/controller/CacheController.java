package com.redis.advanced.controller;

import com.redis.advanced.model.CacheEntry;
import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.CacheService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cache")
public class CacheController {

    private final CacheService cacheService;

    public CacheController(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    @GetMapping("/keys")
    public DemoResult getKeys(@RequestParam(defaultValue = "*") String pattern) {
        return cacheService.getKeys(pattern);
    }

    @GetMapping("/{key}")
    public DemoResult getValue(@PathVariable String key) {
        return cacheService.getValue(key);
    }

    @PostMapping
    public DemoResult setValue(@RequestBody CacheEntry entry) {
        return cacheService.setValue(entry.getKey(), entry.getValue().toString(), entry.getTtlSeconds());
    }

    @DeleteMapping("/{key}")
    public DemoResult deleteKey(@PathVariable String key) {
        return cacheService.deleteKey(key);
    }

    @GetMapping("/info")
    public DemoResult getInfo() {
        return cacheService.getInfo();
    }
}
