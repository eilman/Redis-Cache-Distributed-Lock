package com.redis.advanced.service;

import com.redis.advanced.model.DemoResult;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

@Service
public class RedlockService {

    private static final Logger log = LoggerFactory.getLogger(RedlockService.class);
    private static final int NODE_COUNT = 3;
    private static final String LOCK_PREFIX = "redlock:node";

    private final RedissonClient redissonClient;

    public RedlockService(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    public DemoResult acquireRedlock(String resource, long leaseTimeMs, long waitTimeMs) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        // Step 1: Record start time
        result.addLog(1, "START_TIME", "T1 = " + System.currentTimeMillis(), 0);

        // Step 2: Attempt lock on each "node"
        RLock[] locks = new RLock[NODE_COUNT];
        boolean[] nodeResults = new boolean[NODE_COUNT];
        List<Map<String, Object>> nodeDetails = new ArrayList<>();

        for (int i = 0; i < NODE_COUNT; i++) {
            String lockKey = LOCK_PREFIX + (i + 1) + ":" + resource;
            locks[i] = redissonClient.getLock(lockKey);
            long nodeStart = System.currentTimeMillis();
            try {
                nodeResults[i] = locks[i].tryLock(waitTimeMs / NODE_COUNT, leaseTimeMs, TimeUnit.MILLISECONDS);
            } catch (Exception e) {
                nodeResults[i] = false;
            }
            long nodeDuration = System.currentTimeMillis() - nodeStart;

            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("node", i + 1);
            detail.put("lockKey", lockKey);
            detail.put("acquired", nodeResults[i]);
            detail.put("durationMs", nodeDuration);
            nodeDetails.add(detail);

            result.addLog(2 + i, "NODE_" + (i + 1), nodeResults[i] ? "ACQUIRED" : "FAILED", nodeDuration);
        }

        // Step 3: Quorum check
        long acquiredCount = 0;
        for (boolean r : nodeResults) if (r) acquiredCount++;
        int quorum = NODE_COUNT / 2 + 1;
        long elapsed = System.currentTimeMillis() - start;
        boolean validityOk = elapsed < leaseTimeMs;
        boolean success = acquiredCount >= quorum && validityOk;

        result.addLog(NODE_COUNT + 2, "QUORUM_CHECK",
                String.format("Acquired %d/%d (need %d), elapsed=%dms, validity=%s",
                        acquiredCount, NODE_COUNT, quorum, elapsed, validityOk ? "OK" : "EXPIRED"), 0);

        if (!success) {
            // Release all locks on failure
            for (int i = 0; i < NODE_COUNT; i++) {
                try { locks[i].forceUnlock(); } catch (Exception ignored) {}
            }
            result.addLog(NODE_COUNT + 3, "RELEASE_ALL", "Quorum not met, released all locks", System.currentTimeMillis() - start);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("resource", resource);
        data.put("success", success);
        data.put("quorumMet", acquiredCount >= quorum);
        data.put("validityOk", validityOk);
        data.put("acquiredNodes", acquiredCount);
        data.put("totalNodes", NODE_COUNT);
        data.put("quorumRequired", quorum);
        data.put("nodeDetails", nodeDetails);
        result.setData(data);
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult releaseRedlock(String resource) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();

        for (int i = 0; i < NODE_COUNT; i++) {
            String lockKey = LOCK_PREFIX + (i + 1) + ":" + resource;
            RLock lock = redissonClient.getLock(lockKey);
            try {
                lock.forceUnlock();
                result.addLog(i + 1, "RELEASE_NODE_" + (i + 1), "Released", System.currentTimeMillis() - start);
            } catch (Exception e) {
                result.addLog(i + 1, "RELEASE_NODE_" + (i + 1), "Error: " + e.getMessage(), System.currentTimeMillis() - start);
            }
        }

        result.setData(Map.of("resource", resource, "released", true));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }

    public DemoResult simulateRedlockScheduledJob(String jobName, int instanceCount) {
        DemoResult result = new DemoResult();
        long start = System.currentTimeMillis();
        List<Map<String, Object>> instanceResults = Collections.synchronizedList(new ArrayList<>());
        CountDownLatch latch = new CountDownLatch(instanceCount);
        ExecutorService executor = Executors.newFixedThreadPool(instanceCount);

        for (int i = 0; i < instanceCount; i++) {
            final int instanceId = i + 1;
            executor.submit(() -> {
                try {
                    DemoResult lockResult = acquireRedlock(jobName, 10000, 5000);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> lockData = (Map<String, Object>) lockResult.getData();
                    boolean acquired = Boolean.TRUE.equals(lockData.get("success"));

                    Map<String, Object> res = new LinkedHashMap<>();
                    res.put("instanceId", instanceId);
                    res.put("acquired", acquired);
                    res.put("acquiredNodes", lockData.get("acquiredNodes"));

                    if (acquired) {
                        Thread.sleep(500); // simulate job work
                        res.put("status", "JOB_EXECUTED");
                        releaseRedlock(jobName);
                    } else {
                        res.put("status", "SKIPPED - Quorum not achieved");
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

        result.setData(Map.of("jobName", jobName, "algorithm", "REDLOCK", "instances", instanceResults));
        result.getMetadata().setExecutionTimeMs(System.currentTimeMillis() - start);
        return result;
    }
}
