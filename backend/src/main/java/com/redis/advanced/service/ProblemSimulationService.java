package com.redis.advanced.service;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.model.Product;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

@Service
public class ProblemSimulationService {

    private static final Logger log = LoggerFactory.getLogger(ProblemSimulationService.class);

    private final StringRedisTemplate redisTemplate;
    private final ProductService productService;
    private final RedissonClient redissonClient;

    // In-memory "DB" simulation for stale data demo
    private final Map<String, String> staleDataDb = new ConcurrentHashMap<>();

    public ProblemSimulationService(StringRedisTemplate redisTemplate, ProductService productService, RedissonClient redissonClient) {
        this.redisTemplate = redisTemplate;
        this.productService = productService;
        this.redissonClient = redissonClient;
    }

    public DemoResult simulateStampede(Long productId, int concurrentRequests) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        // Clear cache first
        redisTemplate.delete("product:" + productId);

        CountDownLatch gate = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(concurrentRequests);
        List<Map<String, Object>> requestResults = Collections.synchronizedList(new ArrayList<>());

        ExecutorService executor = Executors.newFixedThreadPool(concurrentRequests);
        for (int i = 0; i < concurrentRequests; i++) {
            final int reqId = i + 1;
            executor.submit(() -> {
                try {
                    gate.await(); // all start at once
                    long reqStart = System.currentTimeMillis();
                    String cached = redisTemplate.opsForValue().get("product:" + productId);
                    String source;
                    if (cached != null) {
                        source = "CACHE";
                    } else {
                        // All threads hit DB simultaneously!
                        productService.findById(productId);
                        source = "DB";
                    }
                    requestResults.add(Map.of(
                            "requestId", reqId,
                            "source", source,
                            "durationMs", System.currentTimeMillis() - reqStart
                    ));
                } catch (Exception e) {
                    requestResults.add(Map.of("requestId", reqId, "error", e.getMessage()));
                } finally {
                    done.countDown();
                }
            });
        }

        gate.countDown(); // release all threads
        try { done.await(30, TimeUnit.SECONDS); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        executor.shutdown();

        long dbHits = requestResults.stream().filter(r -> "DB".equals(r.get("source"))).count();
        result.setData(Map.of(
                "totalRequests", concurrentRequests,
                "dbHits", dbHits,
                "cacheHits", concurrentRequests - dbHits,
                "details", requestResults
        ));
        result.addLog(1, "STAMPEDE", dbHits + " DB hits out of " + concurrentRequests + " requests!", System.currentTimeMillis() - start);
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult simulateStampedeMitigated(Long productId, int concurrentRequests) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        redisTemplate.delete("product:" + productId);

        CountDownLatch gate = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(concurrentRequests);
        List<Map<String, Object>> requestResults = Collections.synchronizedList(new ArrayList<>());

        ExecutorService executor = Executors.newFixedThreadPool(concurrentRequests);
        for (int i = 0; i < concurrentRequests; i++) {
            final int reqId = i + 1;
            executor.submit(() -> {
                try {
                    gate.await();
                    long reqStart = System.currentTimeMillis();
                    String cacheKey = "product:" + productId;
                    String cached = redisTemplate.opsForValue().get(cacheKey);

                    if (cached != null) {
                        requestResults.add(Map.of("requestId", reqId, "source", "CACHE", "durationMs", System.currentTimeMillis() - reqStart));
                    } else {
                        // Use distributed lock to prevent stampede
                        RLock lock = redissonClient.getLock("lock:populate:" + cacheKey);
                        try {
                            if (lock.tryLock(5, 10, TimeUnit.SECONDS)) {
                                try {
                                    // Double-check after acquiring lock
                                    cached = redisTemplate.opsForValue().get(cacheKey);
                                    if (cached == null) {
                                        Product p = productService.findById(productId).orElse(null);
                                        if (p != null) {
                                            redisTemplate.opsForValue().set(cacheKey, p.toString(), 60, TimeUnit.SECONDS);
                                        }
                                        requestResults.add(Map.of("requestId", reqId, "source", "DB (lock holder)", "durationMs", System.currentTimeMillis() - reqStart));
                                    } else {
                                        requestResults.add(Map.of("requestId", reqId, "source", "CACHE (after lock)", "durationMs", System.currentTimeMillis() - reqStart));
                                    }
                                } finally {
                                    lock.unlock();
                                }
                            }
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }
                } catch (Exception e) {
                    requestResults.add(Map.of("requestId", reqId, "error", e.getMessage()));
                } finally {
                    done.countDown();
                }
            });
        }

        gate.countDown();
        try { done.await(30, TimeUnit.SECONDS); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        executor.shutdown();

        long dbHits = requestResults.stream().filter(r -> {
            Object s = r.get("source");
            return s != null && s.toString().startsWith("DB");
        }).count();

        result.setData(Map.of(
                "totalRequests", concurrentRequests,
                "dbHits", dbHits,
                "cacheHits", concurrentRequests - dbHits,
                "mitigated", true,
                "details", requestResults
        ));
        result.addLog(1, "STAMPEDE_MITIGATED", "Only " + dbHits + " DB hit(s) with lock!", System.currentTimeMillis() - start);
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult simulatePenetration(String key) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        // Query for non-existent key - always misses cache AND DB
        String cached = redisTemplate.opsForValue().get(key);
        result.addLog(1, "CHECK_CACHE", "MISS (key doesn't exist)", System.currentTimeMillis() - start);

        long dbStart = System.currentTimeMillis();
        // Simulate DB query for non-existent data
        try { Thread.sleep(150); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        result.addLog(2, "QUERY_DB", "NOT_FOUND (every request hits DB!)", System.currentTimeMillis() - dbStart);

        result.setData(Map.of("key", key, "cached", false, "dbResult", "null", "problem", "Every request for this key hits DB!"));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult simulatePenetrationMitigated(String key) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        String cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            result.addLog(1, "CHECK_CACHE", cached.equals("NULL") ? "HIT (null sentinel)" : "HIT", System.currentTimeMillis() - start);
            result.setData(Map.of("key", key, "cached", true, "value", cached, "mitigated", true));
            result.getMetadata().setSource("CACHE");
            result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
            return result;
        }

        result.addLog(1, "CHECK_CACHE", "MISS", System.currentTimeMillis() - start);

        long dbStart = System.currentTimeMillis();
        try { Thread.sleep(150); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        result.addLog(2, "QUERY_DB", "NOT_FOUND", System.currentTimeMillis() - dbStart);

        // Cache null sentinel value with short TTL
        long cacheStart = System.currentTimeMillis();
        redisTemplate.opsForValue().set(key, "NULL", 30, TimeUnit.SECONDS);
        result.addLog(3, "CACHE_NULL", "Stored null sentinel (TTL=30s)", System.currentTimeMillis() - cacheStart);

        result.setData(Map.of("key", key, "mitigated", true, "nullCached", true));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult simulatePenetrationMulti(String key, int requestCount, boolean useNullCaching) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        // Clear any existing cache for this key
        redisTemplate.delete(key);

        List<Map<String, Object>> requests = new ArrayList<>();
        int dbHits = 0;
        int cacheHits = 0;

        for (int i = 1; i <= requestCount; i++) {
            long reqStart = System.currentTimeMillis();
            String cached = redisTemplate.opsForValue().get(key);

            if (cached != null) {
                cacheHits++;
                boolean isNullSentinel = "NULL".equals(cached);
                requests.add(Map.of(
                        "requestId", i,
                        "cacheResult", isNullSentinel ? "HIT (null sentinel)" : "HIT",
                        "source", "CACHE",
                        "dbHit", false,
                        "durationMs", System.currentTimeMillis() - reqStart
                ));
                result.addLog(i, "REQUEST_" + i,
                        "Cache " + (isNullSentinel ? "HIT (null sentinel)" : "HIT") + " - DB sorgusu yapilmadi",
                        System.currentTimeMillis() - reqStart);
            } else {
                dbHits++;
                try { Thread.sleep(100); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

                if (useNullCaching) {
                    redisTemplate.opsForValue().set(key, "NULL", 30, TimeUnit.SECONDS);
                    requests.add(Map.of(
                            "requestId", i,
                            "cacheResult", "MISS",
                            "source", "DB",
                            "dbHit", true,
                            "nullCached", true,
                            "durationMs", System.currentTimeMillis() - reqStart
                    ));
                    result.addLog(i, "REQUEST_" + i,
                            "Cache MISS -> DB NOT_FOUND -> null sentinel cache'lendi (TTL=30s)",
                            System.currentTimeMillis() - reqStart);
                } else {
                    requests.add(Map.of(
                            "requestId", i,
                            "cacheResult", "MISS",
                            "source", "DB",
                            "dbHit", true,
                            "nullCached", false,
                            "durationMs", System.currentTimeMillis() - reqStart
                    ));
                    result.addLog(i, "REQUEST_" + i,
                            "Cache MISS -> DB NOT_FOUND -> hicbir sey cache'lenmedi!",
                            System.currentTimeMillis() - reqStart);
                }
            }
        }

        result.setData(Map.of(
                "key", key,
                "totalRequests", requestCount,
                "dbHits", dbHits,
                "cacheHits", cacheHits,
                "useNullCaching", useNullCaching,
                "requests", requests
        ));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult simulateStaleData(String productName, double originalPrice, double newPrice, int ttlSeconds) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        String cacheKey = "stale-demo:" + productName.toLowerCase().replace(" ", "-");

        // Step 1: Write product to cache (simulating initial load)
        String cachedValue = "{\"name\":\"" + productName + "\",\"price\":" + originalPrice + "}";
        redisTemplate.opsForValue().set(cacheKey, cachedValue, ttlSeconds, TimeUnit.SECONDS);
        result.addLog(1, "CACHE_WRITE",
                productName + " -> price=" + originalPrice + "TL (TTL=" + ttlSeconds + "s)",
                System.currentTimeMillis() - start);

        // Step 2: Simulate DB update (only DB changes, cache stays old)
        try { Thread.sleep(100); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        staleDataDb.put(cacheKey, "{\"name\":\"" + productName + "\",\"price\":" + newPrice + "}");
        result.addLog(2, "DB_UPDATE",
                "DB guncellendi: " + originalPrice + "TL -> " + newPrice + "TL (cache guncellenmedi!)",
                System.currentTimeMillis() - start);

        // Step 3: User reads from cache - gets stale data!
        String staleValue = redisTemplate.opsForValue().get(cacheKey);
        result.addLog(3, "CACHE_READ",
                "Kullanici okudu: " + staleValue + " -> YANLIS FIYAT!",
                System.currentTimeMillis() - start);

        // Step 4: Show the impact
        Long remainingTTL = redisTemplate.getExpire(cacheKey, TimeUnit.SECONDS);
        double priceDiff = Math.abs(originalPrice - newPrice);
        result.addLog(4, "STALE_ALERT",
                "Fiyat farki: " + priceDiff + "TL! Kalan TTL: " + remainingTTL + "s",
                System.currentTimeMillis() - start);

        result.setData(Map.of(
                "cacheKey", cacheKey,
                "cacheValue", staleValue != null ? staleValue : "null",
                "dbValue", staleDataDb.getOrDefault(cacheKey, "null"),
                "cachePrice", originalPrice,
                "dbPrice", newPrice,
                "isStale", true,
                "remainingTTL", remainingTTL != null ? remainingTTL : -1,
                "priceDifference", priceDiff
        ));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult simulateStaleDataFix(String productName) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        String cacheKey = "stale-demo:" + productName.toLowerCase().replace(" ", "-");

        // Step 1: Invalidate cache
        redisTemplate.delete(cacheKey);
        result.addLog(1, "CACHE_INVALIDATE", "Cache silindi: " + cacheKey, System.currentTimeMillis() - start);

        // Step 2: Next read comes from DB (fresh data)
        String dbValue = staleDataDb.getOrDefault(cacheKey, "null");
        result.addLog(2, "DB_READ", "DB'den okundu: " + dbValue, System.currentTimeMillis() - start);

        // Step 3: Re-populate cache with fresh data
        if (!"null".equals(dbValue)) {
            redisTemplate.opsForValue().set(cacheKey, dbValue, 300, TimeUnit.SECONDS);
            result.addLog(3, "CACHE_REFRESH",
                    "Cache guncellendi: " + dbValue + " (TTL=300s)",
                    System.currentTimeMillis() - start);
        }

        result.setData(Map.of(
                "cacheKey", cacheKey,
                "cacheValue", dbValue,
                "dbValue", dbValue,
                "isStale", false,
                "fixed", true
        ));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }
}
