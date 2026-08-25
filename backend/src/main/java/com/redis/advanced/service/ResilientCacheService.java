package com.redis.advanced.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redis.advanced.model.DemoResult;
import com.redis.advanced.model.Product;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ResilientCacheService {

    private static final Logger log = LoggerFactory.getLogger(ResilientCacheService.class);

    private final StringRedisTemplate redisTemplate;
    private final ProductService productService;
    private final ObjectMapper objectMapper;
    private final CircuitBreaker circuitBreaker;
    private final AtomicInteger remainingFailures = new AtomicInteger(0);

    public ResilientCacheService(StringRedisTemplate redisTemplate, ProductService productService, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.productService = productService;
        this.objectMapper = objectMapper;

        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .slidingWindowSize(5)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .permittedNumberOfCallsInHalfOpenState(2)
                .build();
        this.circuitBreaker = CircuitBreaker.of("redisCircuitBreaker", config);
    }

    public DemoResult getWithFailOpen(Long productId) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();
        String cacheKey = "product:" + productId;

        result.addLog(1, "STRATEGY", "FAIL_OPEN - Redis down ise DB'ye fallback", 0);
        result.addLog(2, "CB_STATE", circuitBreaker.getState().toString(), 0);

        try {
            String cached = circuitBreaker.executeSupplier(() -> redisGet(cacheKey));

            if (cached != null) {
                result.addLog(3, "CACHE_HIT", "Redis'ten veri alindi", System.currentTimeMillis() - start);
                result.setData(Map.of("source", "CACHE", "product", parseJson(cached), "circuitBreakerState", circuitBreaker.getState().toString()));
                result.getMetadata().setSource("CACHE");
                result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
                return result;
            }
        } catch (Exception e) {
            result.addLog(3, "REDIS_FAILED", "Redis erisilemedi: " + e.getMessage(), System.currentTimeMillis() - start);
            log.warn("Fail-Open: Redis failed, falling back to DB", e);
        }

        // Fallback to DB
        long dbStart = System.currentTimeMillis();
        Product product = productService.findById(productId).orElse(null);
        result.addLog(4, "DB_FALLBACK", product != null ? "DB'den veri alindi" : "Urun bulunamadi", System.currentTimeMillis() - dbStart);

        result.setData(Map.of(
                "source", "DB_FALLBACK",
                "product", product != null ? product : "null",
                "circuitBreakerState", circuitBreaker.getState().toString()
        ));
        result.getMetadata().setSource("DB_FALLBACK");
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult getWithFailClose(Long productId) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();
        String cacheKey = "product:" + productId;

        result.addLog(1, "STRATEGY", "FAIL_CLOSE - Redis down ise 503 dondur", 0);
        result.addLog(2, "CB_STATE", circuitBreaker.getState().toString(), 0);

        try {
            String cached = circuitBreaker.executeSupplier(() -> redisGet(cacheKey));

            if (cached != null) {
                result.addLog(3, "CACHE_HIT", "Redis'ten veri alindi", System.currentTimeMillis() - start);
                result.setData(Map.of("source", "CACHE", "product", parseJson(cached), "circuitBreakerState", circuitBreaker.getState().toString()));
                result.getMetadata().setSource("CACHE");
            } else {
                // Cache miss, query DB
                Product product = productService.findById(productId).orElse(null);
                result.addLog(3, "CACHE_MISS", "DB'ye sorgu yapildi", System.currentTimeMillis() - start);
                result.setData(Map.of("source", "DB", "product", product != null ? product : "null", "circuitBreakerState", circuitBreaker.getState().toString()));
                result.getMetadata().setSource("DB");
            }
        } catch (Exception e) {
            result.addLog(3, "FAIL_CLOSE", "Redis erisim hatasi - istek REDDEDILDI: " + e.getMessage(), System.currentTimeMillis() - start);
            result.setSuccess(false);
            result.setData(Map.of(
                    "error", "Service Unavailable - Redis is down",
                    "circuitBreakerState", circuitBreaker.getState().toString(),
                    "message", "Fail-Close: Kritik islemler icin veri tutarliligi onceliklidir"
            ));
        }

        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult getCircuitBreakerStatus() {
        var metrics = circuitBreaker.getMetrics();
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("state", circuitBreaker.getState().toString());
        status.put("failureRate", metrics.getFailureRate());
        status.put("numberOfSuccessfulCalls", metrics.getNumberOfSuccessfulCalls());
        status.put("numberOfFailedCalls", metrics.getNumberOfFailedCalls());
        status.put("numberOfNotPermittedCalls", metrics.getNumberOfNotPermittedCalls());
        status.put("remainingSimulatedFailures", remainingFailures.get());
        return DemoResult.ok(status);
    }

    public DemoResult simulateRedisFailure(int failureCount) {
        remainingFailures.set(failureCount);
        DemoResult result = new DemoResult();
        result.addLog(1, "SIMULATE", failureCount + " adet Redis hatasi simule edilecek", 0);
        result.setData(Map.of("simulatedFailures", failureCount, "circuitBreakerState", circuitBreaker.getState().toString()));
        return result;
    }

    public DemoResult resetCircuitBreaker() {
        circuitBreaker.reset();
        remainingFailures.set(0);
        DemoResult result = new DemoResult();
        result.addLog(1, "RESET", "Circuit breaker sifirlandi", 0);
        result.setData(Map.of("circuitBreakerState", circuitBreaker.getState().toString()));
        return result;
    }

    private String redisGet(String key) {
        if (remainingFailures.getAndDecrement() > 0) {
            throw new RuntimeException("Simulated Redis failure");
        }
        return redisTemplate.opsForValue().get(key);
    }

    private Object parseJson(String json) {
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return json;
        }
    }
}
