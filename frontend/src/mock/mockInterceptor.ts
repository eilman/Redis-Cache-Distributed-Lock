import { AxiosInstance, AxiosHeaders, InternalAxiosRequestConfig } from 'axios'
import { handleMockRequest } from './mockHandlers'

let mockMode = true // safe default: start in mock mode, disable if backend found

export function isMockMode(): boolean {
  return mockMode
}

export function setMockMode(enabled: boolean): void {
  mockMode = enabled
  if (enabled) {
    console.log('[RedisDemo] Simulation mode ACTIVE')
  } else {
    console.log('[RedisDemo] Live backend mode ACTIVE')
  }
}

export function installMockInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (!mockMode) return config

    const mockResponse = await handleMockRequest(config)
    if (mockResponse) {
      config.adapter = async () => ({
        data: mockResponse.data,
        status: mockResponse.status,
        statusText: mockResponse.status === 200 ? 'OK' : 'Error',
        headers: new AxiosHeaders(),
        config,
      })
    }
    return config
  })
}
