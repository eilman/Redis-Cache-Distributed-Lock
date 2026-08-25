package com.redis.advanced.service;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.model.LockInfo;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

@Service
public class DistributedLockService {

    private static final Logger log = LoggerFactory.getLogger(DistributedLockService.class);
    private final RedissonClient redissonClient;
    private final StringRedisTemplate redisTemplate;

    public DistributedLockService(RedissonClient redissonClient, StringRedisTemplate redisTemplate) {
        this.redissonClient = redissonClient;
        this.redisTemplate = redisTemplate;
    }

    public DemoResult acquireLock(String lockName, long leaseTimeMs, long waitTimeMs) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        try {
            RLock lock = redissonClient.getLock(lockName);
            result.addLog(1, "TRY_ACQUIRE", "Attempting lock: " + lockName, 0);

            boolean acquired = lock.tryLock(waitTimeMs, leaseTimeMs, TimeUnit.MILLISECONDS);
            long duration = System.currentTimeMillis() - start;

            if (acquired) {
                result.addLog(2, "ACQUIRED", "Lock acquired successfully", duration);
                result.setData(Map.of(
                        "lockName", lockName,
                        "acquired", true,
                        "leaseTimeMs", leaseTimeMs,
                        "threadId", Thread.currentThread().getId()
                ));
            } else {
                result.addLog(2, "FAILED", "Could not acquire lock within wait time", duration);
                result.setData(Map.of("lockName", lockName, "acquired", false));
            }

            result.getMetadata().setExecutionTimeMs(duration);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            result.setSuccess(false);
            result.setData("Interrupted while waiting for lock");
        }

        return result;
    }

    public DemoResult releaseLock(String lockName) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        RLock lock = redissonClient.getLock(lockName);
        try {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
                result.addLog(1, "RELEASE", "Lock released successfully", System.currentTimeMillis() - start);
                result.setData(Map.of("lockName", lockName, "released", true));
            } else {
                lock.forceUnlock();
                result.addLog(1, "FORCE_RELEASE", "Lock force-released", System.currentTimeMillis() - start);
                result.setData(Map.of("lockName", lockName, "released", true, "forced", true));
            }
        } catch (Exception e) {
            result.addLog(1, "RELEASE_ERROR", e.getMessage(), System.currentTimeMillis() - start);
            result.setData(Map.of("lockName", lockName, "released", false, "error", e.getMessage()));
        }

        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult getLockStatus(String lockName) {
        RLock lock = redissonClient.getLock(lockName);
        long remainingTtl = lock.remainTimeToLive();

        LockInfo info = new LockInfo(
                lockName,
                lock.isLocked(),
                lock.isLocked() ? "thread-" + lock.getHoldCount() : null,
                Math.max(0, remainingTtl)
        );

        return DemoResult.ok(info);
    }

    public DemoResult simulateScheduledJob(String jobName, int instanceCount) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();
        String lockName = "scheduled-job:" + jobName;
        List<Map<String, Object>> instanceResults = Collections.synchronizedList(new ArrayList<>());
        CountDownLatch latch = new CountDownLatch(instanceCount);
        ExecutorService executor = Executors.newFixedThreadPool(instanceCount);

        for (int i = 0; i < instanceCount; i++) {
            final int instanceId = i + 1;
            executor.submit(() -> {
                try {
                    RLock lock = redissonClient.getLock(lockName);
                    boolean acquired = lock.tryLock(5, 10, TimeUnit.SECONDS);

                    Map<String, Object> res = new LinkedHashMap<>();
                    res.put("instanceId", instanceId);
                    res.put("acquired", acquired);

                    if (acquired) {
                        try {
                            Thread.sleep(500); // simulate job work
                            res.put("status", "JOB_EXECUTED");
                        } finally {
                            lock.unlock();
                        }
                    } else {
                        res.put("status", "SKIPPED - Another instance holds the lock");
                    }

                    instanceResults.add(res);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
        }

        try {
            latch.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        executor.shutdown();

        result.setData(Map.of("jobName", jobName, "instances", instanceResults));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    // ==================== Lock Mechanics Demo ====================

    public DemoResult mechanicsTrySetNx(String key, String uuid, long pxMs) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        Boolean success = redisTemplate.opsForValue().setIfAbsent(key, uuid, pxMs, TimeUnit.MILLISECONDS);

        if (Boolean.TRUE.equals(success)) {
            Long ttl = redisTemplate.getExpire(key, TimeUnit.MILLISECONDS);
            result.addLog(1, "SET_NX_PX", "OK - Lock alindi!", System.currentTimeMillis() - start);
            result.setData(Map.of(
                    "command", "SET " + key + " \"" + uuid + "\" NX PX " + pxMs,
                    "result", "OK",
                    "acquired", true,
                    "key", key,
                    "value", uuid,
                    "ttlMs", ttl != null ? ttl : pxMs
            ));
        } else {
            String currentOwner = redisTemplate.opsForValue().get(key);
            Long ttl = redisTemplate.getExpire(key, TimeUnit.MILLISECONDS);
            result.addLog(1, "SET_NX_PX", "nil - Lock baskasinda!", System.currentTimeMillis() - start);
            result.setData(Map.of(
                    "command", "SET " + key + " \"" + uuid + "\" NX PX " + pxMs,
                    "result", "nil",
                    "acquired", false,
                    "key", key,
                    "currentOwner", currentOwner != null ? currentOwner : "unknown",
                    "remainingTtlMs", ttl != null ? ttl : 0
            ));
        }
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult mechanicsCheck(String key) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        String value = redisTemplate.opsForValue().get(key);
        Long ttlMs = redisTemplate.getExpire(key, TimeUnit.MILLISECONDS);

        result.addLog(1, "GET " + key, value != null ? "\"" + value + "\"" : "(nil)", System.currentTimeMillis() - start);
        result.addLog(2, "PTTL " + key,
                ttlMs != null && ttlMs > 0 ? ttlMs + "ms"
                        : (ttlMs != null && ttlMs == -1 ? "no expire" : "-2 (key yok)"),
                System.currentTimeMillis() - start);

        result.setData(Map.of(
                "key", key,
                "exists", value != null,
                "value", value != null ? value : "nil",
                "ttlMs", ttlMs != null ? ttlMs : -2
        ));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult mechanicsRelease(String key, String uuid) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        String currentValue = redisTemplate.opsForValue().get(key);

        if (currentValue == null) {
            result.addLog(1, "GET", "(nil) - Key zaten yok", System.currentTimeMillis() - start);
            result.setData(Map.of("released", false, "reason", "Key yok"));
        } else if (currentValue.equals(uuid)) {
            redisTemplate.delete(key);
            result.addLog(1, "GET", "\"" + currentValue + "\" - UUID eslesti", System.currentTimeMillis() - start);
            result.addLog(2, "DEL", "Lock silindi - serbest birakildi", System.currentTimeMillis() - start);
            result.setData(Map.of("released", true, "owner", uuid));
        } else {
            result.addLog(1, "GET", "\"" + currentValue + "\" - UUID eslesmedi!", System.currentTimeMillis() - start);
            result.addLog(2, "REJECTED", "Baskasininin kilidini silemezsin! senin=" + uuid + " gercek=" + currentValue, System.currentTimeMillis() - start);
            result.setData(Map.of("released", false, "reason", "Owner mismatch", "yourUuid", uuid, "actualOwner", currentValue));
        }
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult mechanicsRace(String key, long pxMs) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        redisTemplate.delete(key);

        String uuidA = "pod-a-" + UUID.randomUUID().toString().substring(0, 6);
        String uuidB = "pod-b-" + UUID.randomUUID().toString().substring(0, 6);

        CountDownLatch gate = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(2);
        List<Map<String, Object>> podResults = Collections.synchronizedList(new ArrayList<>());

        ExecutorService executor = Executors.newFixedThreadPool(2);

        for (String[] pod : new String[][]{{"Pod-A", uuidA}, {"Pod-B", uuidB}}) {
            executor.submit(() -> {
                try {
                    gate.await();
                    long t = System.currentTimeMillis();
                    Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, pod[1], pxMs, TimeUnit.MILLISECONDS);
                    podResults.add(Map.of(
                            "pod", pod[0],
                            "uuid", pod[1],
                            "command", "SET " + key + " \"" + pod[1] + "\" NX PX " + pxMs,
                            "acquired", Boolean.TRUE.equals(acquired),
                            "result", Boolean.TRUE.equals(acquired) ? "OK" : "nil",
                            "durationMs", System.currentTimeMillis() - t
                    ));
                } catch (Exception e) {
                    podResults.add(Map.of("pod", pod[0], "error", e.getMessage()));
                } finally { done.countDown(); }
            });
        }

        gate.countDown();
        try { done.await(10, TimeUnit.SECONDS); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        executor.shutdown();

        redisTemplate.delete(key);

        String winner = podResults.stream()
                .filter(r -> Boolean.TRUE.equals(r.get("acquired")))
                .map(r -> (String) r.get("pod"))
                .findFirst().orElse("none");

        long acquiredCount = podResults.stream().filter(r -> Boolean.TRUE.equals(r.get("acquired"))).count();

        for (Map<String, Object> pr : podResults) {
            boolean acquired = Boolean.TRUE.equals(pr.get("acquired"));
            int step = "Pod-A".equals(pr.get("pod")) ? 1 : 2;
            result.addLog(step, (String) pr.get("pod"),
                    "SET NX -> " + (acquired ? "OK (Lock alindi!)" : "nil (Lock baskasinda)"),
                    ((Number) pr.get("durationMs")).longValue());
        }

        result.setData(Map.of(
                "key", key,
                "podResults", podResults,
                "winner", winner,
                "mutualExclusion", acquiredCount == 1
        ));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }
}
