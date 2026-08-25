package com.redis.advanced;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.ResilientCacheService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class RedisFailureTest extends BaseRedisTest {

    @Autowired
    private ResilientCacheService resilientCacheService;

    @Test
    @SuppressWarnings("unchecked")
    void testFailOpenReturnsFallbackOnFailure() {
        resilientCacheService.simulateRedisFailure(1);
        DemoResult result = resilientCacheService.getWithFailOpen(1L);
        assertTrue(result.isSuccess());

        Map<String, Object> data = (Map<String, Object>) result.getData();
        assertEquals("DB_FALLBACK", data.get("source"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void testFailCloseReturnsErrorOnFailure() {
        resilientCacheService.simulateRedisFailure(1);
        DemoResult result = resilientCacheService.getWithFailClose(1L);
        assertFalse(result.isSuccess());

        Map<String, Object> data = (Map<String, Object>) result.getData();
        assertNotNull(data.get("error"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void testCircuitBreakerOpensAfterThreshold() {
        // Simulate enough failures to trip the circuit breaker (window=5, threshold=50%)
        resilientCacheService.simulateRedisFailure(10);

        for (int i = 0; i < 5; i++) {
            resilientCacheService.getWithFailOpen(1L);
        }

        DemoResult statusResult = resilientCacheService.getCircuitBreakerStatus();
        Map<String, Object> status = (Map<String, Object>) statusResult.getData();
        String state = (String) status.get("state");

        // After enough failures, CB should be OPEN
        assertTrue("OPEN".equals(state) || "HALF_OPEN".equals(state),
                "Expected OPEN or HALF_OPEN but got: " + state);
    }

    @Test
    @SuppressWarnings("unchecked")
    void testCircuitBreakerResets() {
        // Trip the breaker
        resilientCacheService.simulateRedisFailure(10);
        for (int i = 0; i < 5; i++) {
            resilientCacheService.getWithFailOpen(1L);
        }

        // Reset
        resilientCacheService.resetCircuitBreaker();

        DemoResult statusResult = resilientCacheService.getCircuitBreakerStatus();
        Map<String, Object> status = (Map<String, Object>) statusResult.getData();
        assertEquals("CLOSED", status.get("state"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void testNormalOperationWithoutFailures() {
        // Without simulated failures, should work normally
        DemoResult result = resilientCacheService.getWithFailOpen(1L);
        assertTrue(result.isSuccess());

        Map<String, Object> data = (Map<String, Object>) result.getData();
        // Source should be either CACHE or DB_FALLBACK (first call will be cache miss -> DB)
        assertNotNull(data.get("source"));
    }
}
