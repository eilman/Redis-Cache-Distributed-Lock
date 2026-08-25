package com.redis.advanced.controller;

import com.redis.advanced.model.DemoResult;
import com.redis.advanced.service.MetricsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/metrics")
public class MetricsController {

    private final MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/snapshot")
    public DemoResult snapshot() {
        return metricsService.getSnapshot();
    }

    @GetMapping("/history")
    public DemoResult history(@RequestParam(defaultValue = "60") int seconds) {
        return metricsService.getHistory(seconds);
    }

    @GetMapping("/prometheus-summary")
    public DemoResult prometheusSummary() {
        return metricsService.getPrometheusMetrics();
    }
}
