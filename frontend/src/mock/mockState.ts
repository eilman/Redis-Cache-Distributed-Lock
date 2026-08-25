import { mockUuid, matchGlob } from './helpers'

// --- Types ---

interface CacheEntry {
  value: string
  ttlSeconds: number
  createdAt: number
  category?: string
}

interface LockEntry {
  ownerId: string
  leaseTimeMs: number
  acquiredAt: number
}

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  successCount: number
  isRedisDown: boolean
}

interface Metrics {
  hitCount: number
  missCount: number
  totalRequests: number
  evictions: number
  latencyHistory: Array<{ timestamp: number; latencyMs: number; type: string }>
}

export interface ProductRecord {
  id: number
  name: string
  price: number
  category: string
  stock: number
  description?: string
}

// --- In-Memory State ---

const cache = new Map<string, CacheEntry>()
const locks = new Map<string, LockEntry>()

const circuitBreaker: CircuitBreakerState = {
  state: 'CLOSED',
  failureCount: 0,
  successCount: 0,
  isRedisDown: false,
}

const metrics: Metrics = {
  hitCount: 0,
  missCount: 0,
  totalRequests: 0,
  evictions: 0,
  latencyHistory: [],
}

const productDb = new Map<number, ProductRecord>([
  [1, { id: 1, name: 'MacBook Pro 16"', price: 74999.99, category: 'electronics', stock: 50, description: 'Apple MacBook Pro M4' }],
  [2, { id: 2, name: 'iPhone 15 Pro', price: 54999.99, category: 'electronics', stock: 120, description: 'Apple iPhone 15 Pro' }],
  [3, { id: 3, name: 'Sony WH-1000XM5', price: 9499.99, category: 'electronics', stock: 200, description: 'Noise cancelling kulaklik' }],
  [4, { id: 4, name: 'Clean Code', price: 149.99, category: 'books', stock: 500, description: 'Robert C. Martin' }],
  [5, { id: 5, name: 'Redis in Action', price: 199.99, category: 'books', stock: 300, description: 'Josiah Carlson' }],
  [42, { id: 42, name: 'RTX 5090 (Flash Sale)', price: 39999, category: 'electronics', stock: 3, description: 'NVIDIA RTX 5090' }],
])

// --- Cache Operations ---

export function getCache(key: string): CacheEntry | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.createdAt > entry.ttlSeconds * 1000) {
    cache.delete(key)
    return null
  }
  return entry
}

export function setCache(key: string, value: string, ttlSeconds: number, category?: string): void {
  cache.set(key, { value, ttlSeconds, createdAt: Date.now(), category })
}

export function deleteCache(key: string): boolean {
  return cache.delete(key)
}

export function getCacheKeys(pattern: string): string[] {
  const keys: string[] = []
  for (const [key, entry] of cache.entries()) {
    if (Date.now() - entry.createdAt > entry.ttlSeconds * 1000) {
      cache.delete(key)
      continue
    }
    if (matchGlob(pattern, key)) keys.push(key)
  }
  return keys
}

export function clearCache(): void {
  cache.clear()
}

// --- Lock Operations ---

function cleanExpiredLock(lockName: string): void {
  const entry = locks.get(lockName)
  if (entry && Date.now() - entry.acquiredAt > entry.leaseTimeMs) {
    locks.delete(lockName)
  }
}

export function acquireLock(lockName: string, leaseTimeMs: number): { locked: boolean; ownerId: string } {
  cleanExpiredLock(lockName)
  if (locks.has(lockName)) {
    return { locked: false, ownerId: '' }
  }
  const ownerId = mockUuid()
  locks.set(lockName, { ownerId, leaseTimeMs, acquiredAt: Date.now() })
  return { locked: true, ownerId }
}

export function releaseLock(lockName: string): { released: boolean } {
  const had = locks.delete(lockName)
  return { released: had }
}

export function getLockStatus(lockName: string): { locked: boolean; owner: string | null; remainingLeaseTimeMs: number } {
  cleanExpiredLock(lockName)
  const entry = locks.get(lockName)
  if (!entry) return { locked: false, owner: null, remainingLeaseTimeMs: 0 }
  const remaining = Math.max(0, entry.leaseTimeMs - (Date.now() - entry.acquiredAt))
  return { locked: true, owner: entry.ownerId, remainingLeaseTimeMs: remaining }
}

// --- Circuit Breaker ---

export function getCircuitBreaker() {
  return { ...circuitBreaker }
}

export function simulateFailure(count: number) {
  circuitBreaker.isRedisDown = true
  circuitBreaker.failureCount = count
  circuitBreaker.state = 'OPEN'
}

export function resetCircuitBreaker() {
  circuitBreaker.state = 'CLOSED'
  circuitBreaker.failureCount = 0
  circuitBreaker.successCount = 0
  circuitBreaker.isRedisDown = false
}

export function isRedisDown(): boolean {
  return circuitBreaker.isRedisDown
}

export function setCbState(state: 'CLOSED' | 'OPEN' | 'HALF_OPEN') {
  circuitBreaker.state = state
}

// --- Metrics ---

export function recordHit(latencyMs: number = 5) {
  metrics.hitCount++
  metrics.totalRequests++
  metrics.latencyHistory.push({ timestamp: Date.now(), latencyMs, type: 'HIT' })
  if (metrics.latencyHistory.length > 1000) metrics.latencyHistory.shift()
}

export function recordMiss(latencyMs: number = 200) {
  metrics.missCount++
  metrics.totalRequests++
  metrics.latencyHistory.push({ timestamp: Date.now(), latencyMs, type: 'MISS' })
  if (metrics.latencyHistory.length > 1000) metrics.latencyHistory.shift()
}

export function getMetricsSnapshot() {
  const total = metrics.hitCount + metrics.missCount
  return {
    hits: metrics.hitCount,
    misses: metrics.missCount,
    total,
    hitRate: total > 0 ? +(metrics.hitCount / total * 100).toFixed(1) : 0,
    avgLatencyMs: metrics.latencyHistory.length > 0
      ? +(metrics.latencyHistory.reduce((s, e) => s + e.latencyMs, 0) / metrics.latencyHistory.length).toFixed(1)
      : 0,
    usedMemory: '2.1M',
    maxMemory: '256M',
    evictions: metrics.evictions,
  }
}

export function getMetricsHistory(seconds: number) {
  const cutoff = Date.now() - seconds * 1000
  return metrics.latencyHistory.filter(e => e.timestamp >= cutoff)
}

// --- Product DB ---

export function getProduct(id: number): ProductRecord | null {
  return productDb.get(id) ?? null
}

export function updateProduct(id: number, updates: Record<string, unknown>): ProductRecord | null {
  const product = productDb.get(id)
  if (!product) return null
  const updated = { ...product, ...updates } as ProductRecord
  productDb.set(id, updated)
  return updated
}
