package com.redis.advanced.model;

public class CacheEntry {
    private String key;
    private Object value;
    private Long ttlSeconds;

    public CacheEntry() {}

    public CacheEntry(String key, Object value, Long ttlSeconds) {
        this.key = key;
        this.value = value;
        this.ttlSeconds = ttlSeconds;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public Object getValue() { return value; }
    public void setValue(Object value) { this.value = value; }
    public Long getTtlSeconds() { return ttlSeconds; }
    public void setTtlSeconds(Long ttlSeconds) { this.ttlSeconds = ttlSeconds; }
}
