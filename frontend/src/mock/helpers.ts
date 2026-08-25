export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function mockUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function demoResult(
  data: unknown,
  source: string,
  executionTimeMs: number,
  logs?: Array<{ step: number; action: string; result: string; durationMs: number }>
) {
  return {
    success: true,
    data,
    metadata: { executionTimeMs, source },
    logs: logs ?? [],
  }
}

export function matchGlob(pattern: string, key: string): boolean {
  if (pattern === '*') return true
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
  return regex.test(key)
}
