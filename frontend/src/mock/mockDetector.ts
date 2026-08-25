import axios from 'axios'
import { setMockMode } from './mockInterceptor'

export async function detectAndSetMode(): Promise<boolean> {
  try {
    await axios.get('/api/v1/cache/info', { timeout: 3000 })
    setMockMode(false)
    return false
  } catch {
    setMockMode(true)
    return true
  }
}
