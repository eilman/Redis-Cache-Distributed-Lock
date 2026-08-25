package com.redis.advanced;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.ProblemSimulationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class StampedeTest extends BaseRedisTest {

    @Autowired
    private ProblemSimulationService problemService;

    @Test
    @SuppressWarnings("unchecked")
    void testStampedeShowsMultipleDBHits() {
        DemoResult result = problemService.simulateStampede(1L, 10);
        assertTrue(result.isSuccess());

        Map<String, Object> data = (Map<String, Object>) result.getData();
        int dbHits = ((Number) data.get("dbHits")).intValue();
        // Without mitigation, multiple threads hit DB
        assertTrue(dbHits > 1, "Expected multiple DB hits in stampede, got: " + dbHits);
    }

    @Test
    @SuppressWarnings("unchecked")
    void testStampedeMitigatedShowsSingleDBHit() {
        DemoResult result = problemService.simulateStampedeMitigated(1L, 10);
        assertTrue(result.isSuccess());

        Map<String, Object> data = (Map<String, Object>) result.getData();
        int dbHits = ((Number) data.get("dbHits")).intValue();
        // With mitigation (lock), only 1 thread should hit DB
        assertEquals(1, dbHits, "Expected exactly 1 DB hit with mitigation");
    }

    @Test
    void testPenetrationAlwaysHitsDB() {
        DemoResult result1 = problemService.simulatePenetration("nonexistent:999");
        assertTrue(result1.isSuccess());

        DemoResult result2 = problemService.simulatePenetration("nonexistent:999");
        assertTrue(result2.isSuccess());
        // Both calls should succeed (both hit DB since no caching of null)
    }

    @Test
    void testPenetrationMitigatedCachesNull() {
        // First call: cache miss, caches null
        DemoResult result1 = problemService.simulatePenetrationMitigated("nonexistent:888");
        assertTrue(result1.isSuccess());

        // Second call: should hit the cached null value
        DemoResult result2 = problemService.simulatePenetrationMitigated("nonexistent:888");
        assertTrue(result2.isSuccess());
    }
}
