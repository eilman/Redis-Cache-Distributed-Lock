package com.redis.advanced.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redis.advanced.model.DemoResult;
import com.redis.advanced.model.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class PatternDemoService {

    private static final Logger log = LoggerFactory.getLogger(PatternDemoService.class);
    private static final String CACHE_PREFIX = "product:";
    private static final long DEFAULT_TTL = 60;

    private final StringRedisTemplate redisTemplate;
    private final ProductService productService;
    private final ObjectMapper objectMapper;

    public PatternDemoService(StringRedisTemplate redisTemplate, ProductService productService, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.productService = productService;
        this.objectMapper = objectMapper;
    }

    public DemoResult cacheAside(Long productId) {
        DemoResult result = new DemoResult();
        long totalStart = System.currentTimeMillis();

        // Step 1: Check cache
        long step1Start = System.currentTimeMillis();
        String cacheKey = CACHE_PREFIX + productId;
        String cached = redisTemplate.opsForValue().get(cacheKey);
        long step1Duration = System.currentTimeMillis() - step1Start;

        if (cached != null) {
            result.addLog(1, "CHECK_CACHE", "HIT", step1Duration);
            result.setData(parseJson(cached));
            result.getMetadata().setSource("CACHE");
            result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - totalStart);
            return result;
        }

        result.addLog(1, "CHECK_CACHE", "MISS", step1Duration);

        // Step 2: Query DB
        long step2Start = System.currentTimeMillis();
        Product product = productService.findById(productId).orElse(null);
        long step2Duration = System.currentTimeMillis() - step2Start;
        result.addLog(2, "QUERY_DB", product != null ? "FOUND" : "NOT_FOUND", step2Duration);

        if (product == null) {
            result.setData(null);
            result.getMetadata().setSource("DB");
            result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - totalStart);
            return result;
        }

        // Step 3: Populate cache
        long step3Start = System.currentTimeMillis();
        String json = toJson(product);
        redisTemplate.opsForValue().set(cacheKey, json, DEFAULT_TTL, TimeUnit.SECONDS);
        long step3Duration = System.currentTimeMillis() - step3Start;
        result.addLog(3, "POPULATE_CACHE", "SET with TTL=" + DEFAULT_TTL + "s", step3Duration);

        result.setData(product);
        result.getMetadata().setSource("DB");
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - totalStart);
        return result;
    }

    public DemoResult readThrough(Long productId) {
        DemoResult result = new DemoResult();
        long totalStart = System.currentTimeMillis();

        String cacheKey = CACHE_PREFIX + "rt:" + productId;

        // Step 1: Read through (cache handles transparently)
        long step1Start = System.currentTimeMillis();
        String cached = redisTemplate.opsForValue().get(cacheKey);
        long step1Duration = System.currentTimeMillis() - step1Start;

        if (cached != null) {
            result.addLog(1, "READ_THROUGH", "CACHE_HIT", step1Duration);
            result.setData(parseJson(cached));
            result.getMetadata().setSource("CACHE");
            result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - totalStart);
            return result;
        }

        result.addLog(1, "READ_THROUGH", "CACHE_MISS - Loading from DB", step1Duration);

        // Step 2: Cache layer loads from DB
        long step2Start = System.currentTimeMillis();
        Product product = productService.findById(productId).orElse(null);
        long step2Duration = System.currentTimeMillis() - step2Start;
        result.addLog(2, "LOAD_FROM_DB", product != null ? "LOADED" : "NOT_FOUND", step2Duration);

        if (product != null) {
            long step3Start = System.currentTimeMillis();
            redisTemplate.opsForValue().set(cacheKey, toJson(product), DEFAULT_TTL, TimeUnit.SECONDS);
            long step3Duration = System.currentTimeMillis() - step3Start;
            result.addLog(3, "AUTO_POPULATE", "Cached automatically", step3Duration);
        }

        result.setData(product);
        result.getMetadata().setSource("DB");
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - totalStart);
        return result;
    }

    public DemoResult writeThrough(Long productId, Map<String, Object> updates) {
        DemoResult result = new DemoResult();
        long totalStart = System.currentTimeMillis();

        // Step 1: Update DB
        long step1Start = System.currentTimeMillis();
        Product product = productService.findById(productId).orElse(null);
        if (product == null) {
            result.setSuccess(false);
            result.setData("Product not found");
            return result;
        }
        if (updates.containsKey("name")) product.setName((String) updates.get("name"));
        if (updates.containsKey("stock")) product.setStock((Integer) updates.get("stock"));
        product = productService.save(product);
        long step1Duration = System.currentTimeMillis() - step1Start;
        result.addLog(1, "UPDATE_DB", "UPDATED", step1Duration);

        // Step 2: Update cache simultaneously
        long step2Start = System.currentTimeMillis();
        String cacheKey = CACHE_PREFIX + productId;
        redisTemplate.opsForValue().set(cacheKey, toJson(product), DEFAULT_TTL, TimeUnit.SECONDS);
        long step2Duration = System.currentTimeMillis() - step2Start;
        result.addLog(2, "UPDATE_CACHE", "SYNCED", step2Duration);

        result.setData(product);
        result.getMetadata().setSource("WRITE_THROUGH");
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - totalStart);
        return result;
    }

    public DemoResult cacheAsideWithTTL(Long productId, TTLStrategy.Type strategy, long baseTTL, long jitterRange) {
        DemoResult result = new DemoResult();
        long totalStart = System.currentTimeMillis();

        // Step 1: Check cache
        long step1Start = System.currentTimeMillis();
        String cacheKey = CACHE_PREFIX + "ttl:" + productId;
        String cached = redisTemplate.opsForValue().get(cacheKey);
        long step1Duration = System.currentTimeMillis() - step1Start;

        if (cached != null) {
            result.addLog(1, "CHECK_CACHE", "HIT", step1Duration);
            result.setData(parseJson(cached));
            result.getMetadata().setSource("CACHE");
            result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - totalStart);
            return result;
        }

        result.addLog(1, "CHECK_CACHE", "MISS", step1Duration);

        // Step 2: Query DB
        long step2Start = System.currentTimeMillis();
        Product product = productService.findById(productId).orElse(null);
        long step2Duration = System.currentTimeMillis() - step2Start;
        result.addLog(2, "QUERY_DB", product != null ? "FOUND" : "NOT_FOUND", step2Duration);

        if (product == null) {
            result.setData(null);
            result.getMetadata().setSource("DB");
            result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - totalStart);
            return result;
        }

        // Step 3: Compute TTL and populate cache
        long ttl = switch (strategy) {
            case FIXED -> TTLStrategy.fixed(baseTTL);
            case DYNAMIC -> TTLStrategy.dynamic(product.getCategory());
            case JITTERED -> TTLStrategy.jittered(baseTTL, jitterRange);
        };

        long step3Start = System.currentTimeMillis();
        String json = toJson(product);
        redisTemplate.opsForValue().set(cacheKey, json, ttl, TimeUnit.SECONDS);
        long step3Duration = System.currentTimeMillis() - step3Start;
        result.addLog(3, "POPULATE_CACHE", "SET with TTL=" + ttl + "s (strategy=" + strategy + ")", step3Duration);

        result.setData(product);
        result.getMetadata().setSource("DB");
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - totalStart);
        return result;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("JSON serialization failed", e);
        }
    }

    private Object parseJson(String json) {
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return json;
        }
    }
}
