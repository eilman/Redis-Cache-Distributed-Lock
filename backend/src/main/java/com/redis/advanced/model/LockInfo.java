package com.redis.advanced.model;

public class LockInfo {
    private String lockName;
    private boolean locked;
    private String owner;
    private long remainingLeaseTimeMs;

    public LockInfo() {}

    public LockInfo(String lockName, boolean locked, String owner, long remainingLeaseTimeMs) {
        this.lockName = lockName;
        this.locked = locked;
        this.owner = owner;
        this.remainingLeaseTimeMs = remainingLeaseTimeMs;
    }

    public String getLockName() { return lockName; }
    public void setLockName(String lockName) { this.lockName = lockName; }
    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
    public long getRemainingLeaseTimeMs() { return remainingLeaseTimeMs; }
    public void setRemainingLeaseTimeMs(long remainingLeaseTimeMs) { this.remainingLeaseTimeMs = remainingLeaseTimeMs; }
}
