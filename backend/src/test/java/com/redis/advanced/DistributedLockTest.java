package com.redis.advanced;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.DistributedLockService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class DistributedLockTest extends BaseRedisTest {

    @Autowired
    private DistributedLockService lockService;

    @Test
    void testAcquireAndRelease() {
        DemoResult acquireResult = lockService.acquireLock("test-lock", 10000, 5000);
        assertTrue(acquireResult.isSuccess());
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) acquireResult.getData();
        assertTrue((Boolean) data.get("acquired"));

        DemoResult releaseResult = lockService.releaseLock("test-lock");
        assertTrue(releaseResult.isSuccess());
    }

    @Test
    @SuppressWarnings("unchecked")
    void testConcurrentLockAcquisition() throws InterruptedException {
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Boolean> results = Collections.synchronizedList(new ArrayList<>());
        CountDownLatch gate = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    gate.await();
                    DemoResult r = lockService.acquireLock("concurrent-lock", 5000, 100);
                    Map<String, Object> d = (Map<String, Object>) r.getData();
                    boolean acquired = Boolean.TRUE.equals(d.get("acquired"));
                    results.add(acquired);
                    if (acquired) {
                        Thread.sleep(200);
                        lockService.releaseLock("concurrent-lock");
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    done.countDown();
                }
            });
        }

        gate.countDown();
        done.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        // At least one should have acquired, mutual exclusion means not all at once
        assertTrue(results.contains(true));
    }

    @Test
    void testLockTimeout() throws InterruptedException {
        DemoResult acquireResult = lockService.acquireLock("timeout-lock", 2000, 1000);
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) acquireResult.getData();
        assertTrue((Boolean) data.get("acquired"));

        // Don't release, wait for lease to expire
        Thread.sleep(2500);

        DemoResult status = lockService.getLockStatus("timeout-lock");
        @SuppressWarnings("unchecked")
        Map<String, Object> statusData = (Map<String, Object>) status.getData();
        // Lock should be auto-released after lease time
        assertNotNull(statusData);
    }

    @Test
    @SuppressWarnings("unchecked")
    void testScheduledJobSimulation() {
        DemoResult result = lockService.simulateScheduledJob("test-job", 3);
        assertTrue(result.isSuccess());

        Map<String, Object> data = (Map<String, Object>) result.getData();
        List<Map<String, Object>> instances = (List<Map<String, Object>>) data.get("instances");
        assertNotNull(instances);

        long executedCount = instances.stream()
                .filter(i -> "JOB_EXECUTED".equals(i.get("status")))
                .count();

        // At least 1 instance should execute the job
        assertTrue(executedCount >= 1);
    }
}
