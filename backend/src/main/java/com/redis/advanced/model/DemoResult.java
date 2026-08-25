package com.redis.advanced.model;

import java.util.ArrayList;
import java.util.List;

public class DemoResult {
    private boolean success;
    private Object data;
    private Metadata metadata;
    private List<LogEntry> logs = new ArrayList<>();

    public DemoResult() {
        this.success = true;
        this.metadata = new Metadata();
    }

    public static DemoResult ok(Object data) {
        DemoResult r = new DemoResult();
        r.setData(data);
        return r;
    }

    public static DemoResult error(String message) {
        DemoResult r = new DemoResult();
        r.setSuccess(false);
        r.setData(message);
        return r;
    }

    public DemoResult addLog(int step, String action, String result, long durationMs) {
        logs.add(new LogEntry(step, action, result, durationMs));
        return this;
    }

    // Getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
    public Metadata getMetadata() { return metadata; }
    public void setMetadata(Metadata metadata) { this.metadata = metadata; }
    public List<LogEntry> getLogs() { return logs; }
    public void setLogs(List<LogEntry> logs) { this.logs = logs; }

    public static class Metadata {
        private long executionTimeMs;
        private String source;

        public long getExecutionTimeMs() { return executionTimeMs; }
        public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }
        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
    }

    public static class LogEntry {
        private int step;
        private String action;
        private String result;
        private long durationMs;

        public LogEntry() {}

        public LogEntry(int step, String action, String result, long durationMs) {
            this.step = step;
            this.action = action;
            this.result = result;
            this.durationMs = durationMs;
        }

        public int getStep() { return step; }
        public void setStep(int step) { this.step = step; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }
        public long getDurationMs() { return durationMs; }
        public void setDurationMs(long durationMs) { this.durationMs = durationMs; }
    }
}
