import { InternalAxiosRequestConfig } from 'axios'
import { delay, randomInt, mockUuid, demoResult } from './helpers'
import * as state from './mockState'

export interface MockResponse {
  status: number
  data: unknown
}

export async function handleMockRequest(config: InternalAxiosRequestConfig): Promise<MockResponse | null> {
  const url = (config.url ?? '').replace(/^\/api\/v1/, '')
  const method = (config.method ?? 'get').toLowerCase()
  const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data ?? {}
  const params = config.params ?? {}

  // --- Cache Operations ---

  if (method === 'get' && url.startsWith('/cache/keys')) {
    const pattern = params.pattern ?? new URLSearchParams(url.split('?')[1]).get('pattern') ?? '*'
    await delay(randomInt(2, 8))
    return ok(state.getCacheKeys(pattern))
  }

  if (method === 'get' && url === '/cache/info') {
    await delay(randomInt(3, 10))
    return ok({
      redis_version: '7.2.0',
      used_memory_human: '2.1M',
      connected_clients: 1,
      uptime_in_seconds: 86400,
      total_commands_processed: state.getMetricsSnapshot().total + 100,
      keyspace_hits: state.getMetricsSnapshot().hits,
      keyspace_misses: state.getMetricsSnapshot().misses,
    })
  }

  if (method === 'get' && /^\/cache\/[^/]+$/.test(url) && !url.includes('/keys')) {
    const key = decodeURIComponent(url.replace('/cache/', ''))
    await delay(randomInt(2, 6))
    const entry = state.getCache(key)
    if (entry) {
      return ok({ value: entry.value, ttl: entry.ttlSeconds })
    }
    return ok({ value: null })
  }

  if (method === 'post' && url === '/cache') {
    const { key, value, ttlSeconds } = body
    state.setCache(key, value, ttlSeconds ?? 300)
    await delay(randomInt(3, 8))
    return ok({ key, ttl: ttlSeconds ?? 300 })
  }

  if (method === 'delete' && url.startsWith('/cache/')) {
    const key = decodeURIComponent(url.replace('/cache/', ''))
    state.deleteCache(key)
    await delay(randomInt(2, 5))
    return ok({ deleted: true })
  }

  // --- Pattern Demos ---

  if (method === 'get' && /^\/demo\/pattern\/cache-aside\/\d+/.test(url)) {
    const productId = extractId(url)
    return await handleCacheAside(productId)
  }

  if (method === 'get' && /^\/demo\/pattern\/read-through\/\d+/.test(url)) {
    const productId = extractId(url)
    return await handleCacheAside(productId) // same response shape
  }

  if (method === 'put' && /^\/demo\/pattern\/write-through\/\d+/.test(url)) {
    const productId = extractId(url)
    const product = state.updateProduct(productId, body)
    if (product) {
      const cacheKey = `product:${productId}`
      state.setCache(cacheKey, JSON.stringify(product), 300, product.category)
    }
    await delay(randomInt(15, 35))
    const execTime = randomInt(15, 35)
    return ok(demoResult(product, 'WRITE_THROUGH', execTime, [
      { step: 1, action: 'DB_UPDATE', result: 'SUCCESS', durationMs: randomInt(10, 20) },
      { step: 2, action: 'CACHE_UPDATE', result: 'SYNCED', durationMs: randomInt(2, 5) },
    ]))
  }

  // --- Problem Demos ---

  if (method === 'post' && url === '/demo/problem/stampede') {
    const { productId, concurrentRequests } = body
    const count = concurrentRequests ?? 10
    await delay(randomInt(100, 300))
    const details = Array.from({ length: count }, (_, i) => ({
      requestId: i + 1,
      source: 'DB',
      durationMs: randomInt(180, 350),
      dbHit: true,
    }))
    return ok(demoResult({
      totalRequests: count,
      dbHits: count,
      cacheHits: 0,
      dbQueryCount: count,
      details,
    }, 'DB', randomInt(200, 400)))
  }

  if (method === 'post' && url === '/demo/problem/stampede/mitigated') {
    const { productId, concurrentRequests } = body
    const count = concurrentRequests ?? 10
    await delay(randomInt(100, 300))
    const details = Array.from({ length: count }, (_, i) => ({
      requestId: i + 1,
      source: i === 0 ? 'DB' : 'CACHE',
      durationMs: i === 0 ? randomInt(180, 280) : randomInt(3, 12),
      dbHit: i === 0,
      waitedForLock: i > 0,
    }))
    return ok(demoResult({
      totalRequests: count,
      dbHits: 1,
      cacheHits: count - 1,
      dbQueryCount: 1,
      details,
    }, 'MITIGATED', randomInt(200, 350)))
  }

  if (method === 'post' && url === '/demo/problem/penetration' && !url.includes('multi') && !url.includes('mitigated')) {
    const { key } = body
    await delay(randomInt(100, 200))
    return ok(demoResult({
      key: key ?? 'nonexistent:product:99999',
      source: 'DB',
      dbHit: true,
      cacheResult: 'MISS',
      nullCached: false,
    }, 'DB', randomInt(150, 250)))
  }

  if (method === 'post' && url === '/demo/problem/penetration/mitigated') {
    const { key } = body
    await delay(randomInt(50, 150))
    return ok(demoResult({
      key: key ?? 'nonexistent:product:99999',
      source: 'CACHE',
      dbHit: false,
      cacheResult: 'HIT (NULL_SENTINEL)',
      nullCached: true,
    }, 'CACHE', randomInt(3, 10)))
  }

  if (method === 'post' && url === '/demo/problem/penetration/multi') {
    const { key, requestCount, useNullCaching } = body
    const count = requestCount ?? 5
    await delay(randomInt(100, 300))
    const requests = Array.from({ length: count }, (_, i) => ({
      requestId: i + 1,
      source: useNullCaching && i > 0 ? 'CACHE' : 'DB',
      cacheResult: useNullCaching && i > 0 ? 'HIT (NULL_SENTINEL)' : 'MISS',
      dbHit: useNullCaching ? i === 0 : true,
      nullCached: useNullCaching && i === 0,
      durationMs: (useNullCaching && i > 0) ? randomInt(2, 8) : randomInt(150, 250),
    }))
    return ok(demoResult({
      key: key ?? 'nonexistent:product:99999',
      totalRequests: count,
      dbHits: useNullCaching ? 1 : count,
      cacheHits: useNullCaching ? count - 1 : 0,
      useNullCaching,
      requests,
    }, useNullCaching ? 'MITIGATED' : 'UNPROTECTED', randomInt(150, 350)))
  }

  if (method === 'post' && url === '/demo/problem/stale-data' && !url.includes('fix')) {
    const { productName, originalPrice, newPrice, ttlSeconds } = body
    await delay(randomInt(50, 150))
    return ok(demoResult({
      cachePrice: originalPrice,
      dbPrice: newPrice,
      isStale: true,
      remainingTTL: ttlSeconds,
      priceDifference: Math.abs(newPrice - originalPrice),
      productName,
    }, 'STALE', randomInt(50, 100)))
  }

  if (method === 'post' && url === '/demo/problem/stale-data/fix') {
    const { productName } = body
    await delay(randomInt(30, 80))
    return ok(demoResult({
      invalidated: true,
      cacheSynced: true,
      isStale: false,
      cachePrice: 54999.99,
      dbPrice: 54999.99,
      priceDifference: 0,
      productName,
    }, 'FIXED', randomInt(20, 50)))
  }

  // --- TTL Demos ---

  if (method === 'get' && /^\/demo\/ttl\/fixed\/\d+/.test(url)) {
    const productId = extractId(url)
    const ttl = parseInt(new URLSearchParams(url.split('?')[1]).get('ttl') ?? '60')
    const product = state.getProduct(productId)
    if (product) state.setCache(`product:${productId}`, JSON.stringify(product), ttl, product.category)
    await delay(randomInt(5, 15))
    return ok(demoResult(product, 'FIXED_TTL', randomInt(5, 15), [
      { step: 1, action: 'SET', result: `TTL=${ttl}s`, durationMs: randomInt(2, 5) },
    ]))
  }

  if (method === 'get' && /^\/demo\/ttl\/dynamic\/\d+/.test(url)) {
    const productId = extractId(url)
    const product = state.getProduct(productId)
    const ttl = dynamicTTL(product?.category)
    if (product) state.setCache(`product:${productId}`, JSON.stringify(product), ttl, product.category)
    await delay(randomInt(5, 15))
    return ok(demoResult({ ...product, ttl }, 'DYNAMIC_TTL', randomInt(5, 15)))
  }

  if (method === 'get' && /^\/demo\/ttl\/jittered\/\d+/.test(url)) {
    const productId = extractId(url)
    const qs = new URLSearchParams(url.split('?')[1])
    const baseTTL = parseInt(qs.get('baseTTL') ?? '60')
    const jitterRange = parseInt(qs.get('jitterRange') ?? '15')
    const product = state.getProduct(productId)
    const ttl = baseTTL + randomInt(0, jitterRange)
    if (product) state.setCache(`product:${productId}`, JSON.stringify(product), ttl, product.category)
    await delay(randomInt(5, 15))
    return ok(demoResult({ ...product, ttl }, 'JITTERED_TTL', randomInt(5, 15)))
  }

  if (method === 'post' && url === '/demo/ttl/batch-demo') {
    const { strategy, baseTTL = 60, jitterRange = 15, keyCount = 10 } = body
    await delay(randomInt(20, 60))
    const categories = ['electronics', 'books', 'clothing', 'accessories']
    const keys = Array.from({ length: keyCount }, (_, i) => {
      const cat = categories[i % categories.length]
      let ttlSeconds: number
      switch (strategy) {
        case 'FIXED': ttlSeconds = baseTTL; break
        case 'DYNAMIC': ttlSeconds = dynamicTTL(cat); break
        case 'JITTERED': ttlSeconds = baseTTL + randomInt(0, jitterRange); break
        default: ttlSeconds = baseTTL
      }
      return { key: `product:batch:${i + 1}`, ttlSeconds, category: cat }
    })
    return ok({ keys })
  }

  // --- Lock Operations ---

  if (method === 'post' && url === '/lock/acquire') {
    const { lockName, leaseTimeMs = 10000, waitTimeMs = 5000 } = body
    await delay(randomInt(10, 30))
    const result = state.acquireLock(lockName, leaseTimeMs)
    return ok(demoResult({
      acquired: result.locked,
      locked: result.locked,
      success: result.locked,
      ownerId: result.ownerId,
      uuid: result.ownerId,
      lockValue: result.ownerId,
      lockName,
      leaseTimeMs,
      message: result.locked ? 'Lock acquired successfully' : 'Lock already held',
    }, 'LOCK', randomInt(8, 25)))
  }

  if (method === 'post' && url === '/lock/release') {
    const { lockName } = body
    await delay(randomInt(3, 10))
    const result = state.releaseLock(lockName)
    return ok(demoResult({
      released: result.released,
      lockName,
      message: result.released ? 'Lock released' : 'Lock not found',
    }, 'LOCK', randomInt(3, 8)))
  }

  if (method === 'get' && /^\/lock\/[^/]+\/status$/.test(url)) {
    const lockName = decodeURIComponent(url.replace('/lock/', '').replace('/status', ''))
    await delay(randomInt(2, 6))
    const status = state.getLockStatus(lockName)
    return ok(demoResult({
      locked: status.locked,
      owner: status.owner,
      remainingLeaseTimeMs: status.remainingLeaseTimeMs,
      lockName,
    }, 'LOCK', randomInt(2, 5)))
  }

  if (method === 'post' && url === '/lock/demo/mechanics/try-set-nx') {
    const { key, uuid, pxMs } = body
    await delay(randomInt(5, 15))
    const existing = state.getLockStatus(key)
    if (existing.locked) {
      return ok(demoResult({
        command: `SET ${key} ${uuid} NX PX ${pxMs}`,
        result: 'nil',
        acquired: false,
        key,
        currentOwner: existing.owner,
        remainingTtlMs: existing.remainingLeaseTimeMs,
      }, 'REDIS', randomInt(3, 8)))
    }
    const result = state.acquireLock(key, pxMs)
    return ok(demoResult({
      command: `SET ${key} ${uuid} NX PX ${pxMs}`,
      result: 'OK',
      acquired: true,
      key,
      value: uuid,
      ttlMs: pxMs,
    }, 'REDIS', randomInt(3, 8)))
  }

  if (method === 'post' && url === '/lock/demo/mechanics/check') {
    const { key } = body
    await delay(randomInt(2, 6))
    const status = state.getLockStatus(key)
    return ok(demoResult({
      key,
      exists: status.locked,
      value: status.owner ?? null,
      ttlMs: status.remainingLeaseTimeMs,
    }, 'REDIS', randomInt(2, 5)))
  }

  if (method === 'post' && url === '/lock/demo/mechanics/release') {
    const { key, uuid } = body
    await delay(randomInt(3, 8))
    const status = state.getLockStatus(key)
    if (!status.locked) {
      return ok(demoResult({
        released: false,
        reason: 'Key does not exist',
        key,
        yourUuid: uuid,
      }, 'REDIS', randomInt(2, 5)))
    }
    if (status.owner === uuid) {
      state.releaseLock(key)
      return ok(demoResult({
        released: true,
        reason: 'Owner verified, lock released',
        key,
        yourUuid: uuid,
        owner: uuid,
      }, 'REDIS', randomInt(2, 5)))
    }
    return ok(demoResult({
      released: false,
      reason: 'UUID mismatch - not the lock owner',
      key,
      yourUuid: uuid,
      actualOwner: status.owner,
    }, 'REDIS', randomInt(2, 5)))
  }

  if (method === 'post' && url === '/lock/demo/mechanics/race') {
    const { key, pxMs } = body
    await delay(randomInt(20, 50))
    const uuidA = mockUuid()
    const uuidB = mockUuid()
    const winnerIsA = Math.random() > 0.5
    state.releaseLock(key)
    state.acquireLock(key, pxMs ?? 10000)
    return ok(demoResult({
      key,
      podResults: [
        { pod: 'Pod-A', uuid: uuidA, command: `SET ${key} ${uuidA} NX PX ${pxMs}`, acquired: winnerIsA, result: winnerIsA ? 'OK' : 'nil', durationMs: randomInt(3, 8) },
        { pod: 'Pod-B', uuid: uuidB, command: `SET ${key} ${uuidB} NX PX ${pxMs}`, acquired: !winnerIsA, result: !winnerIsA ? 'OK' : 'nil', durationMs: randomInt(3, 8) },
      ],
      winner: winnerIsA ? 'Pod-A' : 'Pod-B',
      mutualExclusion: true,
    }, 'REDIS', randomInt(15, 40)))
  }

  if (method === 'post' && url === '/lock/demo/scheduled-job') {
    const { jobName, instanceCount = 3 } = body
    await delay(randomInt(50, 150))
    const winnerIdx = randomInt(0, instanceCount - 1)
    const instances = Array.from({ length: instanceCount }, (_, i) => ({
      instanceName: `Instance-${i + 1}`,
      acquired: i === winnerIdx,
      executionResult: i === winnerIdx ? 'Job executed successfully' : 'Could not acquire lock',
      durationMs: randomInt(10, 50),
    }))
    return ok(demoResult({
      jobName,
      instances,
      executedBy: `Instance-${winnerIdx + 1}`,
    }, 'LOCK', randomInt(50, 100)))
  }

  // --- Redlock ---

  if (method === 'post' && url === '/demo/redlock/acquire') {
    const { resource, leaseTimeMs = 10000 } = body
    await delay(randomInt(20, 60))
    const ownerId = mockUuid()
    const acquiredNodes = randomInt(2, 3)
    return ok({
      locked: true,
      success: true,
      ownerId,
      lockValue: ownerId,
      uuid: ownerId,
      quorumMet: true,
      validityOk: true,
      acquiredNodes,
      totalNodes: 3,
      quorumRequired: 2,
      resource,
      leaseTimeMs,
      message: `Redlock acquired on ${acquiredNodes}/3 nodes`,
      nodeDetails: Array.from({ length: 3 }, (_, i) => ({
        node: `redis-node-${i + 1}`,
        acquired: i < acquiredNodes,
        latencyMs: randomInt(3, 15),
      })),
    })
  }

  if (method === 'post' && url === '/demo/redlock/release') {
    const { resource } = body
    await delay(randomInt(5, 15))
    return ok({ released: true, resource })
  }

  if (method === 'post' && url === '/demo/redlock/scheduled-job') {
    const { jobName, instanceCount = 3 } = body
    await delay(randomInt(50, 150))
    const winnerIdx = randomInt(0, instanceCount - 1)
    const winnerName = `Pod-${winnerIdx + 1}`
    return ok({
      acquiredBy: winnerName,
      winner: winnerName,
      podName: winnerName,
      jobName,
      instances: Array.from({ length: instanceCount }, (_, i) => ({
        pod: `Pod-${i + 1}`,
        acquired: i === winnerIdx,
        executionResult: i === winnerIdx ? 'Job executed' : 'Waiting',
      })),
    })
  }

  // --- Resilience ---

  if (method === 'get' && /^\/demo\/resilience\/fail-open\/\d+/.test(url)) {
    const productId = extractId(url)
    await delay(randomInt(20, 80))
    const product = state.getProduct(productId) ?? state.getProduct(1)
    if (state.isRedisDown()) {
      state.setCbState('HALF_OPEN')
      return ok({
        source: 'DB_FALLBACK',
        data: product,
        message: 'Redis unavailable, served from DB fallback',
        strategy: 'FAIL_OPEN',
      })
    }
    return ok({ source: 'CACHE', data: product })
  }

  if (method === 'get' && /^\/demo\/resilience\/fail-close\/\d+/.test(url)) {
    await delay(randomInt(10, 30))
    if (state.isRedisDown()) {
      return {
        status: 503,
        data: {
          error: 'ServiceUnavailableException: Redis connection failed',
          message: 'Siparis REDDEDILDI - veri tutarliligi oncelikli',
          strategy: 'FAIL_CLOSE',
        },
      }
    }
    const productId = extractId(url)
    const product = state.getProduct(productId) ?? state.getProduct(1)
    return ok({ source: 'CACHE', data: product })
  }

  if (method === 'get' && url === '/demo/resilience/circuit-breaker/status') {
    await delay(randomInt(2, 5))
    const cb = state.getCircuitBreaker()
    return ok({
      state: cb.state,
      failureRate: cb.failureCount > 0 ? 100 : 0,
      numberOfSuccessfulCalls: cb.successCount,
      numberOfFailedCalls: cb.failureCount,
      numberOfNotPermittedCalls: cb.state === 'OPEN' ? 3 : 0,
      remainingSimulatedFailures: cb.failureCount,
    })
  }

  if (method === 'post' && url === '/demo/resilience/simulate-failure') {
    const { failureCount = 5 } = body
    state.simulateFailure(failureCount)
    await delay(randomInt(10, 30))
    return ok({ message: `Redis simulated failure triggered (${failureCount} failures)` })
  }

  if (method === 'post' && url === '/demo/resilience/reset') {
    state.resetCircuitBreaker()
    await delay(randomInt(5, 15))
    return ok({ message: 'System restored, circuit breaker reset' })
  }

  // --- Metrics ---

  if (method === 'get' && url === '/metrics/snapshot') {
    await delay(randomInt(2, 8))
    const snap = state.getMetricsSnapshot()
    return ok({
      data: snap,
      hits: snap.hits,
      hitCount: snap.hits,
      misses: snap.misses,
      missCount: snap.misses,
      total: snap.total,
      hitRate: snap.hitRate,
      hitRatio: snap.hitRate,
      avgLatencyMs: snap.avgLatencyMs,
      averageLatency: snap.avgLatencyMs,
      usedMemory: snap.usedMemory,
      maxMemory: snap.maxMemory,
    })
  }

  if (method === 'get' && url.startsWith('/metrics/history')) {
    const seconds = parseInt(new URLSearchParams(url.split('?')[1]).get('seconds') ?? '60')
    await delay(randomInt(3, 10))
    const realHistory = state.getMetricsHistory(seconds)
    if (realHistory.length > 0) return ok(realHistory)
    // Generate synthetic data if no real history
    const now = Date.now()
    const points = Array.from({ length: 20 }, (_, i) => ({
      timestamp: now - (20 - i) * 3000,
      latencyMs: randomInt(2, 15),
      avgLatencyMs: randomInt(3, 12),
      p50: randomInt(3, 8),
      type: Math.random() > 0.3 ? 'HIT' : 'MISS',
    }))
    return ok(points)
  }

  if (method === 'get' && url === '/metrics/prometheus-summary') {
    await delay(randomInt(3, 10))
    const snap = state.getMetricsSnapshot()
    return ok({
      data: {
        cacheHitsTotal: snap.hits,
        cacheMissesTotal: snap.misses,
        cacheEvictionsTotal: snap.evictions,
        hitRate: snap.hitRate,
        latencyMs: { p50: 4.2, p95: 12.8, p99: 28.5, max: 45.1 },
      },
      p50: 4.2,
      p95: 12.8,
      p99: 28.5,
      max: 45.1,
      percentiles: { p50: 4.2, p95: 12.8, p99: 28.5, max: 45.1 },
      totalOperations: snap.total || 150,
      total: snap.total || 150,
    })
  }

  // --- Test ---

  if (method === 'post' && url === '/test/concurrent/reads') {
    const { threadCount = 20, productId = 1 } = body
    await delay(randomInt(50, 200))
    return ok(demoResult({
      threadCount,
      avgLatencyMs: randomInt(3, 12),
      allHits: true,
      details: Array.from({ length: threadCount }, (_, i) => ({
        threadName: `Thread-${i + 1}`,
        source: 'CACHE',
        latencyMs: randomInt(2, 15),
      })),
    }, 'TEST', randomInt(50, 150)))
  }

  if (method === 'post' && url === '/test/concurrent/locks') {
    const { threadCount = 5, lockName } = body
    await delay(randomInt(50, 200))
    const winnerIdx = randomInt(0, threadCount - 1)
    const results = Array.from({ length: threadCount }, (_, i) => ({
      threadName: `Thread-${i + 1}`,
      acquired: i === winnerIdx,
      success: i === winnerIdx,
      lockAcquired: i === winnerIdx,
      waitTimeMs: i === winnerIdx ? randomInt(2, 10) : randomInt(50, 200),
      holdTimeMs: i === winnerIdx ? randomInt(100, 500) : 0,
      totalTimeMs: randomInt(50, 600),
    }))
    return ok({
      threadCount,
      acquiredCount: 1,
      mutualExclusion: true,
      results,
    })
  }

  if (method === 'post' && url === '/test/failure/simulate-disconnect') {
    state.simulateFailure(5)
    await delay(randomInt(10, 30))
    return ok(demoResult({ status: 'REDIS_DISCONNECTED' }, 'TEST', randomInt(10, 20)))
  }

  if (method === 'post' && url === '/test/failure/restore') {
    state.resetCircuitBreaker()
    await delay(randomInt(5, 15))
    return ok(demoResult({ status: 'RESTORED' }, 'TEST', randomInt(5, 10)))
  }

  // --- Unmatched ---
  console.warn('[MockHandler] Unmatched request:', method.toUpperCase(), url)
  return null
}

// --- Helpers ---

function ok(data: unknown): MockResponse {
  return { status: 200, data }
}

function extractId(url: string): number {
  const match = url.match(/\/(\d+)/)
  return match ? parseInt(match[1]) : 1
}

async function handleCacheAside(productId: number): Promise<MockResponse> {
  const cacheKey = `product:${productId}`
  const cached = state.getCache(cacheKey)

  if (cached) {
    const execTime = randomInt(2, 8)
    await delay(execTime)
    state.recordHit(execTime)
    const product = JSON.parse(cached.value)
    return ok(demoResult(product, 'CACHE', execTime, [
      { step: 1, action: 'CACHE_CHECK', result: 'HIT', durationMs: randomInt(1, 3) },
      { step: 2, action: 'RETURN_CACHED', result: 'OK', durationMs: randomInt(1, 2) },
    ]))
  }

  const product = state.getProduct(productId)
  const dbTime = randomInt(120, 280)
  await delay(dbTime)
  state.recordMiss(dbTime)
  if (product) {
    state.setCache(cacheKey, JSON.stringify(product), 300, product.category)
  }
  return ok(demoResult(product, 'DB', dbTime, [
    { step: 1, action: 'CACHE_CHECK', result: 'MISS', durationMs: randomInt(1, 3) },
    { step: 2, action: 'DB_QUERY', result: 'FOUND', durationMs: randomInt(100, 200) },
    { step: 3, action: 'CACHE_POPULATE', result: 'SET (TTL=300s)', durationMs: randomInt(2, 5) },
  ]))
}

function dynamicTTL(category?: string): number {
  switch (category) {
    case 'electronics': return 30
    case 'books': return 300
    case 'clothing': return 120
    default: return 60
  }
}
