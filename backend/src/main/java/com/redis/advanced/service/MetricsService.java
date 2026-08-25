package com.redis.advanced.service;

import com.redis.advanced.model.DemoResult;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MetricsService {

    private final StringRedisTemplate redisTemplate;
    private final AtomicLong cacheHits = new AtomicLong(0);
    private final AtomicLong cacheMisses = new AtomicLong(0);
    private final AtomicLong totalRequests = new AtomicLong(0);
    private final ConcurrentLinkedDeque<Map<String, Object>> latencyHistory = new ConcurrentLinkedDeque<>();

    private final Counter hitCounter;
    private final Counter missCounter;
    private final Counter evictionCounter;
    private final Timer cacheLatencyTimer;

    public MetricsService(StringRedisTemplate redisTemplate, MeterRegistry meterRegistry) {
        this.redisTemplate = redisTemplate;

        this.hitCounter = meterRegistry.counter("cache.hits", "type", "hit");
        this.missCounter = meterRegistry.counter("cache.misses", "type", "miss");
        this.evictionCounter = meterRegistry.counter("cache.evictions", "type", "eviction");

        this.cacheLatencyTimer = Timer.builder("cache.latency")
                .description("Cache operation latency")
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(meterRegistry);

        Gauge.builder("cache.hit.rate", this, svc -> {
            long total = svc.cacheHits.get() + svc.cacheMisses.get();
            return total > 0 ? (double) svc.cacheHits.get() / total * 100 : 0;
        }).description("Cache hit rate percentage").register(meterRegistry);
    }

    public void recordHit(long latencyMs) {
        cacheHits.incrementAndGet();
        totalRequests.incrementAndGet();
        hitCounter.increment();
        cacheLatencyTimer.record(latencyMs, TimeUnit.MILLISECONDS);
        recordLatency("HIT", latencyMs);
    }

    public void recordMiss(long latencyMs) {
        cacheMisses.incrementAndGet();
        totalRequests.incrementAndGet();
        missCounter.increment();
        cacheLatencyTimer.record(latencyMs, TimeUnit.MILLISECONDS);
        recordLatency("MISS", latencyMs);
    }

    public void recordEviction() {
        evictionCounter.increment();
    }

    private void recordLatency(String type, long latencyMs) {
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("timestamp", Instant.now().toEpochMilli());
        entry.put("type", type);
        entry.put("latencyMs", latencyMs);
        latencyHistory.addLast(entry);

        // Keep last 1000 entries
        while (latencyHistory.size() > 1000) {
            latencyHistory.pollFirst();
        }
    }

    public DemoResult getSnapshot() {
        long hits = cacheHits.get();
        long misses = cacheMisses.get();
        long total = totalRequests.get();
        double hitRate = total > 0 ? (double) hits / total * 100 : 0;

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("hits", hits);
        snapshot.put("misses", misses);
        snapshot.put("total", total);
        snapshot.put("hitRate", Math.round(hitRate * 100.0) / 100.0);
        snapshot.put("avgLatencyMs", calculateAvgLatency());

        // Redis memory info
        try {
            Properties info = redisTemplate.getConnectionFactory().getConnection().serverCommands().info("memory");
            if (info != null) {
                snapshot.put("usedMemory", info.getProperty("used_memory_human"));
                snapshot.put("maxMemory", info.getProperty("maxmemory_human"));
            }
        } catch (Exception e) {
            snapshot.put("redisError", e.getMessage());
        }

        return DemoResult.ok(snapshot);
    }

    public DemoResult getHistory(int seconds) {
        long cutoff = Instant.now().toEpochMilli() - (seconds * 1000L);
        List<Map<String, Object>> recent = new ArrayList<>();
        for (Map<String, Object> entry : latencyHistory) {
            if ((Long) entry.get("timestamp") >= cutoff) {
                recent.add(entry);
            }
        }
        return DemoResult.ok(recent);
    }

    public DemoResult getPrometheusMetrics() {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("cacheHitsTotal", hitCounter.count());
        metrics.put("cacheMissesTotal", missCounter.count());
        metrics.put("cacheEvictionsTotal", evictionCounter.count());

        // Latency percentiles
        Map<String, Object> latency = new LinkedHashMap<>();
        var snapshot = cacheLatencyTimer.takeSnapshot();
        for (var percentile : snapshot.percentileValues()) {
            String key = "p" + Math.round(percentile.percentile() * 100);
            latency.put(key, Math.round(percentile.value(TimeUnit.MILLISECONDS) * 100.0) / 100.0);
        }
        latency.put("mean", Math.round(snapshot.mean(TimeUnit.MILLISECONDS) * 100.0) / 100.0);
        latency.put("max", Math.round(snapshot.max(TimeUnit.MILLISECONDS) * 100.0) / 100.0);
        latency.put("count", snapshot.count());
        metrics.put("latencyMs", latency);

        long total = cacheHits.get() + cacheMisses.get();
        metrics.put("hitRate", total > 0 ? Math.round((double) cacheHits.get() / total * 10000.0) / 100.0 : 0);
        metrics.put("prometheusEndpoint", "/actuator/prometheus");

        return DemoResult.ok(metrics);
    }

    private double calculateAvgLatency() {
        if (latencyHistory.isEmpty()) return 0;
        long sum = 0;
        int count = 0;
        for (Map<String, Object> entry : latencyHistory) {
            sum += (Long) entry.get("latencyMs");
            count++;
        }
        return count > 0 ? Math.round((double) sum / count * 100.0) / 100.0 : 0;
    }
}
