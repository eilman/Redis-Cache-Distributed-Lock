import client from './client'

export const cacheApi = {
  getKeys: (pattern = '*') => client.get(`/cache/keys?pattern=${pattern}`),
  getValue: (key: string) => client.get(`/cache/${key}`),
  setValue: (key: string, value: string, ttlSeconds?: number) =>
    client.post('/cache', { key, value, ttlSeconds }),
  deleteKey: (key: string) => client.delete(`/cache/${key}`),
  getInfo: () => client.get('/cache/info'),
}

export const patternApi = {
  cacheAside: (productId: number) => client.get(`/demo/pattern/cache-aside/${productId}`),
  readThrough: (productId: number) => client.get(`/demo/pattern/read-through/${productId}`),
  writeThrough: (productId: number, updates: Record<string, unknown>) =>
    client.put(`/demo/pattern/write-through/${productId}`, updates),
}

export const problemApi = {
  stampede: (productId: number, concurrentRequests: number) =>
    client.post('/demo/problem/stampede', { productId, concurrentRequests }),
  stampedeMitigated: (productId: number, concurrentRequests: number) =>
    client.post('/demo/problem/stampede/mitigated', { productId, concurrentRequests }),
  penetration: (key: string) => client.post('/demo/problem/penetration', { key }),
  penetrationMitigated: (key: string) =>
    client.post('/demo/problem/penetration/mitigated', { key }),
  penetrationMulti: (key: string, requestCount: number, useNullCaching: boolean) =>
    client.post('/demo/problem/penetration/multi', { key, requestCount, useNullCaching }),
  staleData: (productName: string, originalPrice: number, newPrice: number, ttlSeconds: number) =>
    client.post('/demo/problem/stale-data', { productName, originalPrice, newPrice, ttlSeconds }),
  staleDataFix: (productName: string) =>
    client.post('/demo/problem/stale-data/fix', { productName }),
}

export const metricsApi = {
  snapshot: () => client.get('/metrics/snapshot'),
  history: (seconds = 60) => client.get(`/metrics/history?seconds=${seconds}`),
  prometheusSummary: () => client.get('/metrics/prometheus-summary'),
}

export const ttlDemoApi = {
  fixed: (productId: number, ttl = 60) =>
    client.get(`/demo/ttl/fixed/${productId}?ttl=${ttl}`),
  dynamic: (productId: number) =>
    client.get(`/demo/ttl/dynamic/${productId}`),
  jittered: (productId: number, baseTTL = 60, jitterRange = 15) =>
    client.get(`/demo/ttl/jittered/${productId}?baseTTL=${baseTTL}&jitterRange=${jitterRange}`),
  batchDemo: (strategy: string, baseTTL = 60, jitterRange = 15, keyCount = 10) =>
    client.post('/demo/ttl/batch-demo', { strategy, baseTTL, jitterRange, keyCount }),
}

export const resilienceApi = {
  failOpen: (productId: number) => client.get(`/demo/resilience/fail-open/${productId}`),
  failClose: (productId: number) => client.get(`/demo/resilience/fail-close/${productId}`),
  circuitBreakerStatus: () => client.get('/demo/resilience/circuit-breaker/status'),
  simulateFailure: (failureCount = 5) => client.post('/demo/resilience/simulate-failure', { failureCount }),
  reset: () => client.post('/demo/resilience/reset'),
}

export const testApi = {
  concurrentReads: (threadCount: number, productId: number) =>
    client.post('/test/concurrent/reads', { threadCount, productId }),
  concurrentLocks: (threadCount: number, lockName: string) =>
    client.post('/test/concurrent/locks', { threadCount, lockName }),
  simulateDisconnect: () => client.post('/test/failure/simulate-disconnect'),
  restore: () => client.post('/test/failure/restore'),
}
