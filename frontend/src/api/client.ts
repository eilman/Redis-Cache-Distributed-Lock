import axios from 'axios'
import { installMockInterceptor } from '../mock/mockInterceptor'

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

installMockInterceptor(client)

export default client
