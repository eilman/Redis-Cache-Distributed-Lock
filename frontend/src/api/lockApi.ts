import client from './client'

export const lockApi = {
  acquire: (lockName: string, leaseTimeMs = 10000, waitTimeMs = 5000) =>
    client.post('/lock/acquire', { lockName, leaseTimeMs, waitTimeMs }),
  release: (lockName: string) => client.post('/lock/release', { lockName }),
  status: (lockName: string) => client.get(`/lock/${lockName}/status`),
  scheduledJob: (jobName: string, instanceCount = 3) =>
    client.post('/lock/demo/scheduled-job', { jobName, instanceCount }),
  mechanicsTrySetNx: (key: string, uuid: string, pxMs: number) =>
    client.post('/lock/demo/mechanics/try-set-nx', { key, uuid, pxMs }),
  mechanicsCheck: (key: string) =>
    client.post('/lock/demo/mechanics/check', { key }),
  mechanicsRelease: (key: string, uuid: string) =>
    client.post('/lock/demo/mechanics/release', { key, uuid }),
  mechanicsRace: (key: string, pxMs: number) =>
    client.post('/lock/demo/mechanics/race', { key, pxMs }),
}

export const redlockApi = {
  acquire: (resource: string, leaseTimeMs = 10000, waitTimeMs = 5000) =>
    client.post('/demo/redlock/acquire', { resource, leaseTimeMs, waitTimeMs }),
  release: (resource: string) =>
    client.post('/demo/redlock/release', { resource }),
  scheduledJob: (jobName: string, instanceCount = 3) =>
    client.post('/demo/redlock/scheduled-job', { jobName, instanceCount }),
}
