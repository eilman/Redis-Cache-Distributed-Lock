package com.redis.advanced;

import com.redis.advanced.service.CacheService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class CacheOperationTest extends BaseRedisTest {

    @Autowired
    private CacheService cacheService;

    @Test
    void testSetAndGet() {
        cacheService.setValue("test:key", "hello", 60L);
        var result = cacheService.getValue("test:key");
        assertTrue(result.isSuccess());
        assertEquals("hello", result.getData());
    }

    @Test
    void testDelete() {
        cacheService.setValue("test:del", "value", 60L);
        assertNotNull(cacheService.getValue("test:del").getData());

        cacheService.deleteKey("test:del");
        assertNull(cacheService.getValue("test:del").getData());
    }

    @Test
    void testTTLExpiry() throws InterruptedException {
        cacheService.setValue("test:ttl", "expires-soon", 2L);
        assertNotNull(cacheService.getValue("test:ttl").getData());

        Thread.sleep(2500);
        assertNull(cacheService.getValue("test:ttl").getData());
    }

    @Test
    void testGetKeys() {
        cacheService.setValue("test:cache:1", "a", 60L);
        cacheService.setValue("test:cache:2", "b", 60L);
        cacheService.setValue("test:cache:3", "c", 60L);

        var result = cacheService.getKeys("test:cache:*");
        assertTrue(result.isSuccess());
        @SuppressWarnings("unchecked")
        var keys = (java.util.Set<String>) result.getData();
        assertEquals(3, keys.size());
    }

    @Test
    void testSetWithoutTTL() {
        cacheService.setValue("test:no-ttl", "persistent", null);
        assertEquals("persistent", cacheService.getValue("test:no-ttl").getData());

        Long ttl = redisTemplate.getExpire("test:no-ttl", TimeUnit.SECONDS);
        assertTrue(ttl == null || ttl == -1);
    }
}
