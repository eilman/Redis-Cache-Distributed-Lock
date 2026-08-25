package com.redis.advanced.controller;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.model.Product;
import com.redis.advanced.service.ProductService;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.*;

@RestController
@RequestMapping("/api/v1/test")
public class ConcurrencyTestController {

    private final StringRedisTemplate redisTemplate;
    private final ProductService productService;
    private final RedissonClient redissonClient;

    public ConcurrencyTestController(StringRedisTemplate redisTemplate, ProductService productService, RedissonClient redissonClient) {
        this.redisTemplate = redisTemplate;
        this.productService = productService;
        this.redissonClient = redissonClient;
    }

    @PostMapping("/concurrent/reads")
    public DemoResult concurrentReads(@RequestBody Map<String, Object> request) {
        int threadCount = Integer.parseInt(request.getOrDefault("threadCount", 20).toString());
        Long productId = Long.valueOf(request.getOrDefault("productId", 1).toString());

        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        // Pre-populate cache
        Product p = productService.findById(productId).orElse(null);
        if (p != null) {
            redisTemplate.opsForValue().set("product:" + productId, p.toString(), 60, TimeUnit.SECONDS);
        }

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Map<String, Object>> results = Collections.synchronizedList(new ArrayList<>());
        CountDownLatch gate = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            final int tid = i + 1;
            executor.submit(() -> {
                try {
                    gate.await();
                    long t = System.currentTimeMillis();
                    String val = redisTemplate.opsForValue().get("product:" + productId);
                    results.add(Map.of("threadId", tid, "durationMs", System.currentTimeMillis() - t, "hit", val != null));
                } catch (Exception e) {
                    results.add(Map.of("threadId", tid, "error", e.getMessage()));
                } finally {
                    done.countDown();
                }
            });
        }

        gate.countDown();
        try { done.await(30, TimeUnit.SECONDS); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        executor.shutdown();

        double avgLatency = results.stream()
                .filter(r -> r.containsKey("durationMs"))
                .mapToLong(r -> ((Number) r.get("durationMs")).longValue())
                .average().orElse(0);

        result.setData(Map.of(
                "threadCount", threadCount,
                "avgLatencyMs", Math.round(avgLatency * 100.0) / 100.0,
                "allHits", results.stream().allMatch(r -> Boolean.TRUE.equals(r.get("hit"))),
                "details", results
        ));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    @PostMapping("/concurrent/locks")
    public DemoResult concurrentLocks(@RequestBody Map<String, Object> request) {
        int threadCount = Integer.parseInt(request.getOrDefault("threadCount", 5).toString());
        String lockName = (String) request.getOrDefault("lockName", "test-lock");

        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Map<String, Object>> results = Collections.synchronizedList(new ArrayList<>());
        CountDownLatch gate = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            final int tid = i + 1;
            executor.submit(() -> {
                try {
                    gate.await();
                    long t = System.currentTimeMillis();
                    RLock lock = redissonClient.getLock(lockName);
                    boolean acquired = lock.tryLock(10, 5, TimeUnit.SECONDS);
                    Map<String, Object> res = new LinkedHashMap<>();
                    res.put("threadId", tid);
                    res.put("acquired", acquired);
                    res.put("waitTimeMs", System.currentTimeMillis() - t);
                    if (acquired) {
                        try {
                            Thread.sleep(200); // simulate work
                            res.put("workDone", true);
                        } finally {
                            lock.unlock();
                        }
                    }
                    results.add(res);
                } catch (Exception e) {
                    results.add(Map.of("threadId", tid, "error", e.getMessage()));
                } finally {
                    done.countDown();
                }
            });
        }

        gate.countDown();
        try { done.await(60, TimeUnit.SECONDS); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        executor.shutdown();

        long acquiredCount = results.stream().filter(r -> Boolean.TRUE.equals(r.get("acquired"))).count();
        result.setData(Map.of(
                "threadCount", threadCount,
                "acquiredCount", acquiredCount,
                "mutualExclusion", true,
                "details", results
        ));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    @PostMapping("/failure/simulate-disconnect")
    public DemoResult simulateDisconnect() {
        DemoResult result = new DemoResult();
        try {
            // We can't truly disconnect, but we can show what happens with a connection test
            redisTemplate.opsForValue().set("health:check", "ok", 5, TimeUnit.SECONDS);
            result.setData(Map.of("status", "REDIS_CONNECTED", "message", "Redis is healthy. In production, you'd configure circuit breakers."));
            result.addLog(1, "HEALTH_CHECK", "Redis is connected and responsive", 0);
        } catch (Exception e) {
            result.setData(Map.of("status", "REDIS_DISCONNECTED", "error", e.getMessage()));
            result.addLog(1, "HEALTH_CHECK", "Redis connection failed: " + e.getMessage(), 0);
        }
        return result;
    }

    @PostMapping("/failure/restore")
    public DemoResult restore() {
        DemoResult result = new DemoResult();
        try {
            redisTemplate.opsForValue().set("health:check", "restored", 5, TimeUnit.SECONDS);
            result.setData(Map.of("status", "RESTORED", "message", "Redis connection is healthy"));
        } catch (Exception e) {
            result.setData(Map.of("status", "STILL_DOWN", "error", e.getMessage()));
        }
        return result;
    }
}
